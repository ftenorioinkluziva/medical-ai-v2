import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getCreditHistory } from '@/lib/billing/credits'

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const history = await getCreditHistory(session.user.id, limit)

    return NextResponse.json({ transactions: history })
  } catch (error) {
    console.error('Error fetching credit history:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
