import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com']

function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email)
}

// PUT /api/admin/results/[id] — update description, date, or active state
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { asset, description, date, active } = body

    const data: Record<string, unknown> = {}
    if (asset !== undefined) data.asset = typeof asset === 'string' && asset.trim() ? asset.trim() : null
    if (description !== undefined) data.description = description.trim()
    if (date !== undefined) data.date = date?.trim() || null
    if (active !== undefined) data.active = active

    await prisma.proofResult.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PUT /api/admin/results]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE /api/admin/results/[id] — delete result
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.proofResult.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/results]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
