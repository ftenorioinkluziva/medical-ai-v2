/**
 * Complete Analysis API
 * Endpoints for multi-agent comprehensive analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { runCompleteAnalysis } from '@/lib/ai/orchestrator/complete-analysis'
import { db } from '@/lib/db/client'
import { completeAnalyses, analyses, healthAgents } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

/**
 * POST /api/analyses/complete
 * Start a new complete analysis workflow
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { documentIds } = body

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'documentIds é obrigatório e deve ser um array' },
        { status: 400 }
      )
    }

    console.log(`🔬 [API] Starting complete analysis for user ${session.user.id}`)
    console.log(`📄 [API] Documents: ${documentIds.length}`)

    // Run complete analysis workflow
    const result = await runCompleteAnalysis(session.user.id, documentIds)

    return NextResponse.json({
      success: true,
      completeAnalysis: {
        id: result.id,
        status: result.status,
        analyses: {
          integrativeId: result.analyses.integrative.id,
          nutritionId: result.analyses.nutrition.id,
          exerciseId: result.analyses.exercise.id,
        },
        synthesis: result.synthesis,
        recommendationsId: result.recommendations.id,
        weeklyPlanId: result.weeklyPlan.id,
      },
      message: 'Análise completa realizada com sucesso!',
    })
  } catch (error) {
    console.error('❌ [API] Complete analysis error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao realizar análise completa',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/analyses/complete
 * List all complete analyses for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    console.log(`📋 [API] Fetching complete analyses for user ${session.user.id}`)

    // Fetch all complete analyses with related data
    const userAnalyses = await db
      .select({
        id: completeAnalyses.id,
        documentIds: completeAnalyses.documentIds,
        status: completeAnalyses.status,
        synthesis: completeAnalyses.synthesis,
        integrativeAnalysisId: completeAnalyses.integrativeAnalysisId,
        nutritionAnalysisId: completeAnalyses.nutritionAnalysisId,
        exerciseAnalysisId: completeAnalyses.exerciseAnalysisId,
        recommendationsId: completeAnalyses.recommendationsId,
        weeklyPlanId: completeAnalyses.weeklyPlanId,
        errorMessage: completeAnalyses.errorMessage,
        createdAt: completeAnalyses.createdAt,
        completedAt: completeAnalyses.completedAt,
      })
      .from(completeAnalyses)
      .where(eq(completeAnalyses.userId, session.user.id))
      .orderBy(desc(completeAnalyses.createdAt))

    console.log(`✅ [API] Found ${userAnalyses.length} complete analyses`)

    return NextResponse.json({
      success: true,
      analyses: userAnalyses,
      total: userAnalyses.length,
    })
  } catch (error) {
    console.error('❌ [API] Error fetching complete analyses:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar análises',
      },
      { status: 500 }
    )
  }
}
