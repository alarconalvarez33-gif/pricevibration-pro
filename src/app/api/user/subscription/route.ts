import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      isPremium: true,
      premiumUntil: true,
      subscriptionStatus: true,
      autoRenew: true,
      cancelledAt: true,
      nextBillingDate: true,
      createdAt: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderId: true,
          planType: true,
          billingPeriod: true,
          amount: true,
          amountUsd: true,
          status: true,
          paidAt: true,
          createdAt: true,
        },
      },
      subscriptionLogs: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, event: true, plan: true, note: true, createdAt: true },
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  return NextResponse.json(user)
}
