/**
 * PagoPar order status query service.
 *
 * ⚠️  ENDPOINT NOTE:
 * PagoPar does not publicly document a "query by hash" endpoint in their
 * standard v2.0 docs. The endpoint below is the most common pattern based
 * on their API structure. If queries return 404 or errors, ask Raúl for the
 * official endpoint from PagoPar support/onboarding docs.
 *
 * Fallback: the reconciliation service handles null responses gracefully —
 * it simply skips that payment until the next cron cycle.
 */

import crypto from 'crypto'

const PAGOPAR_API_BASE = 'https://api.pagopar.com/api/comercios'

export interface PagoparOrderStatus {
  pagado:                     boolean
  cancelado:                  boolean
  monto:                      number | string
  forma_pago?:                string
  fecha_pago?:                string
  hash_pedido:                string
  numero_pedido?:             string
  numero_comprobante_interno?: string
  id_transaccion?:            string
}

/**
 * Query PagoPar for the current status of a given hash_pedido.
 * Returns null if the query fails or the endpoint is not available.
 */
export async function queryPagoparOrder(
  hashPedido: string
): Promise<PagoparOrderStatus | null> {
  const privateKey = (process.env.PAGOPAR_PRIVATE_KEY || '').trim()
  const publicKey  = (process.env.PAGOPAR_PUBLIC_KEY  || '').trim()

  if (!privateKey || !publicKey) {
    console.error('[pagopar-query] Missing API keys')
    return null
  }

  // Token: sha1(PRIVATE_KEY + hash_pedido) — same pattern as initiate-transaction
  const token = crypto
    .createHash('sha1')
    .update(privateKey + hashPedido)
    .digest('hex')

  // Try primary endpoint, then fallback
  const endpoints = [
    `${PAGOPAR_API_BASE}/1.1/retornar-pedido`,
    `${PAGOPAR_API_BASE}/2.0/retornar-pedido`,
    `${PAGOPAR_API_BASE}/1.0/consultar-transaccion`,
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          public_key:  publicKey,
          hash_pedido: hashPedido,
        }),
        signal: AbortSignal.timeout(8000), // 8s timeout per attempt
      })

      if (!response.ok) {
        console.warn(`[pagopar-query] ${endpoint} → HTTP ${response.status}`)
        continue
      }

      const data = await response.json()
      console.log(`[pagopar-query] ${endpoint} response:`, JSON.stringify(data).slice(0, 200))

      // PagoPar wraps results in resultado array or direct object
      const raw: Record<string, unknown> = Array.isArray(data.resultado)
        ? (data.resultado[0] as Record<string, unknown>) ?? {}
        : typeof data.resultado === 'object' && data.resultado !== null
        ? (data.resultado as Record<string, unknown>)
        : (data as Record<string, unknown>)

      // Validate that we got a meaningful response
      if (!raw.hash_pedido && !raw.pagado && !raw.cancelado) {
        console.warn(`[pagopar-query] ${endpoint} → unrecognized response shape`)
        continue
      }

      const pagadoRaw    = raw.pagado
      const canceladoRaw = raw.cancelado

      return {
        pagado:    pagadoRaw   === true || pagadoRaw   === 'true' || pagadoRaw   === 1 || pagadoRaw   === '1',
        cancelado: canceladoRaw === true || canceladoRaw === 'true',
        monto:     (raw.monto as number | string) ?? 0,
        forma_pago:                raw.forma_pago                as string | undefined,
        fecha_pago:                raw.fecha_pago                as string | undefined,
        hash_pedido:               String(raw.hash_pedido ?? hashPedido),
        numero_pedido:             raw.numero_pedido             as string | undefined,
        numero_comprobante_interno: raw.numero_comprobante_interno as string | undefined,
        id_transaccion:            raw.id_transaccion            as string | undefined,
      }

    } catch (err) {
      console.warn(`[pagopar-query] ${endpoint} error:`, err)
    }
  }

  console.error(`[pagopar-query] All endpoints failed for hash: ${hashPedido.slice(0, 16)}...`)
  return null
}
