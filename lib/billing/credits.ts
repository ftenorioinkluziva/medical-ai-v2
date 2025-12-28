import { db } from '@/lib/db/client'
import { userCredits, creditTransactions, tokenUsageLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const TOKENS_PER_CREDIT = 1000

/**
 * Initialize user credits account (called on first user creation)
 */
export async function initializeUserCredits(userId: string) {
  const existing = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId),
  })

  if (existing) return existing

  const [created] = await db.insert(userCredits).values({
    userId,
    balance: 0,
    totalPurchased: 0,
    totalUsed: 0,
  }).returning()

  return created
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string) {
  const credits = await db.query.userCredits.findFirst({
    where: eq(userCredits.userId, userId),
  })

  if (!credits) {
    return await initializeUserCredits(userId)
  }

  return credits
}

/**
 * Add credits to user account (after successful payment)
 */
export async function addCredits(
  userId: string,
  amount: number,
  metadata: { stripePaymentId?: string; description?: string }
) {
  return await db.transaction(async (tx) => {
    // Get current balance
    const current = await tx.query.userCredits.findFirst({
      where: eq(userCredits.userId, userId),
    })

    if (!current) {
      throw new Error('User credits account not initialized')
    }

    const newBalance = current.balance + amount

    // Update balance
    await tx
      .update(userCredits)
      .set({
        balance: newBalance,
        totalPurchased: current.totalPurchased + amount,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId))

    // Create transaction record
    const [transaction] = await tx.insert(creditTransactions).values({
      userId,
      type: 'purchase',
      amount,
      balanceAfter: newBalance,
      description: metadata.description || 'Credit purchase',
      metadata: JSON.stringify(metadata),
    }).returning()

    return { newBalance, transaction }
  })
}

/**
 * Check if user has enough credits for operation
 */
export async function hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
  const credits = await getUserCredits(userId)
  return credits.balance >= requiredCredits
}

/**
 * Calculate credits needed for estimated tokens
 */
export function calculateCreditsFromTokens(tokens: number): number {
  return Math.ceil(tokens / TOKENS_PER_CREDIT)
}

/**
 * Debit credits after AI operation
 */
export async function debitCredits(
  userId: string,
  tokensUsed: number,
  metadata: {
    analysisId?: string
    operation: string
    modelName: string
    promptTokens: number
    completionTokens: number
    cachedTokens?: number
  }
) {
  const creditsToDebit = calculateCreditsFromTokens(tokensUsed)

  return await db.transaction(async (tx) => {
    // Get current balance
    const current = await tx.query.userCredits.findFirst({
      where: eq(userCredits.userId, userId),
    })

    if (!current) {
      throw new Error('User credits account not initialized')
    }

    if (current.balance < creditsToDebit) {
      throw new Error('Insufficient credits')
    }

    const newBalance = current.balance - creditsToDebit

    // Update balance
    await tx
      .update(userCredits)
      .set({
        balance: newBalance,
        totalUsed: current.totalUsed + creditsToDebit,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId))

    // Create transaction record
    const [transaction] = await tx.insert(creditTransactions).values({
      userId,
      type: 'debit',
      amount: -creditsToDebit,
      balanceAfter: newBalance,
      description: `${metadata.operation} - ${tokensUsed} tokens`,
      metadata: JSON.stringify(metadata),
    }).returning()

    // Create detailed usage log
    await tx.insert(tokenUsageLogs).values({
      userId,
      analysisId: metadata.analysisId,
      operation: metadata.operation,
      modelName: metadata.modelName,
      promptTokens: metadata.promptTokens,
      completionTokens: metadata.completionTokens,
      cachedTokens: metadata.cachedTokens || 0,
      totalTokens: tokensUsed,
      creditsDebited: creditsToDebit,
      transactionId: transaction.id,
    })

    return { creditsDebited: creditsToDebit, newBalance, transaction }
  })
}

/**
 * Get user's transaction history
 */
export async function getCreditHistory(userId: string, limit = 50) {
  return await db.query.creditTransactions.findMany({
    where: eq(creditTransactions.userId, userId),
    orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
    limit,
  })
}

/**
 * Admin: Adjust user credits manually
 */
export async function adminAdjustCredits(
  userId: string,
  amount: number,
  reason: string,
  adminUserId: string
) {
  return await db.transaction(async (tx) => {
    const current = await tx.query.userCredits.findFirst({
      where: eq(userCredits.userId, userId),
    })

    if (!current) {
      throw new Error('User credits account not initialized')
    }

    const newBalance = current.balance + amount

    if (newBalance < 0) {
      throw new Error('Cannot adjust credits below zero')
    }

    await tx
      .update(userCredits)
      .set({
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId))

    const [transaction] = await tx.insert(creditTransactions).values({
      userId,
      type: 'admin_adjustment',
      amount,
      balanceAfter: newBalance,
      description: reason,
      metadata: JSON.stringify({ adminUserId }),
    }).returning()

    return { newBalance, transaction }
  })
}
