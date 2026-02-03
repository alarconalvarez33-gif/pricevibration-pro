import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * API Route para crear Stripe Checkout Session
 *
 * INSTRUCCIONES PARA CONFIGURAR STRIPE:
 * 1. npm install stripe
 * 2. Agregar STRIPE_SECRET_KEY al .env
 * 3. Crear productos y precios en dashboard.stripe.com
 * 4. Reemplazar los price_xxx con IDs reales
 */

// Mapa de precios (reemplazar con IDs reales de Stripe)
const PRICE_IDS = {
  pro_monthly: 'price_pro_monthly',
  pro_yearly: 'price_pro_yearly',
  whale_monthly: 'price_whale_monthly',
  whale_yearly: 'price_whale_yearly',
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { priceId, period } = body

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // ============================================
    // STRIPE INTEGRATION (descomentar cuando esté configurado)
    // ============================================

    /*
    import Stripe from 'stripe'

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    })

    // Buscar o crear cliente en Stripe
    let customer: Stripe.Customer
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      })
    }

    // Crear Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
    */

    // Respuesta temporal para desarrollo
    return NextResponse.json({
      message: 'Stripe not configured yet',
      demo: true,
      url: '/dashboard?demo_payment=true',
      priceId,
      period,
      user: session.user.email,
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
