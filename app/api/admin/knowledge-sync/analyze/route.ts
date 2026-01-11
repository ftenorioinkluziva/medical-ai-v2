/**
 * Knowledge Sync - Analyze Articles API
 * Triggers AI analysis of knowledge base articles to extract biomarkers and protocols
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { knowledgeArticles } from '@/lib/db/schema'
import { eq, isNull, or, and, inArray, sql } from 'drizzle-orm'
import { analyzeArticle } from '@/lib/ai/knowledge/analyzer'
import { generateAndSaveSuggestions } from '@/lib/ai/knowledge/suggestion-generator'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { articleIds, analyzeAll } = body

    console.log('🔬 [KNOWLEDGE-SYNC] Starting article analysis...')

    // Determine which articles to analyze
    let articlesToAnalyze

    if (analyzeAll) {
      // Analyze all articles that haven't been analyzed yet or are outdated
      articlesToAnalyze = await db
        .select()
        .from(knowledgeArticles)
        .where(
          or(
            isNull(knowledgeArticles.lastAnalyzedAt),
            // Re-analyze if content was updated after last analysis
            sql`${knowledgeArticles.updatedAt} > ${knowledgeArticles.lastAnalyzedAt}`
          )
        )
        .limit(50) // Safety limit
    } else if (articleIds && Array.isArray(articleIds) && articleIds.length > 0) {
      // Analyze specific articles
      articlesToAnalyze = await db
        .select()
        .from(knowledgeArticles)
        .where(inArray(knowledgeArticles.id, articleIds))
    } else {
      return NextResponse.json(
        { success: false, error: 'Nenhum artigo especificado para análise' },
        { status: 400 }
      )
    }

    if (articlesToAnalyze.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum artigo necessita análise',
        analyzed: 0,
        suggestions: 0,
      })
    }

    console.log(`📊 [KNOWLEDGE-SYNC] Analyzing ${articlesToAnalyze.length} articles...`)

    let totalSuggestions = 0
    const results = []

    // Analyze each article
    for (const article of articlesToAnalyze) {
      try {
        console.log(`🔍 [KNOWLEDGE-SYNC] Analyzing: ${article.title}`)

        // Extract biomarkers and protocols using AI
        const analysisResult = await analyzeArticle({
          id: article.id,
          title: article.title,
          content: article.content,
          category: article.category || undefined,
          source: article.source || undefined,
        })

        // Generate and save suggestions
        const suggestionsCount = await generateAndSaveSuggestions(
          analysisResult.biomarkers,
          analysisResult.protocols,
          article.id,
          article.title
        )

        // Update article's last analyzed timestamp
        await db
          .update(knowledgeArticles)
          .set({
            lastAnalyzedAt: new Date(),
            analysisVersion: '1.0',
          })
          .where(eq(knowledgeArticles.id, article.id))

        totalSuggestions += suggestionsCount

        results.push({
          articleId: article.id,
          articleTitle: article.title,
          biomarkersFound: analysisResult.biomarkers.length,
          protocolsFound: analysisResult.protocols.length,
          suggestionsGenerated: suggestionsCount,
        })

        console.log(`✅ [KNOWLEDGE-SYNC] Article analyzed: ${suggestionsCount} suggestions generated`)

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`❌ [KNOWLEDGE-SYNC] Error analyzing article ${article.id}:`, error)
        results.push({
          articleId: article.id,
          articleTitle: article.title,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    }

    return NextResponse.json({
      success: true,
      analyzed: articlesToAnalyze.length,
      suggestions: totalSuggestions,
      results,
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-SYNC] Error in analyze endpoint:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao analisar artigos',
      },
      { status: 500 }
    )
  }
}
