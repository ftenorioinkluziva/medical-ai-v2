import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { adminAdjustCredits } from '@/lib/billing/credits'
import { z } from 'zod'

const adjustSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int(),
  reason: z.string().min(1),
})

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { userId, amount, reason } = adjustSchema.parse(body)

    const result = await adminAdjustCredits(userId, amount, reason, session.user.id)

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
    })
  } catch (error) {
    console.error('Error adjusting credits:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to adjust credits'
    }, { status: 500 })
  }
}
