import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, prize } = await req.json()
  if (!name?.trim() || !prize?.trim()) {
    return NextResponse.json({ error: 'กรุณากรอกชื่อสปอนเซอร์และของรางวัล' }, { status: 400 })
  }

  const sponsor = await prisma.sponsor.create({
    data: { name: name.trim(), prize: prize.trim() },
  })
  return NextResponse.json(sponsor)
}
