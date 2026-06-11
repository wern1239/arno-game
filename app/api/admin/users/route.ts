import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { predictions: true } } },
  })

  return NextResponse.json(users.map((u) => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    role: u.role,
    createdAt: u.createdAt,
    predictions: u._count.predictions,
  })))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { username, password, displayName, role } = await req.json()

  if (!username?.trim() || !password || !displayName?.trim()) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
  }
  if (username.length < 3) {
    return NextResponse.json({ error: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({ where: { username } })
  if (exists) {
    return NextResponse.json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { username, password: hashed, displayName: displayName.trim(), role: role === 'ADMIN' ? 'ADMIN' : 'USER' },
  })

  return NextResponse.json({ id: user.id, username: user.username, role: user.role })
}
