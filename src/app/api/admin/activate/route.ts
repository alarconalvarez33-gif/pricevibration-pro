import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { activatePayment, activateProductPurchase } from '@/lib/services/payment-activation'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

// Map UI product keys → DB productId and metadata
const PRODUCTS: Record<string, {
  displayName: string
  dbProductId: string
  price: number
  priceUsd?: number
  planType?: string   // set for subscription plans (quantum, ser, ser-plus)
  setCursoPurchased: boolean
}> = {
  'genesis':          { displayName: 'Genesis',            dbProductId: 'expansion-matematica', price: 500000, setCursoPurchased: false },
  'canal-paralelo':   { displayName: 'Canal Paralelo',     dbProductId: 'canal-paralelo',        price: 320000, setCursoPurchased: false },
  'fibonacci':        { displayName: 'Fibonacci Avanzado', dbProductId: 'fibonacci',             price: 320000, setCursoPurchased: false },
  'super-estrategia': { displayName: 'Super Estrategia',   dbProductId: 'super-estrategia',      price: 65000,  setCursoPurchased: true  },
  'quantum-access':   { displayName: 'Quantum Access',     dbProductId: '',                      price: 180000, priceUsd: 25, planType: 'quantum',   setCursoPurchased: false },
  'ser':              { displayName: 'Plan SER',           dbProductId: '',                      price: 130000, priceUsd: 20, planType: 'ser',        setCursoPurchased: false },
  'ser-plus':         { displayName: 'Plan SER+',          dbProductId: '',                      price: 260000, priceUsd: 40, planType: 'ser-plus',   setCursoPurchased: false },
  'metalevels':       { displayName: 'MetaLevels',         dbProductId: 'metalevels',            price: 150000, setCursoPurchased: false },
  'adx':              { displayName: 'Estrategia ADX',     dbProductId: 'adx',                   price: 150000, setCursoPurchased: false },
  'frecuencia':       { displayName: 'Frecuencia',         dbProductId: 'frecuencia',            price: 200000, setCursoPurchased: false },
}

function isAdmin(email: string | null | undefined) {
  return !!email && ADMIN_EMAILS.includes(email)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const adminEmail = session!.user!.email!

    // ── Mode 1: activate by pending payment/purchase ID (from pending list) ──
    if (body.pendingId && body.pendingType) {
      const params = { source: 'admin_manual' as const, triggeredBy: adminEmail }
      const result = body.pendingType === 'subscription'
        ? await activatePayment(body.pendingId, params)
        : await activateProductPurchase(body.pendingId, params)

      if (!result.success) {
        return NextResponse.json({ error: result.errorMsg }, { status: 400 })
      }
      return NextResponse.json({
        success: true,
        message: result.alreadyProcessed
          ? `⚠️ Ya estaba activado: ${result.userEmail}`
          : `✓ Acceso activado para ${result.userEmail} (${result.product})`,
      })
    }

    // ── Mode 2: activate by email + productKey (quick activation form) ───────
    const { email, productKey } = body
    if (!email?.trim() || !productKey) {
      return NextResponse.json({ error: 'Email y producto son requeridos.' }, { status: 400 })
    }

    const product = PRODUCTS[productKey]
    if (!product) {
      return NextResponse.json({ error: 'Producto inválido.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (!user) {
      return NextResponse.json({ error: `Usuario no encontrado: ${email}` }, { status: 404 })
    }

    const params = { source: 'admin_manual' as const, triggeredBy: adminEmail }

    if (product.planType) {
      const alreadyActive = user.plan === product.planType && user.isPremium
      if (alreadyActive) {
        return NextResponse.json({
          warning: `${email} ya tiene ${product.displayName} activo.`,
          alreadyHad: true,
        })
      }
      // Subscription plans: create a synthetic Payment record → activatePayment handles SerSubscription too
      const syntheticPayment = await prisma.payment.create({
        data: {
          orderId: `MANUAL-ADMIN-${Date.now()}`,
          userId: user.id,
          planType: product.planType,
          billingPeriod: 'monthly',
          amount: product.price,
          currency: 'PYG',
          amountUsd: product.priceUsd ?? 0,
          status: 'pending',
        },
      })
      await activatePayment(syntheticPayment.id, params)
      return NextResponse.json({
        success: true,
        message: `✓ ${product.displayName} activado para ${email} (30 días)`,
      })
    }

    // Course: check existing
    const existing = await prisma.productPurchase.findFirst({
      where: { userId: user.id, productId: product.dbProductId, status: 'paid' },
    })
    if (existing) {
      return NextResponse.json({
        warning: `${email} ya tiene acceso a ${product.displayName}.`,
        alreadyHad: true,
      })
    }

    // Create purchase and activate via shared service
    const syntheticPurchase = await prisma.productPurchase.create({
      data: {
        userId: user.id,
        productId: product.dbProductId,
        orderId: `MANUAL-ADMIN-${Date.now()}`,
        price: product.price,
        status: 'pending',
      },
    })
    const result = await activateProductPurchase(syntheticPurchase.id, params)

    return NextResponse.json({
      success: true,
      message: `✓ Acceso a ${product.displayName} activado para ${email}`,
    })
  } catch (error) {
    console.error('[POST /api/admin/activate]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}

// GET — recent activations log (last 40)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const purchases = await prisma.productPurchase.findMany({
      where: { status: 'paid' },
      orderBy: { paidAt: 'desc' },
      take: 40,
      include: { user: { select: { email: true } } },
    })

    const quantumLogs = await prisma.subscriptionLog.findMany({
      where: { event: 'activated' },
      orderBy: { createdAt: 'desc' },
      take: 40,
      include: { user: { select: { email: true } } },
    })

    const purchaseRows = purchases.map(p => ({
      id: p.id,
      date: p.paidAt ?? p.createdAt,
      email: p.user.email,
      product: p.productId,
      type: 'course',
      source: p.orderId?.startsWith('MANUAL-ADMIN-') ? 'manual' : 'pagopar',
    }))

    const quantumRows = quantumLogs.map(l => ({
      id: l.id,
      date: l.createdAt,
      email: l.user.email,
      product: l.plan ?? 'quantum',
      type: 'subscription',
      source: l.note?.includes('admin_manual') ? 'manual' : 'pagopar',
    }))

    const all = [...purchaseRows, ...quantumRows]
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
      .slice(0, 40)

    return NextResponse.json({ activations: all })
  } catch (error) {
    console.error('[GET /api/admin/activate]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
