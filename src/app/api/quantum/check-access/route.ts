import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { hasFullAccess } from '@/lib/constants'

const FREE_USES = 3

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'

  // Build visitor key: IP+email for authenticated, IP-only for guests
  const keySource = session?.user?.email ? `${ip}:${session.user.email}` : `guest:${ip}`
  const visitorKey = crypto.createHash('sha256').update(keySource).digest('hex')

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    // Admin, VIP, and quantum plan users always have full access
    if (user?.role === 'admin' || hasFullAccess(session.user.email) || user?.plan === 'quantum') {
      return NextResponse.json({ allowed: true, paid: true, usesLeft: 999 })
    }

    const hasPaid = await prisma.productPurchase.findFirst({
      where: { userId: user?.id, productId: 'fisica-cuantica', status: 'paid' },
    })

    if (hasPaid) {
      return NextResponse.json({ allowed: true, paid: true, usesLeft: 999 })
    }
  }

  // Check/create free trial record (works for guests and logged-in users)
  const access = await prisma.quantumAccess.upsert({
    where: { visitorKey },
    update: {},
    create: { visitorKey, userId: session?.user ? (await prisma.user.findUnique({ where: { email: session.user.email! }, select: { id: true } }))?.id : null, usesCount: 0 },
  })

  const usesLeft = Math.max(0, FREE_USES - access.usesCount)
  return NextResponse.json({ allowed: usesLeft > 0, paid: false, usesLeft, usesCount: access.usesCount })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'

  const keySource = session?.user?.email ? `${ip}:${session.user.email}` : `guest:${ip}`
  const visitorKey = crypto.createHash('sha256').update(keySource).digest('hex')

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    // Admin, VIP, and quantum plan users always have full access (no use consumption)
    if (user?.role === 'admin' || hasFullAccess(session.user.email) || user?.plan === 'quantum') {
      return NextResponse.json({ allowed: true, paid: true })
    }

    const hasPaid = await prisma.productPurchase.findFirst({
      where: { userId: user?.id, productId: 'fisica-cuantica', status: 'paid' },
    })

    if (hasPaid) {
      return NextResponse.json({ allowed: true, paid: true })
    }

    const access = await prisma.quantumAccess.upsert({
      where: { visitorKey },
      update: { usesCount: { increment: 1 } },
      create: { visitorKey, userId: user?.id, usesCount: 1 },
    })

    const usesLeft = Math.max(0, FREE_USES - access.usesCount)
    return NextResponse.json({ allowed: usesLeft >= 0, usesLeft, usesCount: access.usesCount })
  }

  // Guest user — track by IP
  const access = await prisma.quantumAccess.upsert({
    where: { visitorKey },
    update: { usesCount: { increment: 1 } },
    create: { visitorKey, userId: null, usesCount: 1 },
  })

  const usesLeft = Math.max(0, FREE_USES - access.usesCount)
  return NextResponse.json({ allowed: usesLeft >= 0, usesLeft, usesCount: access.usesCount })
}
