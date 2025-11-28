/**
 * Recommendations Generation API
 * Generates personalized health recommendations from an analysis on-demand
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { generateRecommendationsFromAnalysis } from '@/lib/ai/recommendations/generate'
import { db } from '@/lib/db/client'
import { analyses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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

    const body = await request.json()
    const { analysisId } = body

    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: 'analysisId é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`💡 [RECOMMENDATIONS-API] Generating recommendations for analysis: ${analysisId}`)

    // Get the analysis to verify ownership
    const [analysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.id, analysisId))
      .limit(1)

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: 'Análise não encontrada' },
        { status: 404 }
      )
    }

    // Verify ownership (or doctor accessing patient data)
    const isOwner = analysis.userId === session.user.id
    const isDoctor = session.user.role === 'doctor'

    if (!isOwner && !isDoctor) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 403 }
      )
    }

    // Generate recommendations
    const recommendation = await generateRecommendationsFromAnalysis(
      analysisId,
      analysis.userId
    )

    console.log(`✅ [RECOMMENDATIONS-API] Recommendations generated: ${recommendation.id}`)

    return NextResponse.json({
      success: true,
      recommendation: {
        id: recommendation.id,
        analysisId: recommendation.analysisId,
        examRecommendations: recommendation.examRecommendations,
        lifestyleRecommendations: recommendation.lifestyleRecommendations,
        healthGoals: recommendation.healthGoals,
        alerts: recommendation.alerts,
        createdAt: recommendation.createdAt,
      },
      message: 'Recomendações geradas com sucesso!',
    })
  } catch (error) {
    console.error('❌ [RECOMMENDATIONS-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao gerar recomendações',
      },
      { status: 500 }
    )
  }
}
