import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
    if (q.length < 3) return NextResponse.json({ users: [] })

    const users = await prisma.user.findMany({
      where: {
        email: { contains: q, mode: 'insensitive' },
      },
      select: { email: true, name: true, plan: true },
      take: 8,
      orderBy: { email: 'asc' },
    })

    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ users: [] })
  }
}
