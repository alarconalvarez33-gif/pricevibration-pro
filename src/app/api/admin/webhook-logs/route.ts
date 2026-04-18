import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { activatePayment, activateProductPurchase } from '@/lib/services/payment-activation'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

// GET — list recent webhook logs
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // optional filter
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200)

  const logs = await prisma.webhookLog.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({ logs })
}

// POST — retry a failed activation
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { logId } = await request.json()
  if (!logId) return NextResponse.json({ error: 'logId requerido' }, { status: 400 })

  const log = await prisma.webhookLog.findUnique({ where: { id: logId } })
  if (!log) return NextResponse.json({ error: 'Log no encontrado' }, { status: 404 })

  const hashPedido = log.hashPedido
  if (!hashPedido) return NextResponse.json({ error: 'Log sin hash_pedido' }, { status: 400 })

  const payment = await prisma.payment.findFirst({
    where: { pagoparHash: hashPedido },
    select: { id: true },
  })
  const purchase = payment
    ? null
    : await prisma.productPurchase.findFirst({
        where: { pagoparHash: hashPedido },
        select: { id: true },
      })

  if (!payment && !purchase) {
    return NextResponse.json({ error: 'Pago no encontrado para este log' }, { status: 404 })
  }

  const params = {
    source: 'admin_manual' as const,
    triggeredBy: session.user.email,
  }

  const result = payment
    ? await activatePayment(payment.id, params)
    : await activateProductPurchase(purchase!.id, params)

  if (result.success) {
    await prisma.webhookLog.update({
      where: { id: logId },
      data: { status: 'processed', errorMsg: result.alreadyProcessed ? 'retried-already-done' : null },
    })
  }

  return NextResponse.json(result)
}
