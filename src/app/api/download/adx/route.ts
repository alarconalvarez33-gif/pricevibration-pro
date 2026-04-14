import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasFullAccess } from '@/lib/constants'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  // 1. Must be logged in
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login?redirect=/courses/adx', process.env.NEXTAUTH_URL || 'https://sacredlevels.com'))
  }

  const user = session.user as any
  const vip  = hasFullAccess(user.email)

  // 2. Must have purchased (unless VIP)
  if (!vip) {
    const paid = await prisma.productPurchase.findFirst({
      where: { userId: user.id, productId: 'adx', status: 'paid' },
    })
    if (!paid) {
      return new NextResponse('Acceso denegado. Necesitás comprar la Estrategia ADX.', { status: 403 })
    }
  }

  // 3. Serve the PDF with forced download headers
  const filePath = path.join(process.cwd(), 'public', 'guiaadx.pdf')

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Archivo no disponible aún. Intenta en unos minutos.', { status: 404 })
  }

  const fileBuffer = fs.readFileSync(filePath)

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Guia-ADX-SacredLevels.pdf"',
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'no-store',
    },
  })
}
