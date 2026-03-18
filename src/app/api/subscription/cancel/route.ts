import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendCancellationEmail } from '@/lib/email'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  if (!user.isPremium || user.plan === 'free') {
    return NextResponse.json({ error: 'No tenés una suscripción activa' }, { status: 400 })
  }

  if (user.subscriptionStatus === 'cancelled') {
    return NextResponse.json({ error: 'La suscripción ya está cancelada' }, { status: 400 })
  }

  const now = new Date()
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'cancelled',
      autoRenew: false,
      cancelledAt: now,
    },
  })

  await prisma.subscriptionLog.create({
    data: { userId: user.id, event: 'cancelled', plan: user.plan, note: 'Cancelado por el usuario' },
  })

  // Send confirmation email (non-blocking)
  if (user.premiumUntil) {
    sendCancellationEmail(user.email, user.name || '', user.premiumUntil).catch(console.error)
  }

  return NextResponse.json({
    success: true,
    premiumUntil: user.premiumUntil?.toISOString() || null,
  })
}
