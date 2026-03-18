import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendExpiryEmail, sendRenewalReminderEmail } from '@/lib/email'

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const auth = request.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  let expired = 0
  let reminded = 0

  // ── Step 1: Expire overdue subscriptions ────────────────────────────────────
  const overdueUsers = await prisma.user.findMany({
    where: {
      isPremium: true,
      premiumUntil: { lt: now },
      subscriptionStatus: { in: ['active', 'cancelled'] },
    },
  })

  for (const user of overdueUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isPremium: false,
        plan: 'free',
        subscriptionStatus: 'expired',
      },
    })
    await prisma.subscriptionLog.create({
      data: { userId: user.id, event: 'expired', plan: user.plan, note: 'Expirado por cron job' },
    })
    sendExpiryEmail(user.email, user.name || '').catch(console.error)
    expired++
    console.log(`[CRON] Expired: ${user.email} (was ${user.plan})`)
  }

  // ── Step 2: Send 3-day renewal reminders ────────────────────────────────────
  const toRemind = await prisma.user.findMany({
    where: {
      subscriptionStatus: 'active',
      autoRenew: true,
      premiumUntil: { gte: now, lte: in3Days },
    },
  })

  for (const user of toRemind) {
    // Avoid duplicate reminders: check if already sent in last 48h
    const recentReminder = await prisma.subscriptionLog.findFirst({
      where: {
        userId: user.id,
        event: 'reminder_sent',
        createdAt: { gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
      },
    })
    if (recentReminder) continue

    await prisma.subscriptionLog.create({
      data: { userId: user.id, event: 'reminder_sent', plan: user.plan },
    })
    if (user.premiumUntil) {
      sendRenewalReminderEmail(user.email, user.name || '', user.premiumUntil).catch(console.error)
    }
    reminded++
    console.log(`[CRON] Reminder sent: ${user.email}`)
  }

  console.log(`[CRON] Done — expired: ${expired}, reminded: ${reminded}`)
  return NextResponse.json({ ok: true, expired, reminded, ranAt: now.toISOString() })
}
