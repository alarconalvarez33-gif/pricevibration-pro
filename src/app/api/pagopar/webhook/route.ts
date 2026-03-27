import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendRenewalReminderEmail } from '@/lib/email'

const PRIVATE_KEY = '85ece630fff92520e3943f1f2a8d3c60'

/**
 * Construye la respuesta exacta de 9 campos que Pagopar requiere del webhook.
 * Sin estos 9 campos exactos, Pagopar responde con
 * "No coinciden los campos o la cantidad no es 9".
 */
function buildRespuesta9(item: Record<string, unknown>, pagadoFinal: boolean): string {
  const now = new Date()
  const resultado = [
    {
      pagado: pagadoFinal,
      numero_comprobante_interno:
        (item.numero_comprobante as string) ||
        (item.numero_comprobante_interno as string) ||
        String(Date.now()),
      id_pedido: (item.numero_pedido as string) || (item.id_pedido as string) || '',
      monto: (item.monto as number) || 0,
      fecha_pago: now.toISOString().split('T')[0],
      hora_pago: now.toTimeString().split(' ')[0],
      id_transaccion: (item.id_transaccion as string) || '',
      medio_pago: (item.medio_pago as string) || '',
      codigo_autorizacion: (item.codigo_autorizacion as string) || '',
    },
  ]

  console.log('📤 Respuesta 9 campos a Pagopar:', JSON.stringify(resultado, null, 2))
  return JSON.stringify(resultado)
}

/** Respuesta de emergencia cuando no tenemos datos del item (error en el catch). */
const RESPUESTA_VACIA = JSON.stringify([
  {
    pagado: false,
    numero_comprobante_interno: '',
    id_pedido: '',
    monto: 0,
    fecha_pago: '',
    hora_pago: '',
    id_transaccion: '',
    medio_pago: '',
    codigo_autorizacion: '',
  },
])

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

export async function POST(request: Request) {
  let primerElemento: Record<string, unknown> = {}

  try {
    const body = await request.json()
    console.log('🔔 Webhook Pagopar recibido:', JSON.stringify(body, null, 2))

    // Pagopar envía: {"resultado":[{...}],"respuesta":true}
    const arrayResultado: Record<string, unknown>[] =
      body.resultado || (Array.isArray(body) ? body : [body])

    primerElemento = (arrayResultado[0] as Record<string, unknown>) || {}

    const { pagado, numero_pedido, hash_pedido, token } = primerElemento as {
      pagado: unknown
      numero_pedido: string
      hash_pedido: string
      token: string
    }

    console.log('📋 Datos del webhook:', { pagado, numero_pedido, hash_pedido, token_recibido: token })

    // ── Validar token: sha1(PRIVATE_KEY + hash_pedido) ─────────────────────
    const expectedToken = crypto
      .createHash('sha1')
      .update(PRIVATE_KEY + hash_pedido)
      .digest('hex')

    const tokenValido = token === expectedToken

    console.log('🔐 Validación token:', {
      hash_pedido,
      token_calculado: expectedToken,
      token_recibido: token,
      valido: tokenValido,
    })

    if (!tokenValido) {
      console.error('❌ Token inválido — NO se procesará el pago (posible fraude)')
      // Responder siempre 200 con los 9 campos para que Pagopar no reintente
      return new Response(buildRespuesta9(primerElemento, false), {
        status: 200,
        headers: JSON_HEADERS,
      })
    }

    console.log('✅ Token válido')

    if (!hash_pedido || !numero_pedido) {
      console.error('❌ Faltan hash_pedido o numero_pedido')
      return new Response(buildRespuesta9(primerElemento, false), {
        status: 200,
        headers: JSON_HEADERS,
      })
    }

    const esPagado =
      pagado === true || pagado === 'true' || pagado === '1' || pagado === 1

    // ── Bifurcación: producto (PROD-) vs suscripción ────────────────────────
    if (numero_pedido?.startsWith('PROD-')) {
      console.log('📦 Procesando pago de PRODUCTO:', numero_pedido)

      const purchase = await prisma.productPurchase.findFirst({
        where: {
          OR: [{ orderId: numero_pedido }, { pagoparHash: hash_pedido }],
        },
      })

      if (!purchase) {
        console.error('❌ ProductPurchase no encontrado:', numero_pedido, hash_pedido)
        return new Response(buildRespuesta9(primerElemento, false), {
          status: 200,
          headers: JSON_HEADERS,
        })
      }

      if (esPagado) {
        await prisma.productPurchase.update({
          where: { id: purchase.id },
          data: { status: 'paid', paidAt: new Date() },
        })
        console.log(`✅ ProductPurchase ${numero_pedido} marcado como PAID`)

        // Si es fisica-cuantica → activar QuantumAccess para el usuario
        if (purchase.productId === 'fisica-cuantica' && purchase.userId) {
          await prisma.quantumAccess.updateMany({
            where: { userId: purchase.userId },
            data: { isPaid: true },
          })
          console.log(`✅ QuantumAccess activado para usuario ${purchase.userId}`)
        }

        // Si es super-estrategia → marcar cursoPurchased en el usuario
        if (purchase.productId === 'super-estrategia' && purchase.userId) {
          await prisma.user.update({
            where: { id: purchase.userId },
            data: { cursoPurchased: true },
          })
          console.log(`✅ cursoPurchased activado para usuario ${purchase.userId}`)
        }
      } else {
        await prisma.productPurchase.update({
          where: { id: purchase.id },
          data: { status: 'failed' },
        })
        console.log(`❌ ProductPurchase ${numero_pedido} marcado como FAILED`)
      }

      return new Response(buildRespuesta9(primerElemento, esPagado), {
        status: 200,
        headers: JSON_HEADERS,
      })
    }

    // ── Suscripción ─────────────────────────────────────────────────────────
    console.log('💳 Procesando pago de SUSCRIPCIÓN:', numero_pedido)

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ orderId: numero_pedido }, { pagoparHash: hash_pedido }],
      },
      include: { user: true },
    })

    if (!payment) {
      console.error('❌ Payment no encontrado:', numero_pedido, hash_pedido)
      return new Response(buildRespuesta9(primerElemento, false), {
        status: 200,
        headers: JSON_HEADERS,
      })
    }

    if (esPagado) {
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
          note: `orderId: ${payment.orderId}`,
        },
      })

      console.log(
        `✅ Usuario ${payment.user.email} activado → plan ${payment.planType} hasta ${premiumUntil.toISOString()}`
      )
      // Suppress unused import warning
      void sendRenewalReminderEmail
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      })
      console.log(`❌ Pago fallido para pedido ${numero_pedido}`)
    }

    return new Response(buildRespuesta9(primerElemento, esPagado), {
      status: 200,
      headers: JSON_HEADERS,
    })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    // Si tenemos datos del item, usar buildRespuesta9; si no, usar la vacía
    const body =
      Object.keys(primerElemento).length > 0
        ? buildRespuesta9(primerElemento, false)
        : RESPUESTA_VACIA
    return new Response(body, { status: 200, headers: JSON_HEADERS })
  }
}

// GET para validar que la URL del webhook está activa
export async function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'pagopar-webhook', timestamp: new Date().toISOString() },
    { status: 200 }
  )
}
