/**
 * Knowledge Base Analysis API
 * Analyzes chunks distribution to help determine optimal maxChunks
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { appSettings } from '@/lib/db/schema'
import { sql, eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Get current maxChunks setting from database
    const [currentSetting] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, 'knowledge.maxChunks'))
      .limit(1)

    const currentMaxChunks = currentSetting
      ? parseInt(currentSetting.value)
      : 184 // Default value

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

    // Get distribution of chunks per article
    const distribution = await db.execute(sql`
      SELECT
        ka.title,
        COUNT(*)::int as chunk_count,
        ROUND(AVG(LENGTH(ke.content)), 0)::int as avg_chunk_length
      FROM knowledge_embeddings ke
      JOIN knowledge_articles ka ON ke.article_id = ka.id
      WHERE ka.is_verified = 'verified'
      GROUP BY ka.id, ka.title
      ORDER BY chunk_count DESC
    `)

    const chunks = (distribution.rows as any[]).map(r => r.chunk_count)
    const max = Math.max(...chunks)
    const min = Math.min(...chunks)

    // Calculate recommendations
    const recommendations = {
      conservative: Math.ceil(avgChunksPerArticle * 2),
      balanced: Math.ceil(avgChunksPerArticle * 5),
      comprehensive: Math.ceil(avgChunksPerArticle * 10),
      current: currentMaxChunks,
      estimatedArticlesWithCurrent: Math.floor(currentMaxChunks / avgChunksPerArticle)
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalArticles: total_articles,
        totalChunks: total_chunks,
        avgChunksPerArticle: parseFloat(avgChunksPerArticle.toFixed(2)),
        minChunksPerArticle: min,
        maxChunksPerArticle: max
      },
      distribution: distribution.rows,
      recommendations
    })
  } catch (error) {
    console.error('Error analyzing knowledge base:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze knowledge base' },
      { status: 500 }
    )
  }
}
