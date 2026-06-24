import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const question = await prisma.specialQuestion.findUnique({ where: { id } })
  if (!question) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const now = new Date()
  const isLocked =
    !question.isOpen || (question.deadline != null && now >= question.deadline)
  if (isLocked) return NextResponse.json({ error: 'Closed' }, { status: 403 })

  const body = await req.json()
  const { answer1, answer2, answer3 } = body

  if (!answer1) return NextResponse.json({ error: 'answer1 required' }, { status: 400 })

  try {
    const prediction = await prisma.specialPrediction.upsert({
      where: { userId_questionId: { userId: session.user.id, questionId: id } },
      update: { answer1, answer2: answer2 ?? null, answer3: answer3 ?? null },
      create: {
        userId: session.user.id,
        questionId: id,
        answer1,
        answer2: answer2 ?? null,
        answer3: answer3 ?? null,
      },
    })
    return NextResponse.json(prediction)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
