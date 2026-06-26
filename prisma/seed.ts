import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: 'admin' } })
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: { username: 'admin', password: hashed, role: 'ADMIN' },
    })
    console.log('Created admin user: admin / admin123')
    console.log('⚠️  เปลี่ยนรหัสผ่านหลัง deploy ด้วยนะ!')
  } else {
    console.log('Admin already exists')
  }

  await prisma.specialQuestion.upsert({
    where: { type: 'FINAL_PAIR' },
    update: {},
    create: { type: 'FINAL_PAIR' },
  })
  await prisma.specialQuestion.upsert({
    where: { type: 'PODIUM' },
    update: {},
    create: { type: 'PODIUM' },
  })
  await prisma.specialQuestion.upsert({
    where: { type: 'TOP_SCORER' },
    update: {},
    create: { type: 'TOP_SCORER' },
  })
  console.log('Special questions seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
