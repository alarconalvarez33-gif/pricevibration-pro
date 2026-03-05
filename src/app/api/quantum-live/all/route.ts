import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/constants'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const records = await prisma.quantumLiveLevel.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(records)
}
