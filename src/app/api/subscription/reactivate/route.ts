import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendReactivationEmail } from '@/lib/email'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  if (user.subscriptionStatus !== 'cancelled') {
    return NextResponse.json({ error: 'La suscripción no está cancelada' }, { status: 400 })
  }

  // Can only reactivate if still within the paid period
  const now = new Date()
  if (!user.premiumUntil || user.premiumUntil < now) {
    return NextResponse.json({
      error: 'El período de acceso expiró. Suscribite nuevamente desde Planes.',
    }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'active',
      autoRenew: true,
      cancelledAt: null,
    },
  })

  await prisma.subscriptionLog.create({
    data: { userId: user.id, event: 'reactivated', plan: user.plan, note: 'Reactivado por el usuario' },
  })

  sendReactivationEmail(user.email, user.name || '', user.plan, user.premiumUntil).catch(console.error)

  return NextResponse.json({ success: true })
}
