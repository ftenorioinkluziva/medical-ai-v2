/**
 * API Key Generation and Validation
 */

import { randomBytes, createHash } from 'crypto'
import { db } from '@/lib/db/client'
import { apiKeys } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Generate a new API key
 * Format: mav2_<random_32_chars>
 */
export function generateApiKey(): string {
  const randomPart = randomBytes(24).toString('base64url')
  return `mav2_${randomPart}`
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Get key prefix for identification (first 12 chars)
 */
export function getKeyPrefix(key: string): string {
  return key.substring(0, 12)
}

/**
 * Create a new API key for a user
 */
export async function createApiKey(params: {
  userId: string
  name?: string
  description?: string
  expiresAt?: Date
}) {
  // Generate the actual key
  const apiKey = generateApiKey()
  const keyHash = hashApiKey(apiKey)
  const keyPrefix = getKeyPrefix(apiKey)

  // Store in database
  const result = await db
    .insert(apiKeys)
    .values({
      userId: params.userId,
      keyHash,
      keyPrefix,
      name: params.name,
      description: params.description,
      expiresAt: params.expiresAt,
      isActive: true,
    })
    .returning()

  return {
    id: result[0].id,
    apiKey, // Return the plain key ONLY on creation
    keyPrefix,
    name: params.name,
    description: params.description,
    expiresAt: params.expiresAt,
    createdAt: result[0].createdAt,
  }
}

/**
 * Validate an API key and return user info
 */
export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean
  userId?: string
  keyId?: string
  error?: string
}> {
  try {
    // Hash the provided key
    const keyHash = hashApiKey(apiKey)

    // Find matching key
    const result = await db
      .select({
        id: apiKeys.id,
        userId: apiKeys.userId,
        isActive: apiKeys.isActive,
        expiresAt: apiKeys.expiresAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1)

    if (!result || result.length === 0) {
      return { valid: false, error: 'API key não encontrada' }
    }

    const key = result[0]

    // Check if key is active
    if (!key.isActive) {
      return { valid: false, error: 'API key está desativada' }
    }

    // Check if key is expired
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return { valid: false, error: 'API key expirada' }
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, key.id))

    return {
      valid: true,
      userId: key.userId,
      keyId: key.id,
    }
  } catch (error) {
    console.error('[API-KEY] Validation error:', error)
    return { valid: false, error: 'Erro ao validar API key' }
  }
}

/**
 * List all API keys for a user
 */
export async function listApiKeys(userId: string) {
  return await db
    .select({
      id: apiKeys.id,
      keyPrefix: apiKeys.keyPrefix,
      name: apiKeys.name,
      description: apiKeys.description,
      isActive: apiKeys.isActive,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(apiKeys.createdAt)
}

/**
 * Revoke (deactivate) an API key
 */
export async function revokeApiKey(keyId: string, userId: string) {
  const result = await db
    .update(apiKeys)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
    .returning()

  return result.length > 0
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(keyId: string, userId: string) {
  const result = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
    .returning()

  return result.length > 0
}
