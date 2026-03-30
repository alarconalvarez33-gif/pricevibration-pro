import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const PRIVATE_KEY = '85ece630fff92520e3943f1f2a8d3c60'
const PUBLIC_KEY  = '8ca1a050e7f2f5d2e0d1f4de644ae562'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ hasAccess: false, error: 'No autenticado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, cursoPurchased: true },
    })

    if (!user) return NextResponse.json({ hasAccess: false })

    // Ya tiene acceso — nada que verificar
    if (user.cursoPurchased) return NextResponse.json({ hasAccess: true })

    // Buscar la compra pendiente más reciente con hash de Pagopar
    const purchase = await prisma.productPurchase.findFirst({
      where: {
        userId: user.id,
        productId: 'super-estrategia',
        status: 'pending',
        pagoparHash: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!purchase?.pagoparHash) {
      return NextResponse.json({ hasAccess: false, message: 'No hay pago pendiente' })
    }

    // Consultar estado real en Pagopar
    const token = crypto.createHash('sha1').update(PRIVATE_KEY + 'CONSULTA').digest('hex')

    const res = await fetch('https://api.pagopar.com/api/pedidos/1.1/traer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: PUBLIC_KEY,
        hash_pedido: purchase.pagoparHash,
        hash: token,
      }),
    })

    const data = await res.json()
    console.log('📡 verify-curso Pagopar response:', JSON.stringify(data))

    const resultado = data.resultado?.[0] || data
    const pagado = resultado.pagado === true || resultado.pagado === 'true' ||
                   resultado.pagado === '1' || resultado.pagado === 1

    if (pagado) {
      // Activar acceso
      await prisma.productPurchase.update({
        where: { id: purchase.id },
        data: { status: 'paid', paidAt: new Date() },
      })
      await prisma.user.update({
        where: { id: user.id },
        data: { cursoPurchased: true },
      })
      console.log(`✅ verify-curso: acceso activado para ${session.user.email}`)
      return NextResponse.json({ hasAccess: true })
    }

    return NextResponse.json({ hasAccess: false, message: 'Pago aún no confirmado por Pagopar' })
  } catch (error) {
    console.error('verify-curso error:', error)
    return NextResponse.json({ hasAccess: false, error: 'Error interno' }, { status: 500 })
  }
}
