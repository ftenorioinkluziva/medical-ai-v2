/**
 * Embeddings Functions
 * Using Vercel AI SDK
 *
 * Default provider: Google (text-embedding-004) - 50-60% cheaper than OpenAI
 * Legacy support: OpenAI (requires OPENAI_API_KEY env var)
 */

import { embed, embedMany } from 'ai'
import { google, googleModels } from '../providers'
import { openai, openaiModels } from '../providers'
import { createHash } from 'crypto'

export type EmbeddingProvider = 'google' | 'openai'

export interface EmbeddingOptions {
  provider?: EmbeddingProvider
  skipCache?: boolean
}

// In-memory cache for embeddings (TTL: 5 minutes)
const embeddingCache = new Map<string, { embedding: number[]; timestamp: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000

function getCacheKey(text: string, provider: string): string {
  const hash = createHash('md5').update(text).digest('hex').substring(0, 16)
  return `${provider}:${hash}`
}

function cleanExpiredCache(): void {
  const now = Date.now()
  for (const [key, value] of embeddingCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      embeddingCache.delete(key)
    }
  }
}

/**
 * Generate embedding for a single text
 * Default changed to Google for cost savings (50-60% cheaper)
 * Includes in-memory caching to avoid regenerating same embeddings
 */
export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {}
) {
  const { provider = 'google', skipCache = false } = options

  // Clean expired cache entries periodically
  if (embeddingCache.size > 100) {
    cleanExpiredCache()
  }

  // Check cache first
  const cacheKey = getCacheKey(text, provider)
  if (!skipCache) {
    const cached = embeddingCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`⚡ [EMBEDDINGS] Cache hit for ${provider} embedding`)
      return {
        embedding: cached.embedding,
        model: provider === 'google' ? 'text-embedding-004' : 'text-embedding-3-small',
        provider: provider as 'google' | 'openai',
        dimensions: cached.embedding.length,
        usage: { tokens: 0 },
        cached: true,
      }
    }
  }

  console.log(`🧠 [EMBEDDINGS] Generating embedding with ${provider}...`)

  try {
    if (provider === 'google') {
      const result = await embed({
        model: googleModels.embedding,
        value: text,
      })

      // Cache the result
      embeddingCache.set(cacheKey, {
        embedding: result.embedding,
        timestamp: Date.now(),
      })

      return {
        embedding: result.embedding,
        model: 'text-embedding-004',
        provider: 'google' as const,
        dimensions: result.embedding.length,
        usage: result.usage,
        cached: false,
      }
    } else {
      const result = await embed({
        model: openaiModels.embeddings.small,
        value: text,
      })

      // Cache the result
      embeddingCache.set(cacheKey, {
        embedding: result.embedding,
        timestamp: Date.now(),
      })

      return {
        embedding: result.embedding,
        model: 'text-embedding-3-small',
        provider: 'openai' as const,
        dimensions: result.embedding.length,
        usage: result.usage,
        cached: false,
      }
    }
  } catch (error) {
    console.error(`❌ [EMBEDDINGS] Error with ${provider}:`, error)
    throw error
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 * Default changed to Google for cost savings (50-60% cheaper)
 */
export async function generateBatchEmbeddings(
  texts: string[],
  options: EmbeddingOptions = {}
) {
  const { provider = 'google' } = options  // ✅ Changed from 'openai' to 'google'

  console.log(`🧠 [EMBEDDINGS] Generating ${texts.length} embeddings with ${provider}...`)

  const model = provider === 'google'
    ? googleModels.embedding
    : openaiModels.embeddings.small

  const result = await embedMany({
    model,
    values: texts,
  })

  console.log(`✅ [EMBEDDINGS] Generated ${result.embeddings.length} embeddings`)

  return {
    embeddings: result.embeddings,
    model: provider === 'google' ? 'text-embedding-004' : 'text-embedding-3-small',
    provider,
    usage: result.usage,
  }
}

/**
 * Cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    const aVal = a[i]!
    const bVal = b[i]!
    dotProduct += aVal * bVal
    normA += aVal * aVal
    normB += bVal * bVal
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
