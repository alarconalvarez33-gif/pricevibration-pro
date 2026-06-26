/**
 * Manual subscription activation (used by /api/admin/activar, USDT receipt
 * approval, and reconciliation cron). Unlike activatePayment in
 * payment-activation.ts, this helper does NOT require an existing Payment
 * record — it directly upgrades the user.
 *
 * Idempotent: calling multiple times only ever EXTENDS the subscription if
 * already active.
 */

import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

export interface ActivateProSubscriptionParams {
  /** lookup by id OR email — at least one required */
  userId?: string
  email?: string
  /** number of days to add to premiumUntil (default 30) */
  days?: number
  /** plan name to set; default 'pro' */
  plan?: string
  /** who triggered this — written to the log */
  triggeredBy: string
  /** where this activation came from */
  source: 'admin_manual' | 'usdt_receipt' | 'reconcile_cron' | 'webhook'
  /** free-text note saved to SubscriptionLog */
  note?: string
}

export interface ActivateProSubscriptionResult {
  success: boolean
  userId?: string
  userEmail?: string
  premiumUntil?: string
  errorMsg?: string
}

export async function activateProSubscription(
  params: ActivateProSubscriptionParams
): Promise<ActivateProSubscriptionResult> {
  const days = params.days ?? 30
  const plan = params.plan ?? 'pro'

  if (!params.userId && !params.email) {
    return { success: false, errorMsg: 'userId or email required' }
  }

  const user = await prisma.user.findFirst({
    where: params.userId ? { id: params.userId } : { email: params.email! },
  })
  if (!user) {
    return { success: false, errorMsg: `User not found: ${params.userId ?? params.email}` }
  }

  // If user already has an active premium subscription, extend from that date.
  // Otherwise extend from now.
  const baseDate =
    user.premiumUntil && user.premiumUntil > new Date()
      ? user.premiumUntil
      : new Date()
  const premiumUntil = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isPremium: true,
      plan,
      subscriptionStatus: 'active',
      premiumUntil,
      nextBillingDate: premiumUntil,
      cancelledAt: null,
      autoRenew: false, // manual activations don't auto-renew
    },
  })

  await prisma.subscriptionLog.create({
    data: {
      userId: user.id,
      event: 'activated',
      plan,
      note: `${params.note ?? ''} | source: ${params.source} | by: ${params.triggeredBy} | +${days}d`,
    },
  })

  // Fire-and-forget welcome email
  sendWelcomeEmail(user.email, user.name ?? user.email, plan, premiumUntil)
    .catch(e => console.error('[sendWelcomeEmail]', e))

  console.log(
    `✅ [activate-subscription] ${user.email} → ${plan} until ${premiumUntil.toISOString()} (source: ${params.source}, by: ${params.triggeredBy})`
  )

  return {
    success: true,
    userId: user.id,
    userEmail: user.email,
    premiumUntil: premiumUntil.toISOString(),
  }
}
