import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const COURSE_META: Record<string, { title: string; url: string; icon: string; pricePYG: number; priceUSD: number }> = {
  'frecuencia':           { title: 'Frecuencia',         url: '/dashboard/cursos/frecuencia', icon: '🌀', pricePYG: 200000, priceUSD: 27 },
  'metalevels':           { title: 'MetaLevels',          url: '/metalevels/acceso',           icon: '📈', pricePYG: 150000, priceUSD: 20 },
  'canal-paralelo':       { title: 'Canal Paralelo',      url: '/courses/canal-paralelo',      icon: '🎓', pricePYG: 320000, priceUSD: 48 },
  'expansion-matematica': { title: 'Genesis',             url: '/courses/expansion-matematica', icon: '👑', pricePYG: 500000, priceUSD: 77 },
  'fibonacci':            { title: 'Fibonacci',           url: '/courses/fibonacci',           icon: '📊', pricePYG: 499000, priceUSD: 75 },
  'super-estrategia':     { title: 'Super Estrategia',    url: '/curso',                       icon: '🏆', pricePYG:  65000, priceUSD: 10 },
  'adx':                  { title: 'Estrategia ADX',      url: '/courses/adx',                 icon: '📈', pricePYG: 220000, priceUSD: 30 },
}

type CourseEntry = {
  productId: string
  title: string
  url: string
  icon: string
  pricePYG: number
  priceUSD: number
  orderId: string | null
  paidAt: Date | null
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isAdmin = user.email === 'raul@sacredlevels.com' || user.role === 'admin'

    // Admin sees every course as owned, nothing left to acquire
    if (isAdmin) {
      const owned: CourseEntry[] = Object.entries(COURSE_META).map(([productId, meta]) => ({
        productId,
        orderId: null,
        paidAt: null,
        ...meta,
      }))
      return NextResponse.json({ owned, available: [] })
    }

    // Regular users: fetch paid purchases
    const purchases = await prisma.productPurchase.findMany({
      where: { userId: user.id, status: 'paid' },
      orderBy: { paidAt: 'desc' },
    })

    const owned: CourseEntry[] = purchases.map((p) => ({
      productId: p.productId,
      orderId:   p.orderId,
      paidAt:    p.paidAt,
      ...(COURSE_META[p.productId] ?? {
        title:    p.productId,
        url:      '#',
        icon:     '📚',
        pricePYG: 0,
        priceUSD: 0,
      }),
    }))

    // Legacy: cursoPurchased flag without a purchase record
    const alreadyHasSuperEstrategia = owned.some(c => c.productId === 'super-estrategia')
    if (user.cursoPurchased && !alreadyHasSuperEstrategia) {
      owned.unshift({
        productId: 'super-estrategia',
        orderId:   'manual',
        paidAt:    null,
        ...COURSE_META['super-estrategia'],
      })
    }

    // Available = everything in COURSE_META that the user hasn't bought yet
    const ownedIds = new Set(owned.map(c => c.productId))
    const available: CourseEntry[] = Object.entries(COURSE_META)
      .filter(([productId]) => !ownedIds.has(productId))
      .map(([productId, meta]) => ({
        productId,
        orderId: null,
        paidAt:  null,
        ...meta,
      }))

    return NextResponse.json({ owned, available })
  } catch (error) {
    console.error('Purchases fetch error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
