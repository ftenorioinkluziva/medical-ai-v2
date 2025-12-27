/**
 * Analyze Knowledge Base Statistics
 * Shows chunks per article and helps determine optimal maxChunks
 */

import { db } from '@/lib/db/client'
import { knowledgeArticles, knowledgeEmbeddings } from '@/lib/db/schema'
import { sql, eq } from 'drizzle-orm'

async function analyzeKnowledgeBase() {
  console.log('📊 Analyzing Knowledge Base...\n')

  // Get total stats
  const totalStats = await db.execute(sql`
    SELECT
      COUNT(DISTINCT ka.id)::int as total_articles,
      COUNT(ke.id)::int as total_chunks
    FROM knowledge_articles ka
    LEFT JOIN knowledge_embeddings ke ON ka.id = ke.article_id
    WHERE ka.is_verified = 'verified'
  `)

  const { total_articles, total_chunks } = totalStats.rows[0] as any
  const avgChunksPerArticle = total_chunks / total_articles

  console.log('📚 Overall Statistics:')
  console.log(`   Total Articles: ${total_articles}`)
  console.log(`   Total Chunks: ${total_chunks}`)
  console.log(`   Average Chunks per Article: ${avgChunksPerArticle.toFixed(1)}\n`)

  // Get distribution of chunks per article
  const distribution = await db.execute(sql`
    SELECT
      article_id,
      ka.title,
      COUNT(*)::int as chunk_count,
      ROUND(AVG(LENGTH(ke.content)), 0)::int as avg_chunk_length
    FROM knowledge_embeddings ke
    JOIN knowledge_articles ka ON ke.article_id = ka.id
    WHERE ka.is_verified = 'verified'
    GROUP BY article_id, ka.title
    ORDER BY chunk_count DESC
    LIMIT 20
  `)

  console.log('📊 Top 20 Articles by Chunk Count:')
  console.log('   Title                                          | Chunks | Avg Length')
  console.log('   ' + '-'.repeat(75))

  for (const row of distribution.rows as any[]) {
    const title = row.title.substring(0, 45).padEnd(45)
    const chunks = String(row.chunk_count).padStart(6)
    const avgLen = String(row.avg_chunk_length).padStart(10)
    console.log(`   ${title} | ${chunks} | ${avgLen}`)
  }

  console.log('\n💡 Recommendations for maxChunks:')

  // Calculate percentiles
  const chunks = (distribution.rows as any[]).map(r => r.chunk_count)
  const p50 = chunks[Math.floor(chunks.length * 0.5)] || 0
  const p75 = chunks[Math.floor(chunks.length * 0.25)] || 0
  const p90 = chunks[Math.floor(chunks.length * 0.1)] || 0

  console.log(`   - Conservative (cover 1-2 articles fully): ${Math.ceil(avgChunksPerArticle * 2)}`)
  console.log(`   - Balanced (cover 3-5 articles): ${Math.ceil(avgChunksPerArticle * 5)}`)
  console.log(`   - Comprehensive (cover 5-10 articles): ${Math.ceil(avgChunksPerArticle * 10)}`)
  console.log(`   - Current setting: 20`)

  const estimatedArticles = Math.floor(20 / avgChunksPerArticle)
  console.log(`\n   With maxChunks=20, you typically get chunks from ~${estimatedArticles} articles`)

  process.exit(0)
}

analyzeKnowledgeBase().catch(console.error)
