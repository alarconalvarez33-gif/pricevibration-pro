import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, plan: true, role: true, signalsViewed: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Don't increment for Quantum, Signal Hub Pro users or admins
  if (user.plan === 'quantum' || user.plan === 'signal_hub' || user.plan === 'pro' || user.plan === 'whale' || user.role === 'admin') {
    return NextResponse.json({ success: true, viewed: user.signalsViewed })
  }

  // Don't increment beyond limit
  if (user.signalsViewed >= 3) {
    return NextResponse.json({ success: true, viewed: user.signalsViewed })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { signalsViewed: { increment: 1 } },
    select: { signalsViewed: true },
  })

  return NextResponse.json({ success: true, viewed: updated.signalsViewed })
}
