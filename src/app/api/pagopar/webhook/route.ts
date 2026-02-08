import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const WEBHOOK_TOKEN = '85ece630fff92520e3943f1f2a8d3c60'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Webhook Pagopar recibido:', JSON.stringify(body, null, 2))

    const { pagado, numero_pedido, hash_pedido, token } = body

    // Validar token del webhook
    if (token !== WEBHOOK_TOKEN) {
      console.error('Token inválido - posible fraude', {
        received: token,
        expected: WEBHOOK_TOKEN,
      })
      return NextResponse.json({ error: 'Token inválido' }, { status: 403 })
    }

    if (!hash_pedido || !numero_pedido) {
      console.error('Missing hash_pedido or numero_pedido')
      return NextResponse.json(body, { status: 200 })
    }

    // Buscar el pago en la base de datos
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { orderId: numero_pedido },
          { pagoparHash: hash_pedido },
        ],
      },
      include: { user: true },
    })

    if (!payment) {
      console.error('Pago no encontrado:', numero_pedido, hash_pedido)
      return NextResponse.json(body, { status: 200 })
    }

    // Procesar resultado del pago
    if (pagado === true || pagado === 'true' || pagado === '1' || pagado === 1) {
      const premiumUntil = new Date()
      if (payment.billingPeriod === 'yearly') {
        premiumUntil.setFullYear(premiumUntil.getFullYear() + 1)
      } else {
        premiumUntil.setMonth(premiumUntil.getMonth() + 1)
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      })

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          isPremium: true,
          premiumUntil,
          plan: payment.planType,
        },
      })

      console.log(
        `✅ Usuario ${payment.user.email} actualizado a ${payment.planType} hasta ${premiumUntil.toISOString()}`
      )
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      })

      console.log(`❌ Pago fallido para pedido ${numero_pedido}`)
    }

    // Devolver el mismo body que recibimos
    return NextResponse.json(body, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({}, { status: 200 })
  }
}

// GET para validación de URL
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'pagopar-webhook',
    timestamp: new Date().toISOString()
  }, { status: 200 })
}
