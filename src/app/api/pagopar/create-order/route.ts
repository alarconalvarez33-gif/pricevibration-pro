import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const PLAN_PRICES: Record<string, { monthly: { pyg: number; usd: number }; yearly: { pyg: number; usd: number } }> = {
  pro: {
    monthly: { pyg: 340000, usd: 49 },
    yearly: { pyg: 3145000, usd: 470 },  // $49 x 12 = $588, 20% off = $470
  },
  whale: {
    monthly: { pyg: 693900, usd: 100 },
    yearly: { pyg: 6660000, usd: 960 },  // $100 x 12 = $1200, 20% off = $960
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
    // Ensure monto is integer (Guaraníes, no decimals)
    const monto = Math.floor(prices.pyg)

    // Generate unique order ID: timestamp + userId suffix
    const timestamp = Date.now()
    const orderId = `SL-${planType.toUpperCase()}-${user.id.slice(-6)}-${timestamp}`

    console.log('💰 Monto calculado:', monto, 'PYG')
    console.log('🆔 Order ID generado:', orderId)

    // Create token: sha1(comercio_token_privado + idPedido + strval(floatval(monto_total)))
    // Matching PHP: sha1($datos['comercio_token_privado'] . $idPedido . strval(floatval($j['monto_total'])))
    const montoString = monto.toString()
    const tokenString = `${privateKey}${orderId}${montoString}`
    const token = crypto
      .createHash('sha1')
      .update(tokenString)
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
      comprador_telefono: '0981000000',
      comprador_documento: '1000000',
      comprador_razon_social: user.name || user.email,
      id_pedido_comercio: orderId,
      descripcion: `SacredLevels ${planLabel} - ${periodLabel}`,
      monto_total: montoString,
      moneda: 'PYG',
      tipo_pedido: 'VENTA-COMERCIO',
      forma_pago: '9',
      hash: token,
    }

    console.log('Token calc:', `${privateKey}${orderId}${montoString}`)
    console.log('Token hash:', token)

    console.log('\n' + '='.repeat(80))
    console.log('🔵 PAGOPAR API REQUEST')
    console.log('='.repeat(80))
    console.log('📍 URL:', 'https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion')
    console.log('🔑 Public Key:', publicKey)
    console.log('🔒 Private Key (primeros 10):', privateKey?.substring(0, 10) + '...')
    console.log('📦 Request Body:')
    console.log(JSON.stringify(pagoparBody, null, 2))
    console.log('='.repeat(80) + '\n')

    const response = await fetch('https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagoparBody),
    })

    const result = await response.json()

    console.log('\n' + '='.repeat(80))
    console.log('📥 PAGOPAR API RESPONSE')
    console.log('='.repeat(80))
    console.log('📊 HTTP Status:', response.status, response.ok ? '✅' : '❌')
    console.log('📄 Response Body:')
    console.log(JSON.stringify(result, null, 2))

    if (result.error) {
      console.error('❌ Error de Pagopar:', result.error)
      console.error('❌ Mensaje:', result.mensaje || result.message || 'Sin mensaje de error')
    }

    if (result.resultado) {
      console.log('✅ Resultado recibido:', typeof result.resultado, Array.isArray(result.resultado) ? `Array[${result.resultado.length}]` : 'Object')
    }
    console.log('='.repeat(80) + '\n')

    // Extract hash from Pagopar response
    let pagoparHash: string | null = null

    if (result.resultado && Array.isArray(result.resultado) && result.resultado[0]?.data) {
      pagoparHash = result.resultado[0].data
      console.log('✅ Hash extraído de resultado[0].data:', pagoparHash)
    } else if (result.resultado?.data) {
      pagoparHash = result.resultado.data
      console.log('✅ Hash extraído de resultado.data:', pagoparHash)
    } else if (result.data) {
      pagoparHash = result.data
      console.log('✅ Hash extraído de data:', pagoparHash)
    }

    if (!pagoparHash) {
      console.error('\n' + '❌'.repeat(40))
      console.error('❌ ERROR: No se pudo extraer el hash de Pagopar')
      console.error('❌ Respuesta completa:', JSON.stringify(result, null, 2))
      console.error('❌ Status HTTP:', response.status)
      console.error('❌ Error de Pagopar:', result.error || result.mensaje || 'Sin mensaje')
      console.error('❌'.repeat(40) + '\n')

      // Mark payment as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      })

      return NextResponse.json({
        error: 'No se pudo generar la sesión de pago',
        pagoparError: result.error || result.mensaje || result.message || 'Error desconocido de Pagopar',
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
