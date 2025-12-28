import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { userCredits, tokenUsageLogs, billingConfig } from '@/lib/db/schema'
import { sum, count, gte, sql } from 'drizzle-orm'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    // Total credits sold (currently in circulation)
    const [totalCreditsResult] = await db
      .select({ total: sum(userCredits.balance) })
      .from(userCredits)

    const totalCreditsInCirculation = parseInt(totalCreditsResult?.total || '0')

    // Total tokens used (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [tokensLast30Days] = await db
      .select({
        total: sum(tokenUsageLogs.totalTokens),
        count: count(),
      })
      .from(tokenUsageLogs)
      .where(gte(tokenUsageLogs.createdAt, thirtyDaysAgo))

    // Get API limit config
    const apiLimitConfig = await db.query.billingConfig.findFirst({
      where: sql`${billingConfig.key} = 'api_monthly_limit_tokens'`,
    })

    const apiMonthlyLimit = parseInt(apiLimitConfig?.value || '100000000')
    const tokensUsedLast30Days = parseInt(tokensLast30Days?.total || '0')

    // Calculate potential tokens from sold credits (1 credit = 1000 tokens)
    const potentialTokensFromCredits = totalCreditsInCirculation * 1000

    // Usage percentage
    const usagePercent = (tokensUsedLast30Days / apiMonthlyLimit) * 100
    const potentialUsagePercent = (potentialTokensFromCredits / apiMonthlyLimit) * 100

    return NextResponse.json({
      totalCreditsInCirculation,
      potentialTokensFromCredits,
      apiMonthlyLimit,
      tokensUsedLast30Days,
      totalAnalysesLast30Days: tokensLast30Days?.count || 0,
      usagePercent: Math.round(usagePercent * 100) / 100,
      potentialUsagePercent: Math.round(potentialUsagePercent * 100) / 100,
      alertThreshold: potentialUsagePercent > 80,
    })
  } catch (error) {
    console.error('Error fetching credit stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
