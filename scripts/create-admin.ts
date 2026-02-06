import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables from .env
try {
  const envContent = readFileSync(resolve(process.cwd(), '.env'), 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value.trim()
      }
    }
  })
} catch (error) {
  console.error('Warning: Could not load .env file')
}

const prisma = new PrismaClient()

async function createAdmin() {
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

    console.log('✅ Admin user created:', admin.email)
    console.log('   Email: raul')
    console.log('   Password: ra')
    console.log('   Role:', admin.role)
    console.log('   Plan:', admin.plan)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
