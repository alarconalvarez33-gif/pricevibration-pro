import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { hasFullAccess } from '@/lib/constants'

const FREE_USES = 3

function isPaidUser(plan?: string | null, role?: string | null, email?: string | null) {
  return role === 'admin' || plan === 'quantum' || hasFullAccess(email ?? '')
}

function buildKey(ip: string, email?: string | null) {
  const src = email ? `${ip}:${email}` : `guest:${ip}`
  return crypto.createHash('sha256').update(src).digest('hex')
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    if (isPaidUser(user?.plan, user?.role, session.user.email)) {
      return NextResponse.json({ allowed: true, paid: true, usesLeft: 999 })
    }

    const hasPaid = await prisma.productPurchase.findFirst({
      where: { userId: user?.id, productId: 'fisica-cuantica', status: 'paid' },
    })
    if (hasPaid) {
      return NextResponse.json({ allowed: true, paid: true, usesLeft: 999 })
    }
  }

  const visitorKey = buildKey(ip, session?.user?.email)
  const userId = session?.user?.email
    ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id ?? null
    : null

  const access = await prisma.quantumAccess.upsert({
    where: { visitorKey },
    update: {},
    create: { visitorKey, userId, usesCount: 0 },
  })

  const usesLeft = Math.max(0, FREE_USES - access.usesCount)
  return NextResponse.json({ allowed: usesLeft > 0, paid: false, usesLeft })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    if (isPaidUser(user?.plan, user?.role, session.user.email)) {
      return NextResponse.json({ allowed: true, paid: true, usesLeft: 999 })
    }

    const hasPaid = await prisma.productPurchase.findFirst({
      where: { userId: user?.id, productId: 'fisica-cuantica', status: 'paid' },
    })
    if (hasPaid) {
      return NextResponse.json({ allowed: true, paid: true, usesLeft: 999 })
    }
  }

  const visitorKey = buildKey(ip, session?.user?.email)
  const userId = session?.user?.email
    ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id ?? null
    : null

  const access = await prisma.quantumAccess.upsert({
    where: { visitorKey },
    update: { usesCount: { increment: 1 } },
    create: { visitorKey, userId, usesCount: 1 },
  })

  const usesLeft = Math.max(0, FREE_USES - access.usesCount)
  return NextResponse.json({ allowed: usesLeft > 0, paid: false, usesLeft })
}
