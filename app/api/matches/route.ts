import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const matches = await prisma.match.findMany({
    orderBy: [{ weekNumber: 'asc' }, { matchDate: 'asc' }],
    include: { _count: { select: { predictions: true } } },
  })
  return NextResponse.json(matches)
}
