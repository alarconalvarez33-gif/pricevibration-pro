import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/results/image/[id] — serves base64 image as binary
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await prisma.proofResult.findUnique({
      where: { id: params.id },
      select: { imageData: true, mimeType: true, active: true },
    })

    if (!result || !result.active) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Strip data URI prefix if present (data:image/jpeg;base64,...)
    const base64 = result.imageData.includes(',')
      ? result.imageData.split(',')[1]
      : result.imageData

    const buffer = Buffer.from(base64, 'base64')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': result.mimeType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('[GET /api/results/image]', error)
    return new NextResponse('Error', { status: 500 })
  }
}
