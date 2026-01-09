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
    articleIds?: string[] | null // null = all articles, [] = none, [...ids] = specific articles
    provider?: 'google' | 'openai'
  } = {}
): Promise<KnowledgeSearchResult[]> {
  const {
    limit = 5,
    threshold = 0.7,
    categories,
    articleIds,
    provider = 'google',  // ✅ Fixed: Changed from 'openai' to 'google'
  } = options

  console.log(`🔍 [KNOWLEDGE] Searching for: "${query.substring(0, 50)}..."`)

  // If articleIds is an empty array, return no results (restricted agent with no articles)
  if (articleIds !== undefined && articleIds !== null && articleIds.length === 0) {
    console.log(`⚠️ [KNOWLEDGE] No articles allowed for this agent`)
    return []
  }

  // Generate embedding for the query
  const { embedding } = await generateEmbedding(query, { provider })

  // Convert embedding to PostgreSQL vector format
  const embeddingVector = '[' + embedding.join(',') + ']'

  // Build WHERE conditions
  const whereConditions = [
    sql`ka.is_verified = 'verified'`,
    sql`1 - (ke.embedding <=> ${embeddingVector}::vector) >= ${threshold}`,
  ]

  // Add category filter if provided
  if (categories && categories.length > 0) {
    const categoriesArray = `{${categories.join(',')}}`
    whereConditions.push(sql`ka.category = ANY(${categoriesArray}::text[])`)
  }

  // Add article ID filter if provided
  if (articleIds && articleIds.length > 0) {
    const articleIdsArray = `{${articleIds.join(',')}}`
    whereConditions.push(sql`ka.id = ANY(${articleIdsArray}::uuid[])`)
  }

  // Combine WHERE conditions
  const whereClause = whereConditions.reduce((acc, condition, index) => {
    if (index === 0) return condition
    return sql`${acc} AND ${condition}`
  })

  // Build complete query
  const searchQuery = sql`
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
    WHERE ${whereClause}
    ORDER BY ke.embedding <=> ${embeddingVector}::vector
    LIMIT ${limit}
  `

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

  // Count unique articles
  const uniqueArticleIds = [...new Set(searchResults.map(r => r.articleId))]
  console.log(`✅ [KNOWLEDGE] Found ${searchResults.length} relevant chunks from ${uniqueArticleIds.length} articles`)

  // Update usage count for found articles
  if (uniqueArticleIds.length > 0) {
    try {
      // ✅ Fixed: Use Drizzle's update() with inArray() instead of raw SQL
      await db
        .update(knowledgeArticles)
        .set({ usageCount: sql`usage_count + 1` })
        .where(inArray(knowledgeArticles.id, uniqueArticleIds))
    } catch (error) {
      console.warn('⚠️ [KNOWLEDGE] Failed to update usage count:', error)
      // Don't fail the whole search if usage count update fails
    }
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
    articleIds?: string[] | null
    agentId?: string // New: automatically get article IDs from agent config
    restrictedPriority?: number // 0-1: % of chunks from restricted articles (only applies when agentId + restrictedPriority provided)
  } = {}
): Promise<string> {
  const {
    maxChunks = 5,
    maxCharsPerChunk = 1000,
    categories,
    articleIds: providedArticleIds,
    agentId,
    restrictedPriority,
  } = options

  console.log(`🧠 [KNOWLEDGE] Building context for query...`)

  // Get article IDs from agent config if agentId is provided
  let articleIds = providedArticleIds
  if (agentId && articleIds === undefined) {
    const { getAllowedArticleIds } = await import('../rag/agent-knowledge-filter')
    articleIds = await getAllowedArticleIds(agentId)

    if (articleIds && articleIds.length > 0) {
      console.log(`🔐 [KNOWLEDGE] Agent restricted to ${articleIds.length} articles`)
    } else if (articleIds && articleIds.length === 0) {
      console.log(`⚠️ [KNOWLEDGE] Agent has no articles configured`)
      return ''
    }
  }

  // Cascading search with restrictedPriority (if configured)
  let results: KnowledgeSearchResult[] = []

  if (restrictedPriority !== undefined && restrictedPriority < 1 && articleIds && articleIds.length > 0) {
    // Cascading search: restricted articles + general articles
    const restrictedChunks = Math.round(maxChunks * restrictedPriority)
    const generalChunks = maxChunks - restrictedChunks

    console.log(`🔀 [KNOWLEDGE] Cascading search: ${restrictedChunks} restricted + ${generalChunks} general`)

    // Phase 1: Search in restricted articles
    if (restrictedChunks > 0) {
      const restrictedResults = await searchKnowledgeBase(query, {
        limit: restrictedChunks,
        threshold: 0.5,
        categories,
        articleIds,
      })
      results.push(...restrictedResults)
      console.log(`  ✓ Phase 1: Found ${restrictedResults.length} chunks from restricted articles`)
    }

    // Phase 2: Search in general articles (if needed)
    if (generalChunks > 0) {
      const usedArticleIds = new Set(results.map(r => r.articleId))
      const generalResults = await searchKnowledgeBase(query, {
        limit: generalChunks,
        threshold: 0.75, // Higher threshold for general search (more selective)
        categories,
        articleIds: null, // Search all articles
      })

      // Filter out articles already used in Phase 1
      const newGeneralResults = generalResults.filter(r => !usedArticleIds.has(r.articleId))
      results.push(...newGeneralResults.slice(0, generalChunks))
      console.log(`  ✓ Phase 2: Found ${newGeneralResults.length} chunks from general articles`)
    }
  } else {
    // Standard search (no cascading)
    results = await searchKnowledgeBase(query, {
      limit: maxChunks,
      threshold: 0.5,
      categories,
      articleIds,
    })
  }

  if (results.length === 0) {
    if (articleIds && articleIds.length > 0) {
      console.log(`⚠️ [KNOWLEDGE] No relevant knowledge found in agent's restricted articles`)
    } else if (categories && categories.length > 0) {
      console.log(`⚠️ [KNOWLEDGE] No relevant knowledge found in categories [${categories.join(', ')}]`)
    } else {
      console.log('⚠️ [KNOWLEDGE] No relevant knowledge found')
    }
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

  // Count unique articles in results
  const uniqueArticles = [...new Set(results.map(r => r.articleId))]
  console.log(`✅ [KNOWLEDGE] Built context with ${results.length} chunks from ${uniqueArticles.length} articles (${context.length} chars)`)

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
