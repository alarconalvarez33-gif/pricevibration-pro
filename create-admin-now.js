const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔐 Hasheando password...')
    const hashedPassword = await bcrypt.hash('ra', 12)

    console.log('👤 Creando usuario admin...')
    const admin = await prisma.user.upsert({
      where: { email: 'raul@sacredlevels.com' },
      update: {
        password: hashedPassword,
        name: 'Raul',
        isPremium: true,
        premiumUntil: new Date('2099-12-31'),
        plan: 'whale',
        role: 'admin',
      },
      create: {
        email: 'raul@sacredlevels.com',
        name: 'Raul',
        password: hashedPassword,
        isPremium: true,
        premiumUntil: new Date('2099-12-31'),
        plan: 'whale',
        role: 'admin',
      },
    })

    console.log('\n✅ ¡USUARIO ADMIN CREADO EXITOSAMENTE!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:    raul@sacredlevels.com')
    console.log('🔑 Password: ra')
    console.log('👑 Role:     admin')
    console.log('🐋 Plan:     whale')
    console.log('⏰ Acceso:   Permanente (hasta 2099)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    return admin
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
