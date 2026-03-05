import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/constants'

const N = 8

function calculateLevels(max: number, min: number) {
  const range = max - min
  const levels = []

  for (let n = 0; n <= N; n++) {
    const position = Math.pow(n / N, 2)
    const price = min + range * position
    const probability = Math.round(Math.pow(n / N, 2) * 100 * 10) / 10
    const type: 'accumulation' | 'equilibrium' | 'distribution' =
      n <= 3 ? 'accumulation' : n <= 5 ? 'equilibrium' : 'distribution'
    const strength: 'extreme' | 'strong' | 'moderate' =
      n === 0 || n === N ? 'extreme' : n <= 2 || n >= 6 ? 'strong' : 'moderate'

    levels.push({
      n,
      price: Math.round(price * 100) / 100,
      probability,
      type,
      strength,
    })
  }

  return levels
}

export async function GET() {
  const active = await prisma.quantumLiveLevel.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!active) {
    return NextResponse.json(null)
  }

  return NextResponse.json(active)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { asset, maxPrice, minPrice } = body

  if (!asset || !maxPrice || !minPrice) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const max = parseFloat(maxPrice)
  const min = parseFloat(minPrice)

  if (isNaN(max) || isNaN(min) || min >= max) {
    return NextResponse.json({ error: 'Invalid price range' }, { status: 400 })
  }

  // Deactivate previous levels for same asset
  await prisma.quantumLiveLevel.updateMany({
    where: { asset, isActive: true },
    data: { isActive: false },
  })

  const levels = calculateLevels(max, min)

  const record = await prisma.quantumLiveLevel.create({
    data: {
      asset,
      maxPrice: max,
      minPrice: min,
      levels,
      isActive: true,
    },
  })

  return NextResponse.json(record, { status: 201 })
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { id, isActive, touch } = body

  if (touch) {
    const current = await prisma.quantumLiveLevel.findUnique({ where: { id } })
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const touches = Array.isArray(current.touches) ? (current.touches as object[]) : []
    const updated = await prisma.quantumLiveLevel.update({
      where: { id },
      data: { touches: [...touches, touch] },
    })
    return NextResponse.json(updated)
  }

  const updated = await prisma.quantumLiveLevel.update({
    where: { id },
    data: { isActive },
  })

  return NextResponse.json(updated)
}
