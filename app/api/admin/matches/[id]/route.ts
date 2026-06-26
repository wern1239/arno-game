import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculatePoints, calculateBonusPoints } from '@/lib/scoring'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { homeScore, awayScore, status, homeTeam, awayTeam, askExtraTime, askPenalty, extraTimeResult, penaltyResult } = body

  const match = await prisma.match.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(homeScore !== undefined && { homeScore: parseInt(homeScore) }),
      ...(awayScore !== undefined && { awayScore: parseInt(awayScore) }),
      ...(homeTeam !== undefined && { homeTeam: homeTeam.trim() }),
      ...(awayTeam !== undefined && { awayTeam: awayTeam.trim() }),
      ...(askExtraTime !== undefined && { askExtraTime }),
      ...(askPenalty !== undefined && { askPenalty }),
      ...(extraTimeResult !== undefined && { extraTimeResult }),
      ...(penaltyResult !== undefined && { penaltyResult }),
    },
  })

  if (match.status === 'FINISHED' && match.homeScore !== null && match.awayScore !== null) {
    const predictions = await prisma.prediction.findMany({ where: { matchId: id } })
    await Promise.all(
      predictions.map((p) =>
        prisma.prediction.update({
          where: { id: p.id },
          data: {
            points:
              calculatePoints(p.homeScore, p.awayScore, match.homeScore!, match.awayScore!) +
              calculateBonusPoints(
                p.extraTime,
                p.penalty,
                match.extraTimeResult,
                match.penaltyResult,
                match.askExtraTime,
                match.askPenalty
              ),
          },
        })
      )
    )
  }

  return NextResponse.json(match)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await prisma.prediction.deleteMany({ where: { matchId: id } })
  await prisma.match.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
