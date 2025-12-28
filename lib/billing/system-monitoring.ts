import { db } from '@/lib/db/client'
import { userCredits, tokenUsageLogs, billingConfig } from '@/lib/db/schema'
import { sum, gte, sql } from 'drizzle-orm'

/**
 * Check if system is approaching API limit
 */
export async function checkSystemApiLimit(): Promise<{
  shouldPauseSales: boolean
  usagePercent: number
  details: {
    potentialTokens: number
    apiLimit: number
    tokensUsedLast30Days: number
  }
}> {
  // Get total credits in circulation
  const [creditsResult] = await db
    .select({ total: sum(userCredits.balance) })
    .from(userCredits)

  const totalCredits = parseInt(creditsResult?.total || '0')
  const potentialTokens = totalCredits * 1000 // 1 credit = 1000 tokens

  // Get API limit config
  const limitConfig = await db.query.billingConfig.findFirst({
    where: sql`${billingConfig.key} = 'api_monthly_limit_tokens'`,
  })

  const thresholdConfig = await db.query.billingConfig.findFirst({
    where: sql`${billingConfig.key} = 'alert_threshold_percent'`,
  })

  const apiLimit = parseInt(limitConfig?.value || '100000000')
  const thresholdPercent = parseInt(thresholdConfig?.value || '80')

  // Get actual usage last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [usageResult] = await db
    .select({ total: sum(tokenUsageLogs.totalTokens) })
    .from(tokenUsageLogs)
    .where(gte(tokenUsageLogs.createdAt, thirtyDaysAgo))

  const tokensUsedLast30Days = parseInt(usageResult?.total || '0')

  const usagePercent = (potentialTokens / apiLimit) * 100
  const shouldPauseSales = usagePercent >= thresholdPercent

  return {
    shouldPauseSales,
    usagePercent,
    details: {
      potentialTokens,
      apiLimit,
      tokensUsedLast30Days,
    },
  }
}
