import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/constants'

export async function GET() {
  try {
    const results = await prisma.galleryResult.findMany({
      where: { isActive: true },
      orderBy: { date: 'desc' },
      take: 50,
    })
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, imageUrl, tool, asset, date, accuracy } = body

  if (!title || !imageUrl || !tool || !asset || !date) {
    return NextResponse.json({ error: 'title, imageUrl, tool, asset y date son requeridos' }, { status: 400 })
  }

  const result = await prisma.galleryResult.create({
    data: {
      title,
      description: description || null,
      imageUrl,
      tool,
      asset,
      date: new Date(date),
      accuracy: accuracy || null,
    },
  })

  return NextResponse.json(result, { status: 201 })
}
