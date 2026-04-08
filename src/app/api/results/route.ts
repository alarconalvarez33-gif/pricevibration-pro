import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/results — public, returns active ProofResults (no imageData for performance)
export async function GET() {
  try {
    const results = await prisma.proofResult.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      take: 3,
      select: {
        id: true,
        mimeType: true,
        description: true,
        date: true,
        order: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ results })
  } catch (error) {
    console.error('[GET /api/results]', error)
    return NextResponse.json({ results: [] })
  }
}
