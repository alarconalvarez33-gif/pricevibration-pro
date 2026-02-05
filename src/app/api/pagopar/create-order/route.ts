import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const PLAN_PRICES: Record<string, { monthly: { pyg: number; usd: number }; yearly: { pyg: number; usd: number } }> = {
  pro: {
    monthly: { pyg: 200000, usd: 29 },
    yearly: { pyg: 1900000, usd: 278 },
  },
  whale: {
    monthly: { pyg: 700000, usd: 99 },
    yearly: { pyg: 6500000, usd: 948 },
  },
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const body = await request.json()
    const { planType, billingPeriod = 'monthly' } = body

    if (!planType || !['pro', 'whale'].includes(planType)) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }

    if (!['monthly', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json({ error: 'Período de facturación inválido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const privateKey = process.env.PAGOPAR_PRIVATE_KEY
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY

    if (!privateKey || !publicKey) {
      console.error('Pagopar keys not configured')
      return NextResponse.json({ error: 'Pasarela de pago no configurada' }, { status: 500 })
    }

    const prices = PLAN_PRICES[planType][billingPeriod as 'monthly' | 'yearly']
    const monto = prices.pyg

    // Generate unique order ID: timestamp + userId suffix
    const timestamp = Date.now()
    const orderId = `${planType.toUpperCase()}-${billingPeriod === 'yearly' ? 'Y' : 'M'}-${user.id.slice(-6)}-${timestamp}`

    // Create token: sha1(PAGOPAR_PRIVATE_KEY + idPedido + monto_total)
    const token = crypto
      .createHash('sha1')
      .update(`${privateKey}${orderId}${monto}`)
      .digest('hex')

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId: user.id,
        planType,
        billingPeriod,
        amount: monto,
        currency: 'PYG',
        amountUsd: prices.usd,
        status: 'pending',
      },
    })

    const periodLabel = billingPeriod === 'yearly' ? 'Anual' : 'Mensual'
    const planLabel = planType.charAt(0).toUpperCase() + planType.slice(1)

    // Call Pagopar API v2.0
    const pagoparBody = {
      token: publicKey,
      comprador_email: user.email,
      comprador_telefono: '0000000000',
      comprador_documento: '0000000',
      comprador_razon_social: user.name || user.email,
      id_pedido: orderId,
      descripcion: `SacredLevels ${planLabel} - Suscripción ${periodLabel}`,
      monto: monto.toString(),
      moneda: 'PYG',
      hash: token,
    }

    const response = await fetch('https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagoparBody),
    })

    const result = await response.json()
    console.log('Pagopar create-order response:', JSON.stringify(result, null, 2))

    // Extract hash from Pagopar response
    let pagoparHash: string | null = null

    if (result.resultado && Array.isArray(result.resultado) && result.resultado[0]?.data) {
      pagoparHash = result.resultado[0].data
    } else if (result.resultado?.data) {
      pagoparHash = result.resultado.data
    } else if (result.data) {
      pagoparHash = result.data
    }

    if (!pagoparHash) {
      console.error('Pagopar error - no hash received:', result)
      // Mark payment as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      })
      return NextResponse.json({
        error: 'Error al crear el pedido en Pagopar',
        details: result,
      }, { status: 500 })
    }

    // Update payment with Pagopar hash
    await prisma.payment.update({
      where: { id: payment.id },
      data: { pagoparHash },
    })

    // Return payment URL
    return NextResponse.json({
      success: true,
      hash: pagoparHash,
      paymentUrl: `https://www.pagopar.com/pagos/${pagoparHash}`,
      orderId,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
