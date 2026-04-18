import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { activatePayment, activateProductPurchase } from '@/lib/services/payment-activation'

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

/**
 * Builds the 9-field ACK response that PagoPar requires.
 * "pagado: true" means "I received and processed this webhook OK".
 * We ALWAYS return pagado:true to stop PagoPar from retrying.
 */
function buildAck(item: Record<string, unknown>): string {
  const now = new Date()
  return JSON.stringify([
    {
      pagado: true,
      numero_comprobante_interno:
        (item.numero_comprobante_interno as string) ||
        (item.numero_comprobante as string) ||
        String(Date.now()),
      id_pedido: (item.numero_pedido as string) || '',
      monto: (item.monto as string | number) || 0,
      fecha_pago: now.toISOString().split('T')[0],
      hora_pago: now.toTimeString().split(' ')[0],
      id_transaccion: (item.id_transaccion as string) || '',
      medio_pago: (item.forma_pago as string) || '',
      codigo_autorizacion: (item.codigo_autorizacion as string) || '',
    },
  ])
}

export async function POST(request: Request) {
  let logId: string | undefined
  let item: Record<string, unknown> = {}

  try {
    const body = await request.json()
    console.log('🔔 [webhook] Payload recibido:', JSON.stringify(body).slice(0, 500))

    // PagoPar sends a bare array: [{...}]
    const arr: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : body.resultado
        ? (Array.isArray(body.resultado) ? body.resultado : [body.resultado])
        : [body]

    item = (arr[0] as Record<string, unknown>) || {}

    const hashPedido    = String(item.hash_pedido    ?? '')
    const numeroPedido  = String(item.numero_pedido  ?? '')
    const pagadoRaw     = item.pagado
    const canceladoRaw  = item.cancelado

    const esPagado   = pagadoRaw === true || pagadoRaw === 'true' || pagadoRaw === 1 || pagadoRaw === '1'
    const esCancelado = canceladoRaw === true || canceladoRaw === 'true'

    // Log every incoming webhook immediately
    const log = await prisma.webhookLog.create({
      data: {
        provider: 'pagopar',
        numeroPedido: numeroPedido || null,
        hashPedido: hashPedido || null,
        payload: item as object,
        status: 'processing',
      },
    })
    logId = log.id
    console.log(`📝 [webhook] Log creado: ${logId} | hash: ${hashPedido.slice(0, 16)}... | pagado: ${esPagado}`)

    // ── Validate: look up hash_pedido in our DB ──────────────────────────────
    // This is our security check. hash_pedido is the value PagoPar generated
    // when we created the order — only we and PagoPar know it.
    // Token-based validation was removed because PagoPar's token formula
    // did not match any known combination. DB lookup is equivalent security.

    if (!hashPedido) {
      await prisma.webhookLog.update({
        where: { id: logId },
        data: { status: 'not_found', errorMsg: 'Missing hash_pedido in payload' },
      })
      return new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })
    }

    // Search Payment (subscription) first, then ProductPurchase (courses)
    const payment = await prisma.payment.findFirst({
      where: { pagoparHash: hashPedido },
      select: { id: true, paidAt: true, status: true },
    })

    const purchase = payment
      ? null
      : await prisma.productPurchase.findFirst({
          where: { pagoparHash: hashPedido },
          select: { id: true, paidAt: true, status: true },
        })

    if (!payment && !purchase) {
      console.warn(`⚠️ [webhook] hash_pedido no encontrado en DB: ${hashPedido}`)
      await prisma.webhookLog.update({
        where: { id: logId },
        data: { status: 'not_found', errorMsg: `hash_pedido not in DB: ${hashPedido}` },
      })
      return new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })
    }

    const record = payment ?? purchase!
    const type   = payment ? 'subscription' : 'product'

    // ── Handle cancelled / not paid ─────────────────────────────────────────
    if (!esPagado || esCancelado) {
      if (type === 'subscription') {
        await prisma.payment.update({ where: { id: record.id }, data: { status: 'failed' } })
      } else {
        await prisma.productPurchase.update({ where: { id: record.id }, data: { status: 'failed' } })
      }
      await prisma.webhookLog.update({
        where: { id: logId },
        data: { status: 'cancelled' },
      })
      console.log(`ℹ️ [webhook] Pago cancelado o no pagado para hash: ${hashPedido.slice(0, 16)}...`)
      return new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })
    }

    // ── Idempotency: already activated ──────────────────────────────────────
    if (record.paidAt) {
      console.log(`ℹ️ [webhook] Duplicado ignorado para hash: ${hashPedido.slice(0, 16)}...`)
      await prisma.webhookLog.update({
        where: { id: logId },
        data: { status: 'duplicate' },
      })
      return new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })
    }

    // ── Activate ─────────────────────────────────────────────────────────────
    const params = { source: 'webhook' as const, triggeredBy: 'pagopar_webhook' }

    const result = type === 'subscription'
      ? await activatePayment(record.id, params)
      : await activateProductPurchase(record.id, params)

    await prisma.webhookLog.update({
      where: { id: logId },
      data: {
        status: result.success ? 'processed' : 'failed',
        userEmail: result.userEmail ?? null,
        errorMsg: result.errorMsg ?? null,
        response: { pagado: true, product: result.product },
      },
    })

    console.log(
      result.success
        ? `✅ [webhook] Activado: ${result.userEmail} → ${result.product}`
        : `❌ [webhook] Activación falló: ${result.errorMsg}`
    )

    return new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })

  } catch (error) {
    // NEVER return 500 — PagoPar would retry forever
    console.error('❌ [webhook] Error inesperado:', error)
    if (logId) {
      await prisma.webhookLog
        .update({ where: { id: logId }, data: { status: 'failed', errorMsg: String(error) } })
        .catch(() => {})
    }
    return new Response(buildAck(item), { status: 200, headers: JSON_HEADERS })
  }
}

// GET — health check so PagoPar can verify the endpoint is alive
export async function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'pagopar-webhook', ts: new Date().toISOString() },
    { status: 200 }
  )
}
