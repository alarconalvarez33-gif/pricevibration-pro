import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { hasFullAccess as legacyFullAccess } from '@/lib/constants'
import { getTrialState } from '@/lib/services/trial-access'

const FREE_USES = 3

function isPaidUser(plan?: string | null, role?: string | null, email?: string | null) {
  return role === 'admin' || plan === 'pro' || plan === 'quantum' || legacyFullAccess(email ?? '')
}

function buildKey(ip: string, email?: string | null) {
  const src = email ? `${ip}:${email}` : `guest:${ip}`
  return crypto.createHash('sha256').update(src).digest('hex')
}

async function resolveAccess(request: NextRequest) {
  const session = await getServerSession(authOptions)

  // 1. Paid users / admins / fisica-cuantica buyers — always full access.
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (isPaidUser(user?.plan, user?.role, session.user.email)) {
      return { mode: 'paid' as const, userId: user?.id ?? null }
    }
    const hasPaid = await prisma.productPurchase.findFirst({
      where: { userId: user?.id, productId: 'fisica-cuantica', status: 'paid' },
    })
    if (hasPaid) return { mode: 'paid' as const, userId: user?.id ?? null }
  }

  // 2. 24h trial — anyone (anonymous or registered, no payment) gets unlimited
  //    access while they are inside the trial window.
  const trial = await getTrialState(request)
  if (trial.inTrial) {
    return {
      mode: 'trial' as const,
      trialEndsAt: trial.trialEndsAt,
      userId: session?.user?.email
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id ?? null
        : null,
    }
  }

  // 3. Trial expired — fall back to the original FREE_USES counter so
  //    long-time visitors who used the calculator before still get their 3
  //    legacy uses (acts as a buffer; new visitors get the 24h instead).
  return {
    mode: 'free' as const,
    userId: session?.user?.email
      ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id ?? null
      : null,
  }
}

function ipOf(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'
  )
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const access = await resolveAccess(request)

  if (access.mode === 'paid') {
    return NextResponse.json({ allowed: true, paid: true, usesLeft: 999 })
  }
  if (access.mode === 'trial') {
    return NextResponse.json({ allowed: true, paid: false, inTrial: true, trialEndsAt: access.trialEndsAt, usesLeft: 999 })
  }

  // Free fallback — count uses per visitor key
  const visitorKey = buildKey(ipOf(request), session?.user?.email)
  const row = await prisma.quantumAccess.upsert({
    where: { visitorKey },
    update: {},
    create: { visitorKey, userId: access.userId, usesCount: 0 },
  })
  const usesLeft = Math.max(0, FREE_USES - row.usesCount)
  return NextResponse.json({ allowed: usesLeft > 0, paid: false, usesLeft })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const access = await resolveAccess(request)

  if (access.mode === 'paid') {
    return NextResponse.json({ allowed: true, paid: true, usesLeft: 999 })
  }
  if (access.mode === 'trial') {
    return NextResponse.json({ allowed: true, paid: false, inTrial: true, trialEndsAt: access.trialEndsAt, usesLeft: 999 })
  }

  // Free fallback — increment uses on POST
  const visitorKey = buildKey(ipOf(request), session?.user?.email)
  const row = await prisma.quantumAccess.upsert({
    where: { visitorKey },
    update: { usesCount: { increment: 1 } },
    create: { visitorKey, userId: access.userId, usesCount: 1 },
  })
  const usesLeft = Math.max(0, FREE_USES - row.usesCount)
  return NextResponse.json({ allowed: usesLeft > 0, paid: false, usesLeft })
}
