import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/constants'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const where: Record<string, unknown> = { isActive: true }
  if (category) where.category = category

  const resources = await prisma.resource.findMany({
    where,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(resources)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, category, imageUrl, downloadUrl, externalUrl, content, order } = body

  if (!title || !category) {
    return NextResponse.json({ error: 'title and category are required' }, { status: 400 })
  }

  const resource = await prisma.resource.create({
    data: {
      title,
      description: description || null,
      category,
      imageUrl: imageUrl || null,
      downloadUrl: downloadUrl || null,
      externalUrl: externalUrl || null,
      content: content || null,
      order: order ? parseInt(order) : 0,
    },
  })

  return NextResponse.json(resource, { status: 201 })
}
