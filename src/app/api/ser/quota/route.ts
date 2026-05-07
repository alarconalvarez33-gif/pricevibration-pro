import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canUserAskQuestion } from '@/lib/ser/quota'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'raul@sacredlevels.com'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } })
  const isAdmin = user?.email === ADMIN_EMAIL

  if (isAdmin) {
    return NextResponse.json({ remaining: 999, plan: 'ADMIN', isActive: true })
  }

  const subscription = await prisma.serSubscription.findUnique({ where: { userId: session.user.id } })
  const quotaCheck = await canUserAskQuestion(session.user.id)

  return NextResponse.json({
    remaining: quotaCheck.remaining,
    plan: subscription?.plan || 'FREE',
    isActive: subscription?.isActive || false,
    expiresAt: subscription?.expiresAt || null,
  })
}
