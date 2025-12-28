import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { userCredits, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const creditsData = await db
      .select({
        userId: userCredits.userId,
        balance: userCredits.balance,
        totalPurchased: userCredits.totalPurchased,
        totalUsed: userCredits.totalUsed,
        userName: users.name,
        userEmail: users.email,
      })
      .from(userCredits)
      .leftJoin(users, eq(userCredits.userId, users.id))
      .orderBy(desc(userCredits.totalPurchased))

    return NextResponse.json({ users: creditsData })
  } catch (error) {
    console.error('Error fetching user credits:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
