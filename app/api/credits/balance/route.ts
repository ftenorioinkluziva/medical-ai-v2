import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getUserCredits } from '@/lib/billing/credits'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const credits = await getUserCredits(session.user.id)

    return NextResponse.json({
      balance: credits.balance,
      totalPurchased: credits.totalPurchased,
      totalUsed: credits.totalUsed,
    })
  } catch (error) {
    console.error('Error fetching credit balance:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
