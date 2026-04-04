import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const COURSE_META: Record<string, { title: string; url: string; icon: string }> = {
  'canal-paralelo': {
    title: 'Canal Paralelo',
    url: '/courses/canal-paralelo',
    icon: '🎓',
  },
  'expansion-matematica': {
    title: 'Genesis',
    url: '/courses/expansion-matematica',
    icon: '👑',
  },
  'fibonacci': {
    title: 'Curso de Fibonacci',
    url: '/courses/fibonacci',
    icon: '📊',
  },
  'super-estrategia': {
    title: 'Super Estrategia',
    url: '/curso',
    icon: '🏆',
  },
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

    // Admins see all courses
    if (isAdmin) {
      const courses = Object.entries(COURSE_META).map(([productId, meta]) => ({
        productId,
        orderId: null,
        paidAt: null,
        ...meta,
      }))
      return NextResponse.json({ courses })
    }

    const purchases = await prisma.productPurchase.findMany({
      where: { userId: user.id, status: 'paid' },
      orderBy: { paidAt: 'desc' },
    })

    const courses = purchases.map((p) => ({
      productId: p.productId,
      orderId: p.orderId,
      paidAt: p.paidAt,
      ...(COURSE_META[p.productId] ?? {
        title: p.productId,
        url: '#',
        icon: '📚',
      }),
    }))

    // If cursoPurchased flag is set but no purchase record, add super-estrategia
    const alreadyHasSuperEstrategia = courses.some(c => c.productId === 'super-estrategia')
    if (user.cursoPurchased && !alreadyHasSuperEstrategia) {
      courses.unshift({
        productId: 'super-estrategia',
        orderId: 'manual',
        paidAt: null,
        ...COURSE_META['super-estrategia'],
      })
    }

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Purchases fetch error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
