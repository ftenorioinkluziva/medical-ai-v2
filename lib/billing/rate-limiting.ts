import { db } from '@/lib/db/client'
import { tokenUsageLogs } from '@/lib/db/schema'
import { eq, gte, sum } from 'drizzle-orm'

/**
 * Check if user has exceeded hourly rate limit
 */
export async function checkHourlyRateLimit(userId: string, limitTokens = 500000): Promise<boolean> {
  const oneHourAgo = new Date()
  oneHourAgo.setHours(oneHourAgo.getHours() - 1)

  const [result] = await db
    .select({ total: sum(tokenUsageLogs.totalTokens) })
    .from(tokenUsageLogs)
    .where(
      eq(tokenUsageLogs.userId, userId),
      gte(tokenUsageLogs.createdAt, oneHourAgo)
    )

  const tokensUsedLastHour = parseInt(result?.total || '0')
  return tokensUsedLastHour >= limitTokens
}

/**
 * Check if user has exceeded daily rate limit
 */
export async function checkDailyRateLimit(userId: string, limitTokens = 2000000): Promise<boolean> {
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const [result] = await db
    .select({ total: sum(tokenUsageLogs.totalTokens) })
    .from(tokenUsageLogs)
    .where(
      eq(tokenUsageLogs.userId, userId),
      gte(tokenUsageLogs.createdAt, oneDayAgo)
    )

  const tokensUsedLastDay = parseInt(result?.total || '0')
  return tokensUsedLastDay >= limitTokens
}
