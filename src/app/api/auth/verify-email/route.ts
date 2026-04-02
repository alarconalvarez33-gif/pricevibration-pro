import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email y código requeridos' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true })
    }

    if (!user.verificationCode || !user.verificationExpires) {
      return NextResponse.json({ error: 'No hay código de verificación activo' }, { status: 400 })
    }

    if (new Date() > user.verificationExpires) {
      return NextResponse.json({ error: 'El código expiró. Registrate nuevamente.' }, { status: 400 })
    }

    if (user.verificationCode !== code.trim()) {
      return NextResponse.json({ error: 'Código incorrecto' }, { status: 400 })
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpires: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
