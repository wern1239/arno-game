import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sponsors = await prisma.sponsor.findMany({
    where: { archived: false },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sponsors)
}
