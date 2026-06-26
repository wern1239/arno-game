import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const matches = await prisma.match.findMany({
    orderBy: [{ weekNumber: 'asc' }, { matchDate: 'asc' }],
    include: { _count: { select: { predictions: true } } },
  })
  return NextResponse.json(matches)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { homeTeam, awayTeam, matchDate, weekNumber, askExtraTime, askPenalty } = await req.json()

  if (!homeTeam || !awayTeam || !matchDate || !weekNumber) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
  }

  const match = await prisma.match.create({
    data: {
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      matchDate: new Date(matchDate),
      weekNumber: parseInt(weekNumber),
      askExtraTime: askExtraTime ?? false,
      askPenalty: askPenalty ?? false,
    },
  })

  return NextResponse.json(match)
}
