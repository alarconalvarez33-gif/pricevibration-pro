import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sendVerificationEmail } from '@/lib/mailer'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  whatsapp: z.string().optional(),
})

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { name, email, password, whatsapp } = result.data

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      // If unverified and expired → delete and allow re-register
      if (!existing.emailVerified && existing.verificationExpires && existing.verificationExpires < new Date()) {
        await prisma.user.delete({ where: { email } })
      } else if (!existing.emailVerified) {
        return NextResponse.json(
          { error: 'Ya existe un registro pendiente de verificación para este email. Revisá tu bandeja de entrada.' },
          { status: 400 }
        )
      } else {
        return NextResponse.json({ error: 'Ya existe una cuenta con ese email' }, { status: 400 })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const code = generateCode()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        whatsapp: whatsapp || null,
        emailVerified: false,
        verificationCode: code,
        verificationExpires: expires,
      },
    })

    await sendVerificationEmail(email, name, code)

    return NextResponse.json({ requiresVerification: true, email }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
