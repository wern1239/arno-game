import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const predictions = await prisma.prediction.findMany({
    where: { userId: session.user.id },
    include: {
      match: {
        select: { homeTeam: true, awayTeam: true, status: true, homeScore: true, awayScore: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(predictions)
}
