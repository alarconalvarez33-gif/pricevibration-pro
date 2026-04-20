/**
 * Central payment activation service.
 * Used by BOTH the PagoPar webhook AND /admin/activate.
 * Single source of truth for activation logic.
 */

import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'
import { generateMetaLevelsCode } from '@/lib/services/license-generator'

export interface ActivationParams {
  source: 'webhook' | 'admin_manual'
  triggeredBy: string // 'pagopar_webhook' | admin email
}

export interface ActivationResult {
  success: boolean
  alreadyProcessed?: boolean
  userId?: string
  userEmail?: string
  product?: string
  errorMsg?: string
}

/**
 * Activate a subscription payment (Payment model → User quantum plan).
 * Idempotent: calling multiple times is safe.
 */
export async function activatePayment(
  paymentId: string,
  params: ActivationParams
): Promise<ActivationResult> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true },
  })

  if (!payment) {
    return { success: false, errorMsg: `Payment not found: ${paymentId}` }
  }

  // Idempotency: already activated
  if (payment.paidAt) {
    return {
      success: true,
      alreadyProcessed: true,
      userId: payment.userId,
      userEmail: payment.user.email,
      product: payment.planType,
    }
  }

  const premiumUntil = new Date()
  if (payment.billingPeriod === 'yearly') {
    premiumUntil.setFullYear(premiumUntil.getFullYear() + 1)
  } else {
    premiumUntil.setMonth(premiumUntil.getMonth() + 1)
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'paid', paidAt: new Date() },
  })

  await prisma.user.update({
    where: { id: payment.userId },
    data: {
      isPremium: true,
      premiumUntil,
      plan: payment.planType,
      subscriptionStatus: 'active',
      nextBillingDate: premiumUntil,
      cancelledAt: null,
      autoRenew: true,
    },
  })

  await prisma.subscriptionLog.create({
    data: {
      userId: payment.userId,
      event: 'activated',
      plan: payment.planType,
      note: `orderId: ${payment.orderId} | source: ${params.source} | by: ${params.triggeredBy}`,
    },
  })

  await prisma.activationLog.create({
    data: {
      paymentId: payment.id,
      userId: payment.userId,
      product: payment.planType,
      source: params.source,
      triggeredBy: params.triggeredBy,
      success: true,
    },
  })

  // Fire-and-forget welcome email
  sendWelcomeEmail(
    payment.user.email,
    payment.user.name ?? payment.user.email,
    payment.planType,
    premiumUntil
  ).catch(e => console.error('[sendWelcomeEmail]', e))

  console.log(
    `✅ [payment-activation] User ${payment.user.email} activated → ${payment.planType} until ${premiumUntil.toISOString()} (source: ${params.source})`
  )

  return {
    success: true,
    userId: payment.userId,
    userEmail: payment.user.email,
    product: payment.planType,
  }
}

/**
 * Activate a product purchase (ProductPurchase model → course access).
 * Idempotent: calling multiple times is safe.
 */
export async function activateProductPurchase(
  purchaseId: string,
  params: ActivationParams
): Promise<ActivationResult> {
  const purchase = await prisma.productPurchase.findUnique({
    where: { id: purchaseId },
    include: { user: true },
  })

  if (!purchase) {
    return { success: false, errorMsg: `ProductPurchase not found: ${purchaseId}` }
  }

  // Idempotency: already activated
  if (purchase.paidAt) {
    return {
      success: true,
      alreadyProcessed: true,
      userId: purchase.userId,
      userEmail: purchase.user.email,
      product: purchase.productId,
    }
  }

  await prisma.productPurchase.update({
    where: { id: purchase.id },
    data: { status: 'paid', paidAt: new Date() },
  })

  // Product-specific side effects
  if (purchase.productId === 'fisica-cuantica') {
    await prisma.quantumAccess.updateMany({
      where: { userId: purchase.userId },
      data: { isPaid: true },
    })
  }

  if (purchase.productId === 'super-estrategia') {
    await prisma.user.update({
      where: { id: purchase.userId },
      data: { cursoPurchased: true },
    })
  }

  if (purchase.productId === 'metalevels') {
    // Check if user already has an active license (idempotency)
    const existingLicense = await prisma.license.findFirst({
      where: { userId: purchase.userId, productType: 'metalevels', status: 'active' },
    })
    if (!existingLicense) {
      await generateMetaLevelsCode({
        userId: purchase.userId,
        paymentId: purchase.id,
      })
    }
  }

  await prisma.activationLog.create({
    data: {
      paymentId: purchase.id,
      userId: purchase.userId,
      product: purchase.productId,
      source: params.source,
      triggeredBy: params.triggeredBy,
      success: true,
    },
  })

  // Fire-and-forget welcome email
  sendWelcomeEmail(
    purchase.user.email,
    purchase.user.name ?? purchase.user.email,
    purchase.productId,
    null
  ).catch(e => console.error('[sendWelcomeEmail]', e))

  console.log(
    `✅ [payment-activation] User ${purchase.user.email} got ${purchase.productId} (source: ${params.source})`
  )

  return {
    success: true,
    userId: purchase.userId,
    userEmail: purchase.user.email,
    product: purchase.productId,
  }
}
