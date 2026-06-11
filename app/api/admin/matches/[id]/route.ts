import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculatePoints } from '@/lib/scoring'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { homeScore, awayScore, status } = body

  const match = await prisma.match.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(homeScore !== undefined && { homeScore: parseInt(homeScore) }),
      ...(awayScore !== undefined && { awayScore: parseInt(awayScore) }),
    },
  })

  if (status === 'FINISHED' && homeScore !== undefined && awayScore !== undefined) {
    const predictions = await prisma.prediction.findMany({ where: { matchId: id } })
    await Promise.all(
      predictions.map((p) =>
        prisma.prediction.update({
          where: { id: p.id },
          data: { points: calculatePoints(p.homeScore, p.awayScore, parseInt(homeScore), parseInt(awayScore)) },
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
