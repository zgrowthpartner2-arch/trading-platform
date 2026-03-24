import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@trading.com' },
    update: {},
    create: {
      email: 'admin@trading.com',
      password: adminPassword,
      referralCode: nanoid(8),
      isAdmin: true,
      wallet: {
        create: {
          balance: 10000
        }
      }
    }
  })

  console.log('Admin user created:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
