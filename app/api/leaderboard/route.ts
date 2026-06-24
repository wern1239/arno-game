import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const week = searchParams.get('week')

  const specialQuery = prisma.specialPrediction.findMany({
    include: { question: { select: { type: true, result1: true, result2: true, result3: true } } },
  })

  const [users, specialPredictions] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'USER' },
      include: {
        predictions: {
          where: week
            ? { match: { weekNumber: parseInt(week) } }
            : undefined,
          include: {
            match: {
              select: {
                status: true,
                homeTeam: true,
                awayTeam: true,
                homeScore: true,
                awayScore: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    week ? Promise.resolve([] as Awaited<typeof specialQuery>) : specialQuery,
  ])

  const specialByUser = new Map<string, typeof specialPredictions>()
  for (const sp of specialPredictions) {
    if (!specialByUser.has(sp.userId)) specialByUser.set(sp.userId, [])
    specialByUser.get(sp.userId)!.push(sp)
  }

  const leaderboard = users.map((user) => {
    const finished = user.predictions.filter((p) => p.match.status === 'FINISHED')
    const matchPoints = finished.reduce((sum, p) => sum + p.points, 0)
    const userSpecial = specialByUser.get(user.id) ?? []
    const specialPoints = userSpecial.reduce((sum, p) => sum + p.points, 0)
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      totalPoints: matchPoints + specialPoints,
      matchPoints,
      specialPoints,
      totalPredictions: user.predictions.length,
      correct: finished.filter((p) => p.points > 0).length,
      exact: finished.filter((p) => p.points === 3).length,
      history: finished.map((p) => ({
        homeTeam: p.match.homeTeam,
        awayTeam: p.match.awayTeam,
        predictedHome: p.homeScore,
        predictedAway: p.awayScore,
        actualHome: p.match.homeScore,
        actualAway: p.match.awayScore,
        points: p.points,
      })),
      specialHistory: userSpecial.map((p) => ({
        type: p.question.type,
        answer1: p.answer1,
        answer2: p.answer2,
        answer3: p.answer3,
        points: p.points,
        result1: p.question.result1,
        result2: p.question.result2,
        result3: p.question.result3,
      })),
    }
  })

  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints)

  return NextResponse.json(leaderboard)
}
