/**
 * Knowledge Sync - Statistics API
 * Get statistics about knowledge synchronization
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { knowledgeUpdateSuggestions, syncAuditLog, knowledgeArticles } from '@/lib/db/schema'
import { eq, sql, and, or, isNull } from 'drizzle-orm'

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

    console.log('📊 [KNOWLEDGE-SYNC] Fetching statistics...')

    // Get suggestion counts by status
    const suggestionsByStatus = await db
      .select({
        status: knowledgeUpdateSuggestions.status,
        count: sql<number>`count(*)::int`,
      })
      .from(knowledgeUpdateSuggestions)
      .groupBy(knowledgeUpdateSuggestions.status)

    // Get suggestion counts by priority
    const suggestionsByPriority = await db
      .select({
        priority: knowledgeUpdateSuggestions.priority,
        count: sql<number>`count(*)::int`,
      })
      .from(knowledgeUpdateSuggestions)
      .groupBy(knowledgeUpdateSuggestions.priority)

    // Get suggestion counts by type
    const suggestionsByType = await db
      .select({
        suggestionType: knowledgeUpdateSuggestions.suggestionType,
        count: sql<number>`count(*)::int`,
      })
      .from(knowledgeUpdateSuggestions)
      .groupBy(knowledgeUpdateSuggestions.suggestionType)

    // Get conflict count
    const [{ conflictCount }] = await db
      .select({
        conflictCount: sql<number>`count(*)::int`,
      })
      .from(knowledgeUpdateSuggestions)
      .where(eq(knowledgeUpdateSuggestions.isConflict, true))

    // Get total suggestions count
    const [{ totalSuggestions }] = await db
      .select({
        totalSuggestions: sql<number>`count(*)::int`,
      })
      .from(knowledgeUpdateSuggestions)

    // Get audit log counts by action
    const auditByAction = await db
      .select({
        action: syncAuditLog.action,
        count: sql<number>`count(*)::int`,
      })
      .from(syncAuditLog)
      .groupBy(syncAuditLog.action)

    // Get article analysis stats
    const [{ totalArticles }] = await db
      .select({
        totalArticles: sql<number>`count(*)::int`,
      })
      .from(knowledgeArticles)

    const [{ analyzedArticles }] = await db
      .select({
        analyzedArticles: sql<number>`count(*)::int`,
      })
      .from(knowledgeArticles)
      .where(sql`${knowledgeArticles.lastAnalyzedAt} IS NOT NULL`)

    const [{ unanalyzedArticles }] = await db
      .select({
        unanalyzedArticles: sql<number>`count(*)::int`,
      })
      .from(knowledgeArticles)
      .where(isNull(knowledgeArticles.lastAnalyzedAt))

    // Get recent activity (last 10 audit logs)
    const recentActivity = await db
      .select()
      .from(syncAuditLog)
      .orderBy(sql`${syncAuditLog.createdAt} DESC`)
      .limit(10)

    console.log('✅ [KNOWLEDGE-SYNC] Statistics generated successfully')

    return NextResponse.json({
      success: true,
      stats: {
        suggestions: {
          total: totalSuggestions,
          byStatus: suggestionsByStatus.reduce(
            (acc, item) => ({ ...acc, [item.status || 'unknown']: item.count }),
            {}
          ),
          byPriority: suggestionsByPriority.reduce(
            (acc, item) => ({ ...acc, [item.priority || 'unknown']: item.count }),
            {}
          ),
          byType: suggestionsByType.reduce(
            (acc, item) => ({ ...acc, [item.suggestionType || 'unknown']: item.count }),
            {}
          ),
          conflicts: conflictCount,
        },
        articles: {
          total: totalArticles,
          analyzed: analyzedArticles,
          unanalyzed: unanalyzedArticles,
          analysisCoverage: totalArticles > 0
            ? Math.round((analyzedArticles / totalArticles) * 100)
            : 0,
        },
        audit: {
          byAction: auditByAction.reduce(
            (acc, item) => ({ ...acc, [item.action || 'unknown']: item.count }),
            {}
          ),
        },
        recentActivity,
      },
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-SYNC] Error fetching statistics:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas',
      },
      { status: 500 }
    )
  }
}
