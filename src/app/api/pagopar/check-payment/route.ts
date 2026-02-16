import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hash = searchParams.get('hash')

    if (!hash) {
      return NextResponse.json(
        {
          status: 'not_found',
          message: 'Hash de pago no proporcionado',
        },
        { status: 400 }
      )
    }

    // Buscar el pago por el hash de Pagopar
    let payment = await prisma.payment.findFirst({
      where: {
        pagoparHash: hash,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isPremium: true,
            premiumUntil: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        {
          status: 'not_found',
          message: 'No se encontró información sobre este pago',
        },
        { status: 404 }
      )
    }

    // 🆕 SISTEMA DE RESPALDO: Si el pago está pendiente, verificar con Pagopar directamente
    if (payment.status === 'pending') {
      console.log('⚠️ Pago pendiente detectado. Verificando con Pagopar...')

      const privateKey = process.env.PAGOPAR_PRIVATE_KEY
      const publicKey = process.env.PAGOPAR_PUBLIC_KEY

      if (privateKey && publicKey) {
        try {
          // Crear token para consulta: sha1(PRIVATE_KEY + "CONSULTA")
          const token = crypto
            .createHash('sha1')
            .update(`${privateKey}CONSULTA`)
            .digest('hex')

          const pagoparBody = {
            token: publicKey,
            hash_pedido: payment.pagoparHash,
            hash: token,
          }

          // Consultar estado real en Pagopar
          const pagoparResponse = await fetch('https://api.pagopar.com/api/pedidos/1.1/traer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pagoparBody),
          })

          const pagoparData = await pagoparResponse.json()
          console.log('📡 Respuesta de Pagopar:', JSON.stringify(pagoparData, null, 2))

          // Pagopar puede retornar: { resultado: [{...}], respuesta: true }
          const resultado = pagoparData.resultado?.[0] || pagoparData
          const pagado = resultado.pagado

          // Si Pagopar confirma que está pagado, actualizar usuario y pago
          if (pagado === true || pagado === 'true' || pagado === '1' || pagado === 1) {
            console.log('✅ Pagopar confirma pago. Activando usuario...')

            // Calcular fecha de expiración
            const premiumUntil = new Date()
            if (payment.billingPeriod === 'yearly') {
              premiumUntil.setFullYear(premiumUntil.getFullYear() + 1)
            } else {
              premiumUntil.setMonth(premiumUntil.getMonth() + 1)
            }

            // Actualizar pago a "paid"
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: 'paid',
                paidAt: new Date(),
              },
            })

            // Actualizar usuario a premium
            await prisma.user.update({
              where: { id: payment.userId },
              data: {
                isPremium: true,
                premiumUntil,
                plan: payment.planType,
              },
            })

            console.log(`🎉 Usuario ${payment.user.email} activado exitosamente vía respaldo`)

            // Actualizar variable local para retornar estado correcto
            payment = {
              ...payment,
              status: 'paid',
              paidAt: new Date(),
            }
          } else {
            console.log('⏳ Pagopar aún no confirma el pago')
          }
        } catch (pagoparError) {
          console.error('❌ Error consultando Pagopar:', pagoparError)
          // Continuar con el estado actual de la DB si falla la consulta
        }
      } else {
        console.warn('⚠️ Credenciales de Pagopar no configuradas para respaldo')
      }
    }

    // Preparar la respuesta con los detalles del pago (actualizado si fue necesario)
    const response = {
      status: payment.status as 'pending' | 'paid' | 'failed',
      orderId: payment.orderId,
      planType: payment.planType,
      billingPeriod: payment.billingPeriod,
      amount: payment.amount,
      currency: payment.currency || 'PYG',
      paidAt: payment.paidAt?.toISOString(),
      createdAt: payment.createdAt.toISOString(),
      message:
        payment.status === 'paid'
          ? '¡Pago completado exitosamente!'
          : payment.status === 'failed'
          ? 'El pago no pudo ser procesado'
          : 'Esperando confirmación del pago',
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      {
        status: 'not_found',
        message: 'Error al verificar el estado del pago',
      },
      { status: 500 }
    )
  }
}
