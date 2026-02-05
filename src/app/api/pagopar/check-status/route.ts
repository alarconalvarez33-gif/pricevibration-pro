import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId es requerido' }, { status: 400 })
    }

    // Verify the payment belongs to this user
    const payment = await prisma.payment.findUnique({
      where: { orderId },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || payment.userId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const privateKey = process.env.PAGOPAR_PRIVATE_KEY
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY

    if (!privateKey || !publicKey) {
      return NextResponse.json({ error: 'Pasarela de pago no configurada' }, { status: 500 })
    }

    // Token for status check: sha1(PAGOPAR_PRIVATE_KEY + "CONSULTA")
    const token = crypto
      .createHash('sha1')
      .update(`${privateKey}CONSULTA`)
      .digest('hex')

    const pagoparBody = {
      token: publicKey,
      hash_pedido: payment.pagoparHash,
      hash: token,
    }

    const response = await fetch('https://api.pagopar.com/api/pedidos/1.1/traer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagoparBody),
    })

    const result = await response.json()
    console.log('Pagopar check-status response:', JSON.stringify(result, null, 2))

    return NextResponse.json({
      success: true,
      localStatus: payment.status,
      pagoparResponse: result,
    })
  } catch (error) {
    console.error('Check status error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
