import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id ?? null

  const questions = await prisma.specialQuestion.findMany({
    include: {
      predictions: userId
        ? { where: { userId } }
        : false,
    },
  })

  return NextResponse.json(
    questions.map((q) => ({
      id: q.id,
      type: q.type,
      isOpen: q.isOpen,
      deadline: q.deadline,
      result1: q.result1,
      result2: q.result2,
      result3: q.result3,
      myPrediction: q.predictions?.[0] ?? null,
    }))
  )
}
