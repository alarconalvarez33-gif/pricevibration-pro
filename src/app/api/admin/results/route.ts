import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']
const MAX_ACTIVE = 3
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email)
}

// GET /api/admin/results — returns ALL results (including inactive), with imageData for preview
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const results = await prisma.proofResult.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        mimeType: true,
        description: true,
        date: true,
        order: true,
        active: true,
        createdAt: true,
        // imageData omitted for performance — admin page uses /api/results/image/[id]
      },
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error('[GET /api/admin/results]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST /api/admin/results — create new result
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { imageData, mimeType, description, date } = body

    if (!imageData || !description?.trim()) {
      return NextResponse.json({ error: 'imageData y description son requeridos' }, { status: 400 })
    }

    // Validate mime type
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(mimeType)) {
      return NextResponse.json({ error: 'Formato no permitido. Usá JPG, PNG o WebP.' }, { status: 400 })
    }

    // Validate size (base64 is ~33% larger than binary)
    const base64Part = imageData.includes(',') ? imageData.split(',')[1] : imageData
    const approxBytes = Math.ceil(base64Part.length * 0.75)
    if (approxBytes > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'La imagen no puede superar los 2 MB.' }, { status: 400 })
    }

    // Check active count limit
    const activeCount = await prisma.proofResult.count({ where: { active: true } })
    if (activeCount >= MAX_ACTIVE) {
      return NextResponse.json({
        error: `Máximo ${MAX_ACTIVE} resultados activos. Eliminá uno antes de agregar otro.`,
      }, { status: 400 })
    }

    // Get next order value
    const maxOrder = await prisma.proofResult.aggregate({ _max: { order: true } })
    const nextOrder = (maxOrder._max.order ?? 0) + 1

    const result = await prisma.proofResult.create({
      data: {
        imageData,
        mimeType: mimeType || 'image/jpeg',
        description: description.trim(),
        date: date?.trim() || null,
        order: nextOrder,
        active: true,
      },
    })

    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error('[POST /api/admin/results]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
