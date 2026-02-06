import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const hashedPassword = await bcrypt.hash('ra', 12)

    const admin = await prisma.user.upsert({
      where: { email: 'raul' },
      update: {
        password: hashedPassword,
        isPremium: true,
        premiumUntil: new Date('2099-12-31'),
        plan: 'whale',
        role: 'admin',
      },
      create: {
        email: 'raul',
        name: 'Raúl Admin',
        password: hashedPassword,
        isPremium: true,
        premiumUntil: new Date('2099-12-31'),
        plan: 'whale',
        role: 'admin',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        email: admin.email,
        role: admin.role,
        plan: admin.plan,
      },
    })
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
