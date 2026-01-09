import { db } from '@/lib/db/client'
import { tokenUsageLogs } from '@/lib/db/schema'
import { eq, gte, sum, and } from 'drizzle-orm'

/**
 * Check if user has exceeded hourly rate limit
 */
export async function checkHourlyRateLimit(userId: string, limitTokens = 600000): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000) // Calculate 1 hour ago in UTC timestamp

  console.log('🔍 [RATE-LIMIT-DEBUG] Checking usage for:', userId)
  console.log('🕒 [RATE-LIMIT-DEBUG] One hour ago:', oneHourAgo.toISOString(), '| Local:', oneHourAgo.toString())

  const [result] = await db
    .select({ total: sum(tokenUsageLogs.totalTokens) })
    .from(tokenUsageLogs)
    .where(
      and(
        eq(tokenUsageLogs.userId, userId),
        gte(tokenUsageLogs.createdAt, oneHourAgo)
      )
    )

  const tokensUsedLastHour = parseInt(result?.total || '0')
  console.log('📈 [RATE-LIMIT-DEBUG] Tokens used:', tokensUsedLastHour, '| Limit:', limitTokens)

  return tokensUsedLastHour >= limitTokens
}

/**
 * Check if user has exceeded daily rate limit
 */
export async function checkDailyRateLimit(userId: string, limitTokens = 2000000): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000) // Calculate 24 hours ago in UTC timestamp

  const [result] = await db
    .select({ total: sum(tokenUsageLogs.totalTokens) })
    .from(tokenUsageLogs)
    .where(
      and(
        eq(tokenUsageLogs.userId, userId),
        gte(tokenUsageLogs.createdAt, oneDayAgo)
      )
    )

  const tokensUsedLastDay = parseInt(result?.total || '0')
  return tokensUsedLastDay >= limitTokens
}
