/**
 * Knowledge Base Search
 * Semantic search in medical knowledge base using pgvector
 */

import { db } from '@/lib/db/client'
import { knowledgeArticles, knowledgeEmbeddings } from '@/lib/db/schema'
import { sql, eq, inArray } from 'drizzle-orm'
import { generateEmbedding } from '../core/embeddings'

export interface KnowledgeSearchResult {
  id: string
  articleId: string
  title: string
  category: string
  content: string
  similarity: number
  source?: string
  tags?: string[]
}

/**
 * Search knowledge base using semantic similarity
 */
export async function searchKnowledgeBase(
  query: string,
  options: {
    limit?: number
    threshold?: number
    categories?: string[]
    provider?: 'google' | 'openai'
  } = {}
): Promise<KnowledgeSearchResult[]> {
  const {
    limit = 5,
    threshold = 0.7,
    categories,
    provider = 'openai',
  } = options

  console.log(`🔍 [KNOWLEDGE] Searching for: "${query.substring(0, 50)}..."`)

  // Generate embedding for the query
  const { embedding } = await generateEmbedding(query, { provider })

  // Convert embedding to PostgreSQL vector format
  const embeddingVector = '[' + embedding.join(',') + ']'

  // Build SQL query with category filter if provided
  let searchQuery: any

  if (categories && categories.length > 0) {
    // Convert array to PostgreSQL format
    const categoriesArray = `{${categories.join(',')}}`

    searchQuery = sql`
      SELECT
        ke.id,
        ke.article_id,
        ka.title,
        ka.category,
        ka.subcategory,
        ke.content,
        ka.source,
        ka.tags,
        ka.relevance_score,
        1 - (ke.embedding <=> ${embeddingVector}::vector) as similarity
      FROM knowledge_embeddings ke
      INNER JOIN knowledge_articles ka ON ke.article_id = ka.id
      WHERE
        ka.is_verified = 'verified'
        AND ka.category = ANY(${categoriesArray}::text[])
        AND 1 - (ke.embedding <=> ${embeddingVector}::vector) >= ${threshold}
      ORDER BY ke.embedding <=> ${embeddingVector}::vector
      LIMIT ${limit}
    `
  } else {
    searchQuery = sql`
      SELECT
        ke.id,
        ke.article_id,
        ka.title,
        ka.category,
        ka.subcategory,
        ke.content,
        ka.source,
        ka.tags,
        ka.relevance_score,
        1 - (ke.embedding <=> ${embeddingVector}::vector) as similarity
      FROM knowledge_embeddings ke
      INNER JOIN knowledge_articles ka ON ke.article_id = ka.id
      WHERE
        ka.is_verified = 'verified'
        AND 1 - (ke.embedding <=> ${embeddingVector}::vector) >= ${threshold}
      ORDER BY ke.embedding <=> ${embeddingVector}::vector
      LIMIT ${limit}
    `
  }

  // Search with cosine similarity
  const results = await db.execute(searchQuery)

  const searchResults = results.rows.map((row: any) => ({
    id: row.id,
    articleId: row.article_id,
    title: row.title,
    category: row.category,
    subcategory: row.subcategory,
    content: row.content,
    similarity: parseFloat(row.similarity),
    source: row.source,
    tags: row.tags,
    relevanceScore: row.relevance_score,
  })) as KnowledgeSearchResult[]

  console.log(`✅ [KNOWLEDGE] Found ${searchResults.length} relevant articles`)

  // Update usage count for found articles
  if (searchResults.length > 0) {
    const articleIds = [...new Set(searchResults.map(r => r.articleId))]

    // Use IN instead of ANY for simpler syntax
    await db.execute(sql`
      UPDATE knowledge_articles
      SET usage_count = usage_count + 1
      WHERE id IN ${articleIds}
    `)
  }

  return searchResults
}

/**
 * Build knowledge context for AI analysis
 */
export async function buildKnowledgeContext(
  query: string,
  options: {
    maxChunks?: number
    maxCharsPerChunk?: number
    categories?: string[]
  } = {}
): Promise<string> {
  const {
    maxChunks = 5,
    maxCharsPerChunk = 1000,
    categories,
  } = options

  console.log(`🧠 [KNOWLEDGE] Building context for query...`)

  // First try with category filter
  let results = await searchKnowledgeBase(query, {
    limit: maxChunks,
    threshold: 0.5, // Lowered from 0.6 to 0.5
    categories,
  })

  // If no results and categories were specified, try without category filter
  if (results.length === 0 && categories && categories.length > 0) {
    console.log(`⚠️ [KNOWLEDGE] No results in categories [${categories.join(', ')}], searching all categories...`)
    results = await searchKnowledgeBase(query, {
      limit: maxChunks,
      threshold: 0.5,
      categories: undefined, // Remove category filter
    })
  }

  if (results.length === 0) {
    console.log('⚠️ [KNOWLEDGE] No relevant knowledge found')
    return ''
  }

  const contextParts: string[] = []

  for (const result of results) {
    const content = result.content.length > maxCharsPerChunk
      ? result.content.substring(0, maxCharsPerChunk) + '...'
      : result.content

    contextParts.push(`
### ${result.title} (${result.category})
**Fonte:** ${result.source || 'Base de Conhecimento'}
**Relevância:** ${(result.similarity * 100).toFixed(0)}%

${content}
`)
  }

  const context = contextParts.join('\n---\n')

  console.log(`✅ [KNOWLEDGE] Built context with ${results.length} articles (${context.length} chars)`)

  return context
}

/**
 * Get statistics about knowledge base
 */
export async function getKnowledgeStats() {
  const stats = await db.execute(sql`
    SELECT
      COUNT(DISTINCT ka.id)::int as total_articles,
      COUNT(DISTINCT ka.category)::int as total_categories,
      COUNT(ke.id)::int as total_chunks,
      COALESCE(SUM(ka.usage_count), 0)::int as total_usage,
      COUNT(DISTINCT CASE WHEN ka.is_verified = 'verified' THEN ka.id END)::int as verified_articles
    FROM knowledge_articles ka
    LEFT JOIN knowledge_embeddings ke ON ka.id = ke.article_id
    WHERE ka.is_verified = 'verified'
  `)

  const categoryStats = await db.execute(sql`
    SELECT
      category,
      COUNT(*)::int as count
    FROM knowledge_articles
    WHERE is_verified = 'verified'
    GROUP BY category
    ORDER BY count DESC
  `)

  const result = stats.rows[0]

  return {
    totalArticles: result.total_articles,
    totalCategories: result.total_categories,
    totalChunks: result.total_chunks,
    totalUsage: result.total_usage,
    verifiedArticles: result.verified_articles,
    categories: categoryStats.rows,
  }
}
