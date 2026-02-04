import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Plan prices in USD
const PLAN_PRICES: Record<string, number> = {
  pro: 29,
  whale: 99,
}

// Exchange rate USD to PYG (Guaranies)
const USD_TO_PYG = 7500 // Adjust this rate as needed

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to subscribe' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { planType, billingPeriod } = body

    // Validate plan type
    if (!planType || !['pro', 'whale'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type. Must be "pro" or "whale"' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate amounts
    let priceUsd = PLAN_PRICES[planType]

    // Apply yearly discount (20% off)
    if (billingPeriod === 'yearly') {
      priceUsd = Math.round(priceUsd * 12 * 0.8)
    }

    const pricePyg = Math.round(priceUsd * USD_TO_PYG)

    // Generate unique order number
    const timestamp = Date.now()
    const randomPart = crypto.randomBytes(4).toString('hex')
    const numeroPedido = `PV-${planType.toUpperCase()}-${timestamp}-${randomPart}`

    // Get Pagopar credentials
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY

    if (!publicKey || !privateKey) {
      console.error('Pagopar credentials not configured')
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        numeroPedido,
        userId: user.id,
        planType,
        amountUsd: priceUsd,
        amountPyg: pricePyg,
        status: 'pending',
      },
    })

    // Prepare Pagopar request data
    const descripcion = billingPeriod === 'yearly'
      ? `PriceVibration ${planType.charAt(0).toUpperCase() + planType.slice(1)} - Annual Subscription`
      : `PriceVibration ${planType.charAt(0).toUpperCase() + planType.slice(1)} - Monthly Subscription`

    // Create hash for security
    // Hash = SHA-256(privateKey + publicKey + numeroPedido + montoTotal)
    const hashString = `${privateKey}${publicKey}${numeroPedido}${pricePyg}`
    const hash = crypto.createHash('sha256').update(hashString).digest('hex')

    // Create hash for return URL
    const hashRetornoString = `${privateKey}${publicKey}${numeroPedido}`
    const hashRetorno = crypto.createHash('sha256').update(hashRetornoString).digest('hex')

    const pagoparData = {
      token: publicKey,
      comprador: {
        ruc: '0',
        email: user.email,
        telefono: '0',
        razon_social: user.name || user.email,
        tipo_documento: 'CI',
        documento: '0',
        direccion: 'N/A',
        ciudad: 1, // Asuncion
        ciudad_descripcion: 'Asuncion',
      },
      orden: {
        numero_pedido: numeroPedido,
        descripcion,
        monto_total: pricePyg.toString(),
        tipo_pedido: 'VENTA-SERVICIO',
        tipo_pago: 'CONTADO',
        fecha_maxima_pago: '', // No expiration
        id_carro_compra: 0,
        detalle: [
          {
            producto: {
              cantidad: 1,
              codigo_categoria_portal: 99, // Services
              id_producto: planType,
              nombre_producto: descripcion,
              precio_unitario: pricePyg.toString(),
            },
          },
        ],
      },
      url_retorno: `${process.env.NEXTAUTH_URL}/billing?payment=success&hash=${hashRetorno}`,
      hash,
    }

    // Make request to Pagopar API
    const pagoparResponse = await fetch('https://api.pagopar.com/api/comercios/1.1/iniciar-transaccion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pagoparData),
    })

    const pagoparResult = await pagoparResponse.json()

    if (!pagoparResponse.ok || pagoparResult.respuesta?.status === 'error') {
      console.error('Pagopar error:', pagoparResult)

      // Update payment as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      })

      return NextResponse.json(
        { error: 'Error creating payment session', details: pagoparResult },
        { status: 500 }
      )
    }

    // Update payment with Pagopar token
    if (pagoparResult.resultado?.data) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { pagoparToken: pagoparResult.resultado.data },
      })
    }

    // Return the redirect URL
    const redirectUrl = `https://pagopar.com/pagos/${pagoparResult.resultado?.data || ''}`

    return NextResponse.json({
      success: true,
      numeroPedido,
      redirectUrl,
      token: pagoparResult.resultado?.data,
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
