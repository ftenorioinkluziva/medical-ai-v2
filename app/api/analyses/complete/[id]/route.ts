/**
 * Complete Analysis by ID API
 * Get a specific complete analysis with all related data
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { completeAnalyses, analyses, healthAgents, recommendations, weeklyPlans } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/analyses/complete/[id]
 * Get a specific complete analysis with full details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Unwrap params Promise (Next.js 15+)
    const { id } = await params

    console.log(`📋 [API] Fetching complete analysis: ${id}`)

    // Fetch complete analysis
    const [completeAnalysis] = await db
      .select()
      .from(completeAnalyses)
      .where(eq(completeAnalyses.id, id))
      .limit(1)

    if (!completeAnalysis) {
      return NextResponse.json(
        { success: false, error: 'Análise completa não encontrada' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (completeAnalysis.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 403 }
      )
    }

    // Fetch related analyses with agent info
    const analysisIds = (completeAnalysis.analysisIds || []) as string[]

    // Use inArray for cleaner query that avoids JSON comparison issues
    const relatedAnalyses = analysisIds.length > 0
      ? await db
          .select({
            id: analyses.id,
            analysis: analyses.analysis,
            insights: analyses.insights,
            actionItems: analyses.actionItems,
            createdAt: analyses.createdAt,
            agentName: healthAgents.name,
            agentKey: healthAgents.agentKey,
            agentTitle: healthAgents.title,
            agentColor: healthAgents.color,
          })
          .from(analyses)
          .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
          .where(inArray(analyses.id, analysisIds))
      : []

    // Fetch recommendations if available
    let recommendationsData = null
    if (completeAnalysis.recommendationsId) {
      const [recs] = await db
        .select()
        .from(recommendations)
        .where(eq(recommendations.id, completeAnalysis.recommendationsId))
        .limit(1)

      if (recs) {
        recommendationsData = {
          id: recs.id,
          examRecommendations: recs.examRecommendations,
          lifestyleRecommendations: recs.lifestyleRecommendations,
          healthGoals: recs.healthGoals,
          alerts: recs.alerts,
          createdAt: recs.createdAt,
        }
      }
    }

    // Fetch weekly plan if available
    let weeklyPlanData = null
    if (completeAnalysis.weeklyPlanId) {
      const [plan] = await db
        .select()
        .from(weeklyPlans)
        .where(eq(weeklyPlans.id, completeAnalysis.weeklyPlanId))
        .limit(1)

      if (plan) {
        weeklyPlanData = {
          id: plan.id,
          weekStartDate: plan.weekStartDate,
          supplementationStrategy: plan.supplementationStrategy,
          shoppingList: plan.shoppingList,
          mealPlan: plan.mealPlan,
          workoutPlan: plan.workoutPlan,
          createdAt: plan.createdAt,
        }
      }
    }

    console.log(`✅ [API] Complete analysis fetched successfully`)

    return NextResponse.json({
      success: true,
      completeAnalysis: {
        id: completeAnalysis.id,
        documentIds: completeAnalysis.documentIds,
        status: completeAnalysis.status,
        synthesis: completeAnalysis.synthesis,
        errorMessage: completeAnalysis.errorMessage,
        createdAt: completeAnalysis.createdAt,
        completedAt: completeAnalysis.completedAt,
        analyses: relatedAnalyses,
        recommendations: recommendationsData,
        weeklyPlan: weeklyPlanData,
      },
    })
  } catch (error) {
    console.error('❌ [API] Error fetching complete analysis:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar análise',
      },
      { status: 500 }
    )
  }
}
