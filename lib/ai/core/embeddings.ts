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

export type EmbeddingProvider = 'google' | 'openai'

export interface EmbeddingOptions {
  provider?: EmbeddingProvider
}

/**
 * Generate embedding for a single text
 * Default changed to Google for cost savings (50-60% cheaper)
 */
export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {}
) {
  const { provider = 'google' } = options  // ✅ Changed from 'openai' to 'google'

  console.log(`🧠 [EMBEDDINGS] Generating embedding with ${provider}...`)

  try {
    if (provider === 'google') {
      const result = await embed({
        model: googleModels.embedding,
        value: text,
      })

      return {
        embedding: result.embedding,
        model: 'text-embedding-004',
        provider: 'google' as const,
        dimensions: result.embedding.length,
        usage: result.usage,
      }
    } else {
      // OpenAI (legacy support - requires OPENAI_API_KEY)
      const result = await embed({
        model: openaiModels.embeddings.small,
        value: text,
      })

      return {
        embedding: result.embedding,
        model: 'text-embedding-3-small',
        provider: 'openai' as const,
        dimensions: result.embedding.length,
        usage: result.usage,
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
