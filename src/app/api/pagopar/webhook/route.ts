import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const PRIVATE_KEY = '85ece630fff92520e3943f1f2a8d3c60'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('🔔 Webhook Pagopar recibido:', JSON.stringify(body, null, 2))

    // Pagopar envía: {"resultado":[{...}],"respuesta":true}
    // Extraer SOLO el array resultado
    const arrayResultado = body.resultado || (Array.isArray(body) ? body : [body])
    const primerElemento = arrayResultado[0]
    const { pagado, numero_pedido, hash_pedido, token } = primerElemento

    console.log('📋 Array resultado extraído:', JSON.stringify(arrayResultado, null, 2))
    console.log('📋 Primer elemento:', {
      pagado,
      numero_pedido,
      hash_pedido,
      token_recibido: token,
    })

    // Validar token del webhook según documentación de Pagopar
    // Token = sha1(PRIVATE_KEY + hash_pedido)
    const concatenacion = PRIVATE_KEY + hash_pedido
    const expectedToken = crypto
      .createHash('sha1')
      .update(concatenacion)
      .digest('hex')

    console.log('🔐 Validación de token:', {
      private_key: PRIVATE_KEY,
      hash_pedido,
      concatenacion_length: concatenacion.length,
      token_calculado: expectedToken,
      token_recibido: token,
      coincide: token === expectedToken,
    })

    // Validar token pero siempre retornar 200 a Pagopar
    const tokenValido = token === expectedToken

    if (!tokenValido) {
      console.error('❌ Token inválido - NO se procesará el pago (posible fraude)', {
        received: token,
        expected: expectedToken,
        hash_pedido,
      })
      // IMPORTANTE: Retornar SOLO el array para que Pagopar no reintente
      return new Response(JSON.stringify(arrayResultado), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Token validado correctamente')

    if (!hash_pedido || !numero_pedido) {
      console.error('❌ Missing hash_pedido or numero_pedido')
      return new Response(JSON.stringify(arrayResultado), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Buscar el pago en la base de datos
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { orderId: numero_pedido },
          { pagoparHash: hash_pedido },
        ],
      },
      include: { user: true },
    })

    if (!payment) {
      console.error('Pago no encontrado:', numero_pedido, hash_pedido)
      return new Response(JSON.stringify(arrayResultado), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Procesar resultado del pago
    if (pagado === true || pagado === 'true' || pagado === '1' || pagado === 1) {
      const premiumUntil = new Date()
      if (payment.billingPeriod === 'yearly') {
        premiumUntil.setFullYear(premiumUntil.getFullYear() + 1)
      } else {
        premiumUntil.setMonth(premiumUntil.getMonth() + 1)
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      })

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          isPremium: true,
          premiumUntil,
          plan: payment.planType,
        },
      })

      console.log(
        `✅ Usuario ${payment.user.email} actualizado a ${payment.planType} hasta ${premiumUntil.toISOString()}`
      )
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      })

      console.log(`❌ Pago fallido para pedido ${numero_pedido}`)
    }

    // Devolver SOLO el array (sin envoltura de "respuesta" y "resultado")
    console.log('📤 Retornando a Pagopar:', JSON.stringify(arrayResultado, null, 2))
    return new Response(JSON.stringify(arrayResultado), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    // En caso de error, retornar un array vacío
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// GET para validación de URL
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'pagopar-webhook',
    timestamp: new Date().toISOString()
  }, { status: 200 })
}
