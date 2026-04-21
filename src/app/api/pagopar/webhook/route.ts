import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { activatePayment, activateProductPurchase } from '@/lib/services/payment-activation'

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

/**
 * Builds the 9-field ACK that PagoPar requires.
 * pagado:true tells PagoPar "received and acknowledged — stop retrying".
 * We ALWAYS return pagado:true regardless of processing outcome.
 */
function buildAck(item: Record<string, unknown>): string {
  const now = new Date()
  return JSON.stringify([
    {
      pagado:                      true,
      numero_comprobante_interno:  String(item.numero_comprobante_interno ?? item.numero_comprobante ?? Date.now()),
      id_pedido:                   String(item.numero_pedido ?? ''),
      monto:                       item.monto ?? 0,
      fecha_pago:                  now.toISOString().split('T')[0],
      hora_pago:                   now.toTimeString().split(' ')[0],
      id_transaccion:              String(item.id_transaccion ?? ''),
      medio_pago:                  String(item.forma_pago ?? ''),
      codigo_autorizacion:         String(item.codigo_autorizacion ?? ''),
    },
  ])
}

/** Fire-and-forget DB log — never blocks the response. */
function logWebhook(data: Parameters<typeof prisma.webhookLog.create>[0]['data']) {
  prisma.webhookLog.create({ data }).catch(e =>
    console.error('[webhook] log write failed:', e)
  )
}

function updateLog(id: string, data: Parameters<typeof prisma.webhookLog.update>[0]['data']) {
  prisma.webhookLog.update({ where: { id }, data }).catch(e =>
    console.error('[webhook] log update failed:', e)
  )
}

export async function POST(request: Request) {
  let item: Record<string, unknown> = {}

  try {
    const body = await request.json()

    // PagoPar sends a bare array: [{...}]
    const arr: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : body.resultado
        ? (Array.isArray(body.resultado) ? body.resultado : [body.resultado])
        : [body]

    item = (arr[0] as Record<string, unknown>) || {}

    const hashPedido   = String(item.hash_pedido   ?? '')
    const numeroPedido = String(item.numero_pedido  ?? '')
    const pagadoRaw    = item.pagado
    const canceladoRaw = item.cancelado

    const esPagado    = pagadoRaw   === true || pagadoRaw   === 'true' || pagadoRaw   === 1 || pagadoRaw   === '1'
    const esCancelado = canceladoRaw === true || canceladoRaw === 'true'

    console.log(`🔔 [webhook] hash: ${hashPedido.slice(0, 16)}... | numero: ${numeroPedido} | pagado: ${esPagado}`)

    // ── Missing hash ─────────────────────────────────────────────────────────
    if (!hashPedido) {
      logWebhook({
        provider: 'pagopar', numeroPedido: numeroPedido || null, hashPedido: null,
        payload: item as object, status: 'not_found', errorMsg: 'Missing hash_pedido',
      })
      return new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })
    }

    // ── Fast DB lookup — single query, single round-trip ────────────────────
    const payment = await prisma.payment.findFirst({
      where:  { pagoparHash: hashPedido },
      select: { id: true, paidAt: true, status: true },
    })

    const purchase = payment ? null : await prisma.productPurchase.findFirst({
      where:  { pagoparHash: hashPedido },
      select: { id: true, paidAt: true, status: true },
    })

    // ── Not found ────────────────────────────────────────────────────────────
    if (!payment && !purchase) {
      console.warn(`⚠️ [webhook] hash not in DB: ${hashPedido.slice(0, 16)}...`)
      // Respond immediately, log in background
      logWebhook({
        provider: 'pagopar', numeroPedido: numeroPedido || null, hashPedido,
        payload: item as object, status: 'not_found',
        errorMsg: `hash_pedido not in DB: ${hashPedido}`,
      })
      return new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })
    }

    const record = payment ?? purchase!
    const type   = payment ? 'subscription' : 'product'

    // ── DUPLICATE: already activated → respond IMMEDIATELY ──────────────────
    // This is the critical path. We must ACK before PagoPar times out.
    if (record.paidAt) {
      console.log(`ℹ️ [webhook] Duplicate — already paid. Acking immediately. hash: ${hashPedido.slice(0, 16)}...`)
      // ACK first — no DB wait
      const ack = new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })
      // Log in background, does NOT block the response
      logWebhook({
        provider: 'pagopar', numeroPedido: numeroPedido || null, hashPedido,
        payload: item as object, status: 'duplicate',
      })
      return ack
    }

    // ── Cancelled / not paid ─────────────────────────────────────────────────
    if (!esPagado || esCancelado) {
      // Respond immediately, update status in background
      const ack = new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })
      ;(async () => {
        try {
          if (type === 'subscription') {
            await prisma.payment.update({ where: { id: record.id }, data: { status: 'failed' } })
          } else {
            await prisma.productPurchase.update({ where: { id: record.id }, data: { status: 'failed' } })
          }
          logWebhook({
            provider: 'pagopar', numeroPedido: numeroPedido || null, hashPedido,
            payload: item as object, status: 'cancelled',
          })
        } catch (e) {
          console.error('[webhook] cancelled update failed:', e)
        }
      })()
      console.log(`ℹ️ [webhook] Cancelled/not paid: ${hashPedido.slice(0, 16)}...`)
      return ack
    }

    // ── New payment — activate ───────────────────────────────────────────────
    // Create log entry first so we have an ID for the update
    const log = await prisma.webhookLog.create({
      data: {
        provider: 'pagopar',
        numeroPedido: numeroPedido || null,
        hashPedido,
        payload: item as object,
        status: 'processing',
      },
    })

    const params = { source: 'webhook' as const, triggeredBy: 'pagopar_webhook' }

    const result = type === 'subscription'
      ? await activatePayment(record.id, params)
      : await activateProductPurchase(record.id, params)

    // Update log in background — response goes out immediately after activation
    const ack = new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })

    updateLog(log.id, {
      status:    result.success ? 'processed' : 'failed',
      userEmail: result.userEmail ?? null,
      errorMsg:  result.errorMsg ?? null,
      response:  { pagado: true, product: result.product },
    })

    console.log(
      result.success
        ? `✅ [webhook] Activated: ${result.userEmail} → ${result.product}`
        : `❌ [webhook] Activation failed: ${result.errorMsg}`
    )

    return ack

  } catch (error) {
    // NEVER return non-200 — PagoPar would retry forever
    console.error('❌ [webhook] Unexpected error:', error)
    logWebhook({
      provider: 'pagopar', numeroPedido: null, hashPedido: String(item.hash_pedido ?? ''),
      payload: item as object, status: 'failed', errorMsg: String(error),
    })
    return new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })
  }
}

// GET — health check
export async function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'pagopar-webhook', ts: new Date().toISOString() },
    { status: 200 }
  )
}
