import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateFinalPairPoints, calculatePodiumPoints, calculateTopScorerPoints } from '@/lib/scoring'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const question = await prisma.specialQuestion.findUnique({
    where: { id },
    include: { predictions: true },
  })
  if (!question) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!question.result1) return NextResponse.json({ error: 'Results not set' }, { status: 400 })

  const updates = question.predictions.map((p) => {
    let pts = 0
    if (question.type === 'FINAL_PAIR' && question.result2) {
      pts = calculateFinalPairPoints(p.answer1, p.answer2 ?? '', question.result1!, question.result2)
    } else if (question.type === 'PODIUM' && question.result2 && question.result3) {
      pts = calculatePodiumPoints(
        p.answer1, p.answer2, p.answer3,
        question.result1!, question.result2, question.result3
      )
    } else if (question.type === 'TOP_SCORER' && question.result2 && question.result3) {
      pts = calculateTopScorerPoints(
        p.answer1, p.answer2, p.answer3,
        question.result1!, question.result2, question.result3
      )
    }
    return prisma.specialPrediction.update({ where: { id: p.id }, data: { points: pts } })
  })

  await Promise.all(updates)
  return NextResponse.json({ scored: updates.length })
}
