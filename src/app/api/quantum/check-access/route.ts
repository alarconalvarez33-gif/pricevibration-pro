import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { hasFullAccess } from '@/lib/constants'

const TRIAL_DAYS = 7

function trialStatus(createdAt: Date) {
  const expiry = new Date(createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
  const now = new Date()
  const allowed = now < expiry
  const daysLeft = allowed ? Math.ceil((expiry.getTime() - now.getTime()) / 86400000) : 0
  return { allowed, daysLeft, expiry }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'

  const keySource = session?.user?.email ? `${ip}:${session.user.email}` : `guest:${ip}`
  const visitorKey = crypto.createHash('sha256').update(keySource).digest('hex')

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    if (user?.role === 'admin' || hasFullAccess(session.user.email) || user?.plan === 'quantum') {
      return NextResponse.json({ allowed: true, paid: true, daysLeft: 999 })
    }

    const hasPaid = await prisma.productPurchase.findFirst({
      where: { userId: user?.id, productId: 'fisica-cuantica', status: 'paid' },
    })

    if (hasPaid) {
      return NextResponse.json({ allowed: true, paid: true, daysLeft: 999 })
    }
  }

  // Check/create free trial record (works for guests and logged-in users)
  const userId = session?.user?.email
    ? (await prisma.user.findUnique({ where: { email: session.user.email! }, select: { id: true } }))?.id ?? null
    : null

  const access = await prisma.quantumAccess.upsert({
    where: { visitorKey },
    update: {},
    create: { visitorKey, userId, usesCount: 0 },
  })

  const { allowed, daysLeft } = trialStatus(access.createdAt)
  return NextResponse.json({ allowed, paid: false, daysLeft, usesLeft: daysLeft })
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

    const { allowed, daysLeft } = trialStatus(access.createdAt)
    return NextResponse.json({ allowed, daysLeft, usesLeft: daysLeft })
  }

  // Guest user
  const access = await prisma.quantumAccess.upsert({
    where: { visitorKey },
    update: { usesCount: { increment: 1 } },
    create: { visitorKey, userId: null, usesCount: 1 },
  })

  const { allowed, daysLeft } = trialStatus(access.createdAt)
  return NextResponse.json({ allowed, daysLeft, usesLeft: daysLeft })
}
