import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, days = 30 } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const premiumUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    const user = await prisma.user.update({
      where: { email },
      data: {
        plan: 'quantum',
        isPremium: true,
        premiumUntil,
        subscriptionStatus: 'active',
        autoRenew: true,
        cancelledAt: null,
      },
      select: { id: true, email: true, plan: true, isPremium: true, premiumUntil: true },
    })

    await prisma.subscriptionLog.create({
      data: {
        userId: user.id,
        event: 'activated',
        plan: 'quantum',
        note: `Activación manual por admin (${session.user.email}) — ${days} días`,
      },
    })

    console.log(`✅ Admin activó a ${email} → quantum hasta ${premiumUntil.toISOString()}`)

    return NextResponse.json({ success: true, user })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('❌ activate-user error:', msg)
    if (msg.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Usuario no encontrado: ' + msg }, { status: 404 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
