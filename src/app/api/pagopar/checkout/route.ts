import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Fixed prices in Guaranies (PYG)
const PLAN_PRICES_PYG: Record<string, number> = {
  pro: 217500,    // ~$29 USD
  whale: 742500,  // ~$99 USD
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const body = await request.json()
    const { planType } = body

    if (!planType || !['pro', 'whale'].includes(planType)) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
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
      return NextResponse.json({ error: 'Pagopar no configurado' }, { status: 500 })
    }

    // Generate unique order ID
    const timestamp = Date.now()
    const idPedido = `${planType.toUpperCase()}-${user.id.slice(-6)}-${timestamp}`
    const monto = PLAN_PRICES_PYG[planType]

    // Create hash using SHA1: sha1(PRIV_KEY + idPedido + monto)
    const token = crypto.createHash('sha1').update(`${privateKey}${idPedido}${monto}`).digest('hex')

    // Save payment in database
    await prisma.payment.create({
      data: {
        numeroPedido: idPedido,
        userId: user.id,
        planType,
        amountUsd: planType === 'pro' ? 29 : 99,
        amountPyg: monto,
        status: 'pending',
      },
    })

    // Pagopar API v2.0 request
    const pagoparBody = {
      token: publicKey,
      comprador_email: user.email,
      comprador_telefono: '0000000000',
      comprador_documento: '0000000',
      comprador_razon_social: user.name || user.email,
      id_pedido: idPedido,
      descripcion: `PriceVibration ${planType.charAt(0).toUpperCase() + planType.slice(1)} - Suscripción Mensual`,
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

    if (result.respuesta && result.respuesta.status === 'success' && result.data) {
      // Update payment with Pagopar hash
      await prisma.payment.update({
        where: { numeroPedido: idPedido },
        data: { pagoparToken: result.data },
      })

      // Return redirect URL
      return NextResponse.json({
        success: true,
        redirectUrl: `https://pagopar.com/pagos/${result.data}`,
      })
    } else {
      console.error('Pagopar error:', result)
      return NextResponse.json({
        error: 'Error al crear pago',
        details: result
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
