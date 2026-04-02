import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Deletes unverified accounts whose verification window has expired (>24h)
export async function GET() {
  try {
    const result = await prisma.user.deleteMany({
      where: {
        emailVerified: false,
        verificationExpires: { lt: new Date() },
      },
    })

    console.log(`cleanup-unverified: deleted ${result.count} expired unverified accounts`)
    return NextResponse.json({ deleted: result.count })
  } catch (error) {
    console.error('cleanup-unverified error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
