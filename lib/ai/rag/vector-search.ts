/**
 * Vector Search Functions
 * PostgreSQL + pgvector similarity search
 */

import { db } from '@/lib/db/client'
import { documentEmbeddings } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'
import { generateEmbedding } from '../core/embeddings'

export interface SearchResult {
  id: string
  documentId: string
  content: string
  similarity: number
  metadata: Record<string, any>
}

/**
 * Search for similar documents using vector similarity
 */
export async function searchSimilarDocuments(
  query: string,
  options: {
    userId?: string
    limit?: number
    threshold?: number
    provider?: 'google' | 'openai'
  } = {}
) {
  const {
    userId,
    limit = 5,
    threshold = 0.7,
    provider = 'openai',
  } = options

  console.log(`🔍 [VECTOR-SEARCH] Searching for: "${query.substring(0, 50)}..."`)

  // Generate embedding for the query
  const { embedding } = await generateEmbedding(query, { provider })

  // Convert embedding array to PostgreSQL vector format
  const embeddingVector = '[' + embedding.join(',') + ']'

  // Build SQL query with cosine similarity
  // Using <=> operator for cosine distance (pgvector)
  // 1 - distance = similarity
  const results = await db.execute(sql`
    SELECT
      id,
      document_id,
      content,
      metadata,
      1 - (embedding <=> ${embeddingVector}::vector) as similarity
    FROM document_embeddings
    WHERE
      ${userId ? sql`user_id = ${userId}` : sql`TRUE`}
      AND 1 - (embedding <=> ${embeddingVector}::vector) >= ${threshold}
    ORDER BY embedding <=> ${embeddingVector}::vector
    LIMIT ${limit}
  `)

  console.log(`✅ [VECTOR-SEARCH] Found ${results.rows.length} similar documents`)

  return results.rows.map((row: any) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    similarity: parseFloat(row.similarity),
    metadata: row.metadata || {},
  })) as SearchResult[]
}

/**
 * Search within a specific document
 */
export async function searchWithinDocument(
  documentId: string,
  query: string,
  options: {
    limit?: number
    threshold?: number
    provider?: 'google' | 'openai'
  } = {}
) {
  const {
    limit = 5,
    threshold = 0.7,
    provider = 'openai',
  } = options

  console.log(`🔍 [VECTOR-SEARCH] Searching in document ${documentId}...`)

  const { embedding } = await generateEmbedding(query, { provider })
  const embeddingVector = '[' + embedding.join(',') + ']'

  const results = await db.execute(sql`
    SELECT
      id,
      document_id,
      content,
      metadata,
      chunk_index,
      1 - (embedding <=> ${embeddingVector}::vector) as similarity
    FROM document_embeddings
    WHERE
      document_id = ${documentId}
      AND 1 - (embedding <=> ${embeddingVector}::vector) >= ${threshold}
    ORDER BY embedding <=> ${embeddingVector}::vector
    LIMIT ${limit}
  `)

  console.log(`✅ [VECTOR-SEARCH] Found ${results.rows.length} relevant chunks`)

  return results.rows.map((row: any) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    similarity: parseFloat(row.similarity),
    chunkIndex: row.chunk_index,
    metadata: row.metadata || {},
  }))
}

/**
 * Get all embeddings for a user's documents
 */
export async function getUserDocumentCount(userId: string) {
  const result = await db.execute(sql`
    SELECT COUNT(DISTINCT document_id) as count
    FROM document_embeddings
    WHERE user_id = ${userId}
  `)

  const count = result.rows[0]?.count
  return parseInt(typeof count === 'string' ? count : '0')
}
