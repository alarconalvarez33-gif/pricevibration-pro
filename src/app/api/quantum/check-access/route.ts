import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const FREE_USES = 2

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ allowed: false, reason: 'login_required', usesLeft: 0 })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'

  const visitorKey = crypto
    .createHash('sha256')
    .update(`${ip}:${session.user.email}`)
    .digest('hex')

  // Check if user has a paid quantum subscription
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })

  // Admin always has full access
  if (user?.role === 'admin') {
    return NextResponse.json({ allowed: true, paid: true, usesLeft: 999 })
  }

  const hasPaid = await prisma.productPurchase.findFirst({
    where: { userId: user?.id, productId: 'fisica-cuantica', status: 'paid' },
  })

  if (hasPaid) {
    return NextResponse.json({ allowed: true, paid: true, usesLeft: 999 })
  }

  // Check/create free trial record
  const access = await prisma.quantumAccess.upsert({
    where: { visitorKey },
    update: {},
    create: { visitorKey, userId: user?.id, usesCount: 0 },
  })

  const usesLeft = Math.max(0, FREE_USES - access.usesCount)
  return NextResponse.json({ allowed: usesLeft > 0, paid: false, usesLeft, usesCount: access.usesCount })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'login_required' }, { status: 401 })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'

  const visitorKey = crypto
    .createHash('sha256')
    .update(`${ip}:${session.user.email}`)
    .digest('hex')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })

  // Admin always has full access (no use consumption)
  if (user?.role === 'admin') {
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
