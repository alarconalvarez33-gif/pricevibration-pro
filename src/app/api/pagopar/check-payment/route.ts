import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hash = searchParams.get('hash')

    if (!hash) {
      return NextResponse.json(
        {
          status: 'not_found',
          message: 'Hash de pago no proporcionado',
        },
        { status: 400 }
      )
    }

    // Buscar el pago por el hash de Pagopar
    const payment = await prisma.payment.findFirst({
      where: {
        pagoparHash: hash,
      },
      include: {
        user: {
          select: {
            email: true,
            isPremium: true,
            premiumUntil: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        {
          status: 'not_found',
          message: 'No se encontró información sobre este pago',
        },
        { status: 404 }
      )
    }

    // Preparar la respuesta con los detalles del pago
    const response = {
      status: payment.status as 'pending' | 'paid' | 'failed',
      orderId: payment.orderId,
      planType: payment.planType,
      billingPeriod: payment.billingPeriod,
      amount: payment.amount,
      currency: payment.currency || 'PYG',
      paidAt: payment.paidAt?.toISOString(),
      createdAt: payment.createdAt.toISOString(),
      message:
        payment.status === 'paid'
          ? '¡Pago completado exitosamente!'
          : payment.status === 'failed'
          ? 'El pago no pudo ser procesado'
          : 'Esperando confirmación del pago',
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      {
        status: 'not_found',
        message: 'Error al verificar el estado del pago',
      },
      { status: 500 }
    )
  }
}
