import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { username, password, displayName } = await req.json()

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
      data: { username, password: hashed, displayName: displayName.trim() },
    })

    return NextResponse.json({ id: user.id, username: user.username })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 })
  }
}
