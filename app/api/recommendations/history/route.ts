/**
 * Recommendations History API
 * Lists all recommendations for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { recommendations, analyses, healthAgents } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

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

    console.log(`📋 [RECOMMENDATIONS-HISTORY] Fetching history for user: ${session.user.id}`)

    // Get all recommendations with their related analysis info
    const recommendationsHistory = await db
      .select({
        id: recommendations.id,
        analysisId: recommendations.analysisId,
        examRecommendations: recommendations.examRecommendations,
        lifestyleRecommendations: recommendations.lifestyleRecommendations,
        healthGoals: recommendations.healthGoals,
        alerts: recommendations.alerts,
        createdAt: recommendations.createdAt,
        analysisDate: analyses.createdAt,
        agentName: healthAgents.name,
        agentTitle: healthAgents.title,
        agentColor: healthAgents.color,
      })
      .from(recommendations)
      .leftJoin(analyses, eq(recommendations.analysisId, analyses.id))
      .leftJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
      .where(eq(recommendations.userId, session.user.id))
      .orderBy(desc(recommendations.createdAt))

    console.log(`✅ [RECOMMENDATIONS-HISTORY] Found ${recommendationsHistory.length} recommendations`)

    return NextResponse.json({
      success: true,
      recommendations: recommendationsHistory,
      total: recommendationsHistory.length,
    })
  } catch (error) {
    console.error('❌ [RECOMMENDATIONS-HISTORY] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
