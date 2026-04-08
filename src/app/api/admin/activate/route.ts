import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

// Map UI product keys → DB productId and metadata
const PRODUCTS: Record<string, {
  displayName: string
  dbProductId: string      // productId stored in ProductPurchase
  price: number
  isQuantum: boolean       // updates User plan instead of creating ProductPurchase
  setCursoPurchased: boolean
}> = {
  'genesis':           { displayName: 'Genesis',             dbProductId: 'expansion-matematica', price: 500000,  isQuantum: false, setCursoPurchased: false },
  'canal-paralelo':    { displayName: 'Canal Paralelo',      dbProductId: 'canal-paralelo',        price: 320000,  isQuantum: false, setCursoPurchased: false },
  'fibonacci':         { displayName: 'Fibonacci Avanzado',  dbProductId: 'fibonacci',             price: 320000,  isQuantum: false, setCursoPurchased: false },
  'super-estrategia':  { displayName: 'Super Estrategia',    dbProductId: 'super-estrategia',      price: 65000,   isQuantum: false, setCursoPurchased: true  },
  'quantum-access':    { displayName: 'Quantum Access',      dbProductId: 'quantum-access',        price: 180000,  isQuantum: true,  setCursoPurchased: false },
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

    const { email, productKey } = await request.json()

    if (!email?.trim() || !productKey) {
      return NextResponse.json({ error: 'Email y producto son requeridos.' }, { status: 400 })
    }

    const product = PRODUCTS[productKey]
    if (!product) {
      return NextResponse.json({ error: 'Producto inválido.' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (!user) {
      return NextResponse.json({ error: `Usuario no encontrado: ${email}` }, { status: 404 })
    }

    // Quantum Access — update User directly
    if (product.isQuantum) {
      const alreadyQuantum = user.plan === 'quantum' && user.isPremium
      if (alreadyQuantum) {
        return NextResponse.json({
          warning: `${email} ya tiene Quantum Access activo.`,
          alreadyHad: true,
        })
      }
      const premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await prisma.user.update({
        where: { id: user.id },
        data: { isPremium: true, plan: 'quantum', subscriptionStatus: 'active', premiumUntil },
      })
      await prisma.subscriptionLog.create({
        data: { userId: user.id, event: 'activated', plan: 'quantum', note: 'Manual admin activation' },
      })
      return NextResponse.json({
        success: true,
        message: `✓ Quantum Access activado para ${email} (30 días)`,
      })
    }

    // Course — check existing purchase
    const existing = await prisma.productPurchase.findFirst({
      where: { userId: user.id, productId: product.dbProductId, status: 'paid' },
    })
    if (existing) {
      return NextResponse.json({
        warning: `${email} ya tiene acceso a ${product.displayName}.`,
        alreadyHad: true,
      })
    }

    // Create ProductPurchase
    await prisma.productPurchase.create({
      data: {
        userId: user.id,
        productId: product.dbProductId,
        orderId: `MANUAL-ADMIN-${Date.now()}`,
        price: product.price,
        status: 'paid',
        paidAt: new Date(),
      },
    })

    // Set cursoPurchased flag if needed
    if (product.setCursoPurchased) {
      await prisma.user.update({
        where: { id: user.id },
        data: { cursoPurchased: true },
      })
    }

    return NextResponse.json({
      success: true,
      message: `✓ Acceso a ${product.displayName} activado para ${email}`,
    })
  } catch (error) {
    console.error('[POST /api/admin/activate]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}

// GET — recent activations log (last 30)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const purchases = await prisma.productPurchase.findMany({
      where: { orderId: { startsWith: 'MANUAL-ADMIN-' } },
      orderBy: { paidAt: 'desc' },
      take: 30,
      include: { user: { select: { email: true } } },
    })

    // Also include manual quantum activations from SubscriptionLog
    const quantumLogs = await prisma.subscriptionLog.findMany({
      where: { note: 'Manual admin activation' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { email: true } } },
    })

    const purchaseRows = purchases.map(p => ({
      id: p.id,
      date: p.paidAt ?? p.createdAt,
      email: p.user.email,
      product: p.productId,
      type: 'course',
    }))

    const quantumRows = quantumLogs.map(l => ({
      id: l.id,
      date: l.createdAt,
      email: l.user.email,
      product: 'quantum-access',
      type: 'subscription',
    }))

    const all = [...purchaseRows, ...quantumRows]
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
      .slice(0, 30)

    return NextResponse.json({ activations: all })
  } catch (error) {
    console.error('[GET /api/admin/activate]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
