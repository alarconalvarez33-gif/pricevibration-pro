import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000)
  // Only show payments older than 1 hour: gives the webhook time to auto-activate real payments
  const since1h = new Date(Date.now() - 60 * 60 * 1000)

  const [pendingPayments, pendingPurchases, failedWebhooks] = await Promise.all([
    // Pending subscriptions: must have a PagoPar hash and be older than 1 hour
    prisma.payment.findMany({
      where: {
        paidAt: null,
        status: 'pending',
        pagoparHash: { not: null },
        createdAt: { gte: since7d, lte: since1h },
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    }),

    // Pending product purchases: must have a PagoPar hash and be older than 1 hour
    prisma.productPurchase.findMany({
      where: {
        paidAt: null,
        status: 'pending',
        pagoparHash: { not: null },
        createdAt: { gte: since7d, lte: since1h },
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    }),

    // Failed webhook logs in last 24h
    prisma.webhookLog.count({
      where: {
        status: 'failed',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  const items = [
    ...pendingPayments.map(p => ({
      id: p.id,
      type: 'subscription' as const,
      email: p.user.email,
      name: p.user.name,
      product: p.planType,
      amount: p.amount,
      currency: p.currency,
      pagoparHash: p.pagoparHash,
      orderId: p.orderId,
      createdAt: p.createdAt,
      isOld: p.createdAt < since48h,
    })),
    ...pendingPurchases.map(p => ({
      id: p.id,
      type: 'product' as const,
      email: p.user.email,
      name: p.user.name,
      product: p.productId,
      amount: p.price,
      currency: 'PYG',
      pagoparHash: p.pagoparHash,
      orderId: p.orderId,
      createdAt: p.createdAt,
      isOld: p.createdAt < since48h,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json({
    pending: items,
    failedWebhooks24h: failedWebhooks,
    oldCount: items.filter(i => i.isOld).length,
  })
}
