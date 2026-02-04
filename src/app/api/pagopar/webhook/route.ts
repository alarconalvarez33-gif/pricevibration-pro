import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Webhook recibido:', JSON.stringify(body, null, 2))

    const { hash_pedido, pagado, numero_pedido, token } = body

    // Validate the token: sha1(PRIV_KEY + hash_pedido) == token
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY
    if (privateKey) {
      const expectedToken = crypto.createHash('sha1').update(`${privateKey}${hash_pedido}`).digest('hex')
      if (token !== expectedToken) {
        console.error('Token inválido')
        // Still return the body to avoid Pagopar retrying
        return NextResponse.json(body)
      }
    }

    // Find payment by order number
    const payment = await prisma.payment.findUnique({
      where: { numeroPedido: numero_pedido },
      include: { user: true },
    })

    if (!payment) {
      console.error('Pago no encontrado:', numero_pedido)
      return NextResponse.json(body)
    }

    // Check if payment is successful
    if (pagado === true || pagado === 'true') {
      // Calculate expiration (30 days)
      const premiumUntil = new Date()
      premiumUntil.setDate(premiumUntil.getDate() + 30)

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      })

      // Update user plan
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          isPremium: true,
          premiumUntil,
          plan: payment.planType,
        },
      })

      console.log(`Usuario ${payment.user.email} actualizado a ${payment.planType} hasta ${premiumUntil}`)
    }

    // Respond with the same JSON that Pagopar sent
    return NextResponse.json(body)

  } catch (error) {
    console.error('Webhook error:', error)
    // Return empty object on error
    return NextResponse.json({})
  }
}

// GET for Pagopar URL validation
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'pagopar-webhook' })
}
