import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    where: { archived: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(announcements)
}
