/**
 * Payment reconciliation service.
 *
 * Safety net: runs every 15 min via Vercel cron.
 * Finds pending Payment + ProductPurchase records older than 10 min,
 * queries PagoPar for their real status, and activates them if paid.
 *
 * Fully idempotent — activatePayment / activateProductPurchase check paidAt.
 */

import { prisma }                    from '@/lib/prisma'
import { queryPagoparOrder }         from './pagopar-query'
import { activatePayment, activateProductPurchase } from './payment-activation'
import { sendAdminAlert }            from '@/lib/email'

export interface ReconciliationResult {
  checked:   number
  activated: number
  noAction:  number
  errors:    number
  details:   { email: string; product: string; type: string }[]
}

const TEN_MIN   = 10 * 60 * 1000
const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000
const MAX_PER_RUN = 40  // safety cap

async function logReconciliation(data: {
  paymentId:       string
  paymentType:     string
  userId:          string
  pagoparStatus:   string
  previousStatus:  string
  newStatus:       string
  action:          'activated' | 'no_action' | 'error'
  source:          'cron' | 'manual_admin'
  errorMsg?:       string
  pagoparResponse?: object
}) {
  try {
    await prisma.reconciliationLog.create({ data })
  } catch (e) {
    console.error('[reconciliation] log write failed:', e)
  }
}

export async function reconcilePendingPayments(
  source: 'cron' | 'manual_admin' = 'cron'
): Promise<ReconciliationResult> {
  const now    = Date.now()
  const cutoff = new Date(now - TEN_MIN)
  const oldest = new Date(now - NINETY_DAYS)

  const results: ReconciliationResult = {
    checked: 0, activated: 0, noAction: 0, errors: 0, details: [],
  }

  // ── 1. Collect pending subscriptions (Payment) ──────────────────────────
  const pendingPayments = await prisma.payment.findMany({
    where: {
      paidAt:    null,
      status:    { notIn: ['paid', 'cancelled', 'failed'] },
      createdAt: { lt: cutoff, gt: oldest },
      pagoparHash: { not: null },
    },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
    take: MAX_PER_RUN,
  })

  // ── 2. Collect pending product purchases (ProductPurchase) ────────────────
  const pendingPurchases = await prisma.productPurchase.findMany({
    where: {
      paidAt:    null,
      status:    { notIn: ['paid', 'cancelled', 'failed'] },
      createdAt: { lt: cutoff, gt: oldest },
      pagoparHash: { not: null },
    },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
    take: MAX_PER_RUN,
  })

  console.log(`[reconciliation] Found ${pendingPayments.length} pending subscriptions, ${pendingPurchases.length} pending purchases`)

  // ── 3. Process subscriptions ─────────────────────────────────────────────
  for (const payment of pendingPayments) {
    results.checked++
    const hash = payment.pagoparHash!

    try {
      const status = await queryPagoparOrder(hash)

      if (!status) {
        await logReconciliation({
          paymentId: payment.id, paymentType: 'subscription',
          userId: payment.userId, pagoparStatus: 'query_failed',
          previousStatus: payment.status, newStatus: payment.status,
          action: 'error', source,
          errorMsg: 'PagoPar query returned null',
        })
        results.errors++

      } else if (status.pagado && !status.cancelado) {
        const result = await activatePayment(payment.id, {
          source: 'webhook',
          triggeredBy: `reconciliation_${source}`,
        })
        await logReconciliation({
          paymentId: payment.id, paymentType: 'subscription',
          userId: payment.userId, pagoparStatus: 'paid',
          previousStatus: payment.status, newStatus: 'paid',
          action: result.success ? 'activated' : 'error', source,
          errorMsg: result.errorMsg,
          pagoparResponse: status as object,
        })
        if (result.success) {
          results.activated++
          results.details.push({ email: payment.user.email, product: payment.planType, type: 'subscription' })
          console.log(`✅ [reconciliation] Activated subscription: ${payment.user.email} → ${payment.planType}`)
        } else {
          results.errors++
        }

      } else if (status.cancelado) {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: 'cancelled' } })
        await logReconciliation({
          paymentId: payment.id, paymentType: 'subscription',
          userId: payment.userId, pagoparStatus: 'cancelled',
          previousStatus: payment.status, newStatus: 'cancelled',
          action: 'no_action', source,
        })
        results.noAction++

      } else {
        await logReconciliation({
          paymentId: payment.id, paymentType: 'subscription',
          userId: payment.userId, pagoparStatus: 'still_pending',
          previousStatus: payment.status, newStatus: payment.status,
          action: 'no_action', source,
        })
        results.noAction++
      }

    } catch (err) {
      console.error(`[reconciliation] Error on payment ${payment.id}:`, err)
      await logReconciliation({
        paymentId: payment.id, paymentType: 'subscription',
        userId: payment.userId, pagoparStatus: 'error',
        previousStatus: payment.status, newStatus: payment.status,
        action: 'error', source,
        errorMsg: err instanceof Error ? err.message : String(err),
      })
      results.errors++
    }

    await new Promise(r => setTimeout(r, 500)) // rate-limit
  }

  // ── 4. Process product purchases ─────────────────────────────────────────
  for (const purchase of pendingPurchases) {
    results.checked++
    const hash = purchase.pagoparHash!

    try {
      const status = await queryPagoparOrder(hash)

      if (!status) {
        await logReconciliation({
          paymentId: purchase.id, paymentType: 'product',
          userId: purchase.userId, pagoparStatus: 'query_failed',
          previousStatus: purchase.status, newStatus: purchase.status,
          action: 'error', source,
          errorMsg: 'PagoPar query returned null',
        })
        results.errors++

      } else if (status.pagado && !status.cancelado) {
        const result = await activateProductPurchase(purchase.id, {
          source: 'webhook',
          triggeredBy: `reconciliation_${source}`,
        })
        await logReconciliation({
          paymentId: purchase.id, paymentType: 'product',
          userId: purchase.userId, pagoparStatus: 'paid',
          previousStatus: purchase.status, newStatus: 'paid',
          action: result.success ? 'activated' : 'error', source,
          errorMsg: result.errorMsg,
          pagoparResponse: status as object,
        })
        if (result.success) {
          results.activated++
          results.details.push({ email: purchase.user.email, product: purchase.productId, type: 'product' })
          console.log(`✅ [reconciliation] Activated product: ${purchase.user.email} → ${purchase.productId}`)
        } else {
          results.errors++
        }

      } else if (status.cancelado) {
        await prisma.productPurchase.update({ where: { id: purchase.id }, data: { status: 'cancelled' } })
        await logReconciliation({
          paymentId: purchase.id, paymentType: 'product',
          userId: purchase.userId, pagoparStatus: 'cancelled',
          previousStatus: purchase.status, newStatus: 'cancelled',
          action: 'no_action', source,
        })
        results.noAction++

      } else {
        await logReconciliation({
          paymentId: purchase.id, paymentType: 'product',
          userId: purchase.userId, pagoparStatus: 'still_pending',
          previousStatus: purchase.status, newStatus: purchase.status,
          action: 'no_action', source,
        })
        results.noAction++
      }

    } catch (err) {
      console.error(`[reconciliation] Error on purchase ${purchase.id}:`, err)
      await logReconciliation({
        paymentId: purchase.id, paymentType: 'product',
        userId: purchase.userId, pagoparStatus: 'error',
        previousStatus: purchase.status, newStatus: purchase.status,
        action: 'error', source,
        errorMsg: err instanceof Error ? err.message : String(err),
      })
      results.errors++
    }

    await new Promise(r => setTimeout(r, 500))
  }

  // ── 5. Notify admin if activations occurred ───────────────────────────────
  if (results.activated > 0) {
    sendAdminAlert(
      `🔧 Reconciliación automática: ${results.activated} pago${results.activated > 1 ? 's' : ''} recuperado${results.activated > 1 ? 's' : ''}`,
      `El cron de reconciliación activó ${results.activated} pago(s) que habían quedado pendientes:\n\n` +
      results.details.map(d => `• ${d.email} → ${d.product} (${d.type})`).join('\n') +
      `\n\nRevisar historial en /admin/reconciliation-logs`
    ).catch(e => console.error('[reconciliation] admin alert failed:', e))
  }

  console.log(`[reconciliation] Done — checked:${results.checked} activated:${results.activated} noAction:${results.noAction} errors:${results.errors}`)
  return results
}
