import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ hasAccess: false, reason: 'unauthenticated' })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { plan: true, cursoPurchased: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ hasAccess: false, reason: 'user_not_found' })
    }

    const hasAccess =
      user.plan !== 'free' || user.cursoPurchased === true || user.role === 'admin'

    return NextResponse.json({ hasAccess, cursoPurchased: user.cursoPurchased, plan: user.plan })
  } catch (error) {
    console.error('check-access error:', error)
    return NextResponse.json({ hasAccess: false, reason: 'error' }, { status: 500 })
  }
}
