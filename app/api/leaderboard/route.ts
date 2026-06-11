import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const week = searchParams.get('week')

  const users = await prisma.user.findMany({
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
  })

  const leaderboard = users.map((user) => {
    const finished = user.predictions.filter((p) => p.match.status === 'FINISHED')
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      totalPoints: finished.reduce((sum, p) => sum + p.points, 0),
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
    }
  })

  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints)

  return NextResponse.json(leaderboard)
}
