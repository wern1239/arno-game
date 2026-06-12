import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { content } = await req.json()
  if (!content?.trim()) {
    return NextResponse.json({ error: 'กรุณากรอกข้อความประกาศ' }, { status: 400 })
  }

  const announcement = await prisma.announcement.create({
    data: { content: content.trim() },
  })
  return NextResponse.json(announcement)
}
