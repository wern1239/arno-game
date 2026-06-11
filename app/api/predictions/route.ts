import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const matchId = searchParams.get('matchId')

  const predictions = await prisma.prediction.findMany({
    where: matchId ? { userId: session.user.id, matchId } : { userId: session.user.id },
  })
  return NextResponse.json(predictions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { matchId, homeScore, awayScore } = await req.json()

  if (homeScore === undefined || awayScore === undefined || homeScore < 0 || awayScore < 0) {
    return NextResponse.json({ error: 'ข้อมูลสกอร์ไม่ถูกต้อง' }, { status: 400 })
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) return NextResponse.json({ error: 'ไม่พบแมตช์นี้' }, { status: 404 })
  if (match.status !== 'UPCOMING') {
    return NextResponse.json({ error: 'แมตช์เริ่มแล้ว ไม่สามารถแก้ไขได้' }, { status: 400 })
  }
  if (new Date() >= match.matchDate) {
    return NextResponse.json({ error: 'เลยเวลาทายแล้ว' }, { status: 400 })
  }

  const prediction = await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.user.id, matchId } },
    update: { homeScore: parseInt(homeScore), awayScore: parseInt(awayScore) },
    create: {
      userId: session.user.id,
      matchId,
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
    },
  })

  return NextResponse.json(prediction)
}
