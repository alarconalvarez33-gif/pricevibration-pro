import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(
  request: Request,
  { params }: { params: { hash: string } }
) {
  try {
    const hashPedido = params.hash
    const body = await request.json()
    console.log('Webhook recibido para hash:', hashPedido, JSON.stringify(body, null, 2))

    const { pagado, numero_pedido, token } = body

    // CRITICAL: Validate the token - sha1(PRIV_KEY + hash_pedido) === token
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY
    if (!privateKey) {
      console.error('PAGOPAR_PRIVATE_KEY not configured')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const expectedToken = crypto
      .createHash('sha1')
      .update(`${privateKey}${hashPedido}`)
      .digest('hex')

    if (token !== expectedToken) {
      console.error('Token inválido - posible intento de fraude', {
        received: token,
        expected: expectedToken,
        hash_pedido: hashPedido,
      })
      return NextResponse.json({ error: 'Token inválido' }, { status: 403 })
    }

    // Find payment by order ID
    const payment = await prisma.payment.findUnique({
      where: { orderId: numero_pedido },
      include: { user: true },
    })

    if (!payment) {
      console.error('Pago no encontrado:', numero_pedido)
      return NextResponse.json(body)
    }

    // Process payment result
    if (pagado === true || pagado === 'true') {
      // Calculate premium expiration based on billing period
      const premiumUntil = new Date()
      if (payment.billingPeriod === 'yearly') {
        premiumUntil.setFullYear(premiumUntil.getFullYear() + 1)
      } else {
        premiumUntil.setDate(premiumUntil.getDate() + 30)
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      })

      // Activate user premium
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          isPremium: true,
          premiumUntil,
          plan: payment.planType,
        },
      })

      console.log(
        `Usuario ${payment.user.email} actualizado a ${payment.planType} (${payment.billingPeriod}) hasta ${premiumUntil.toISOString()}`
      )
    } else {
      // Payment was not successful
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      })

      console.log(`Pago fallido para pedido ${numero_pedido}`)
    }

    // MUST return 200 with the same JSON received
    return NextResponse.json(body)
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({}, { status: 200 })
  }
}

// GET for Pagopar URL validation
export async function GET(
  _request: Request,
  { params }: { params: { hash: string } }
) {
  return NextResponse.json({ status: 'ok', service: 'pagopar-webhook', hash: params.hash })
}
