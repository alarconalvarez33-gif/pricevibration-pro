import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

export async function GET() {
  const session = await getServerSession(authOptions)
  const email   = session?.user?.email

  if (!email || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const logs = await prisma.reconciliationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json({ logs })
}
