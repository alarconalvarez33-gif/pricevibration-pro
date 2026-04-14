import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'productId requerido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // 1. Already paid in DB
    const paid = await prisma.productPurchase.findFirst({
      where: { userId: user.id, productId, status: 'paid' },
    })
    if (paid) {
      return NextResponse.json({ status: 'paid', productId })
    }

    // 2. Find most recent pending purchase
    const pending = await prisma.productPurchase.findFirst({
      where: { userId: user.id, productId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    })

    if (!pending || !pending.pagoparHash) {
      return NextResponse.json({ status: 'not_found', productId })
    }

    // 3. Query Pagopar directly to check current status
    const privateKey = (process.env.PAGOPAR_PRIVATE_KEY || '').trim()
    const publicKey  = (process.env.PAGOPAR_PUBLIC_KEY  || '').trim()

    if (privateKey && publicKey) {
      try {
        const token = crypto
          .createHash('sha1')
          .update(`${privateKey}CONSULTA`)
          .digest('hex')

        const pagoparResponse = await fetch('https://api.pagopar.com/api/pedidos/1.1/traer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: publicKey,
            hash_pedido: pending.pagoparHash,
            hash: token,
          }),
        })

        const pagoparData = await pagoparResponse.json()
        console.log('📡 check-product-payment Pagopar:', JSON.stringify(pagoparData))

        const resultado = pagoparData.resultado?.[0] || pagoparData
        const pagado = resultado.pagado

        if (pagado === true || pagado === 'true' || pagado === '1' || pagado === 1) {
          // Mark purchase as paid
          await prisma.productPurchase.update({
            where: { id: pending.id },
            data: { status: 'paid', paidAt: new Date() },
          })

          // Product-specific side effects
          if (productId === 'fisica-cuantica') {
            await prisma.quantumAccess.updateMany({
              where: { userId: user.id },
              data: { isPaid: true },
            })
          } else if (productId === 'super-estrategia') {
            await prisma.user.update({
              where: { id: user.id },
              data: { cursoPurchased: true },
            })
          }

          console.log(`✅ check-product-payment: ${productId} confirmado para ${user.email}`)
          return NextResponse.json({ status: 'paid', productId })
        }
      } catch (err) {
        console.error('Error verificando con Pagopar en check-product-payment:', err)
      }
    }

    return NextResponse.json({ status: 'pending', productId })
  } catch (error) {
    console.error('check-product-payment error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
