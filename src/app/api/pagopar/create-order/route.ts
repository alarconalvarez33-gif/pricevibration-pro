import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const PLAN_PRICES: Record<string, { monthly: { pyg: number; usd: number }; yearly: { pyg: number; usd: number } }> = {
  pro: {
    monthly: { pyg: 180000, usd: 30 },
    yearly: { pyg: 1800000, usd: 300 },
  },
  quantum: {
    monthly: { pyg: 180000, usd: 30 },
    yearly: { pyg: 1800000, usd: 300 },
  },
  ser: {
    monthly: { pyg: 89000, usd: 13 },
    yearly: { pyg: 890000, usd: 130 },
  },
  'ser-plus': {
    monthly: { pyg: 249000, usd: 38 },
    yearly: { pyg: 2490000, usd: 380 },
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

    if (!planType || !['pro', 'quantum', 'ser', 'ser-plus'].includes(planType)) {
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

    // Trim keys to avoid whitespace issues in env vars
    const privateKey = (process.env.PAGOPAR_PRIVATE_KEY || '').trim()
    const publicKey = (process.env.PAGOPAR_PUBLIC_KEY || '').trim()

    if (!privateKey || !publicKey) {
      console.error('Pagopar keys not configured')
      return NextResponse.json({ error: 'Pasarela de pago no configurada' }, { status: 500 })
    }

    console.log('🔑 Private key (primeros 8):', privateKey.substring(0, 8) + '...')
    console.log('🔑 Public key (primeros 8):', publicKey.substring(0, 8) + '...')

    const prices = PLAN_PRICES[planType][billingPeriod as 'monthly' | 'yearly']
    // Ensure monto is integer (Guaraníes, no decimals)
    const monto = Math.floor(prices.pyg)

    // Generate unique order ID: timestamp + userId suffix
    const timestamp = Date.now()
    const orderId = `SL-${planType.toUpperCase()}-${user.id.slice(-6)}-${timestamp}`

    console.log('💰 Monto calculado:', monto, 'PYG')
    console.log('🆔 Order ID generado:', orderId)

    // Token: sha1(PRIVATE_KEY + id_pedido_comercio + strval(floatval(monto_total)))
    const tokenString = privateKey + orderId + String(parseFloat(String(monto)))
    const token = crypto.createHash('sha1').update(tokenString).digest('hex')

    console.log('🔐 Token string:', tokenString)
    console.log('🔐 Token SHA1:', token)

    const periodLabel = billingPeriod === 'yearly' ? 'Anual' : 'Mensual'
    const PLAN_LABELS: Record<string, string> = {
      pro: 'Sacred Levels Pro',
      quantum: 'Quantum Access',
      ser: 'Plan SER',
      'ser-plus': 'Plan SER+',
    }
    const planLabel = PLAN_LABELS[planType] || planType
    const descripcion = `${planLabel} - THE MENTOR`

    // Fecha máxima de pago: 7 días desde ahora
    const fechaMaxima = new Date()
    fechaMaxima.setDate(fechaMaxima.getDate() + 7)
    const fechaMaximaStr = fechaMaxima.toISOString().slice(0, 19).replace('T', ' ')

    // Estructura oficial de Pagopar API 2.0
    const pagoparBody = {
      token: token,
      comprador: {
        ruc: '',
        email: user.email,
        ciudad: '1',
        nombre: user.name || user.email,
        telefono: '0971000000',
        direccion: '',
        documento: '1000000',
        coordenadas: '',
        razon_social: '',
        tipo_documento: 'CI',
        direccion_referencia: ''
      },
      public_key: publicKey,
      monto_total: monto,
      tipo_pedido: 'VENTA-COMERCIO',
      compras_items: [
        {
          ciudad: '1',
          nombre: descripcion,
          cantidad: 1,
          categoria: '909',
          public_key: publicKey,
          url_imagen: '',
          descripcion: `Suscripción ${periodLabel} ${planLabel}`,
          id_producto: 1,
          precio_total: monto,
          vendedor_telefono: '',
          vendedor_direccion: '',
          vendedor_direccion_referencia: '',
          vendedor_direccion_coordenadas: ''
        }
      ],
      fecha_maxima_pago: fechaMaximaStr,
      id_pedido_comercio: orderId,
      descripcion_resumen: descripcion,
      forma_pago: 9
    }

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

    if (result.respuesta === true && result.resultado && Array.isArray(result.resultado) && result.resultado[0]?.data) {
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

      return NextResponse.json({
        error: 'No se pudo generar la sesión de pago',
        pagoparError: result.error || result.mensaje || result.message || 'Error desconocido de Pagopar',
        details: result,
      }, { status: 500 })
    }

    // Only save to DB once we have a valid hash (user is actually being redirected to pay)
    await prisma.payment.create({
      data: {
        orderId,
        userId: user.id,
        planType,
        billingPeriod,
        amount: monto,
        currency: 'PYG',
        amountUsd: prices.usd,
        status: 'pending',
        pagoparHash,
      },
    })

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
