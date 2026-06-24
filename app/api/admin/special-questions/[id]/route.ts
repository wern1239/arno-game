import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return null
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const { isOpen, deadline, result1, result2, result3 } = body

  const data: Record<string, unknown> = {}
  if (typeof isOpen === 'boolean') data.isOpen = isOpen
  if ('deadline' in body) data.deadline = deadline ? new Date(deadline) : null
  if ('result1' in body) data.result1 = result1 ?? null
  if ('result2' in body) data.result2 = result2 ?? null
  if ('result3' in body) data.result3 = result3 ?? null

  const clearing = 'result1' in body && !result1

  const [question] = await prisma.$transaction([
    prisma.specialQuestion.update({ where: { id }, data }),
    ...(clearing
      ? [prisma.specialPrediction.updateMany({ where: { questionId: id }, data: { points: 0 } })]
      : []),
  ])

  return NextResponse.json(question)
}
