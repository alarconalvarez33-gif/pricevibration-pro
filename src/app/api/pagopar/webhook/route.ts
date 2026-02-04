import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Plan durations in days
const PLAN_DURATIONS: Record<string, number> = {
  pro: 30,      // Monthly
  whale: 30,    // Monthly
  pro_yearly: 365,
  whale_yearly: 365,
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('Pagopar webhook received:', JSON.stringify(body, null, 2))

    // Extract payment data from webhook
    const {
      numero_pedido,
      pagado,
      monto_total,
      estado,
    } = body

    // Validate required fields
    if (!numero_pedido) {
      console.error('Missing numero_pedido in webhook')
      return NextResponse.json({ respuesta: 'ERROR', mensaje: 'Missing order number' }, { status: 400 })
    }

    // Find the payment in database
    const payment = await prisma.payment.findUnique({
      where: { numeroPedido: numero_pedido },
      include: { user: true },
    })

    if (!payment) {
      console.error(`Payment not found for order: ${numero_pedido}`)
      return NextResponse.json({ respuesta: 'ERROR', mensaje: 'Payment not found' }, { status: 404 })
    }

    // Check if payment is successful
    const isPaid = pagado === true || pagado === 'true' || estado === 'pagado'

    if (isPaid) {
      // Calculate premium expiration
      const isYearly = payment.amountUsd > 50 // If amount is greater than monthly, it's yearly
      const durationKey = isYearly ? `${payment.planType}_yearly` : payment.planType
      const durationDays = PLAN_DURATIONS[durationKey] || 30

      const premiumUntil = new Date()
      premiumUntil.setDate(premiumUntil.getDate() + durationDays)

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      })

      // Update user to premium with the appropriate plan
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          isPremium: true,
          premiumUntil,
          plan: payment.planType,
        },
      })

      console.log(`User ${payment.user.email} upgraded to ${payment.planType} until ${premiumUntil}`)

      return NextResponse.json({ respuesta: 'OK' })
    } else {
      // Payment not successful, update status
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      })

      console.log(`Payment failed for order: ${numero_pedido}`)
      return NextResponse.json({ respuesta: 'OK' })
    }

  } catch (error) {
    console.error('Webhook error:', error)
    // Always return OK to avoid Pagopar retrying
    return NextResponse.json({ respuesta: 'OK' })
  }
}

// Also handle GET requests for verification
export async function GET(request: Request) {
  return NextResponse.json({
    status: 'Pagopar webhook endpoint active',
    timestamp: new Date().toISOString(),
  })
}
