import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isAdmin(user: any) {
  return user?.email === 'raul@sacredlevels.com' || user?.role === 'admin'
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { count } = await prisma.priceLevel.deleteMany({})
  return NextResponse.json({ success: true, deleted: count })
}
