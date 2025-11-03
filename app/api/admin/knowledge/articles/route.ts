/**
 * Knowledge Articles API
 * List and manage knowledge base articles
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { knowledgeArticles, knowledgeEmbeddings } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    console.log('📚 [KNOWLEDGE-API] Fetching articles list...')

    // Get all articles with chunk count
    const articles = await db
      .select({
        id: knowledgeArticles.id,
        title: knowledgeArticles.title,
        category: knowledgeArticles.category,
        source: knowledgeArticles.source,
        summary: knowledgeArticles.summary,
        tags: knowledgeArticles.tags,
        isVerified: knowledgeArticles.isVerified,
        usageCount: knowledgeArticles.usageCount,
        createdAt: knowledgeArticles.createdAt,
        updatedAt: knowledgeArticles.updatedAt,
        // Count chunks via subquery
        chunksCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${knowledgeEmbeddings}
          WHERE ${knowledgeEmbeddings.articleId} = ${knowledgeArticles.id}
        )`.as('chunks_count'),
      })
      .from(knowledgeArticles)
      .orderBy(desc(knowledgeArticles.createdAt))

    console.log(`✅ [KNOWLEDGE-API] Found ${articles.length} articles`)

    return NextResponse.json({
      success: true,
      articles,
      total: articles.length,
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-API] Error fetching articles:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar artigos',
      },
      { status: 500 }
    )
  }
}
