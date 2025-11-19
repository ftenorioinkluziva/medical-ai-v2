/**
 * Recommendations API
 * Generate personalized health recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { documents, medicalProfiles, analyses, recommendations as recommendationsTable } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { buildKnowledgeContext } from '@/lib/ai/knowledge'

const recommendationsSchema = z.object({
  examRecommendations: z.array(z.object({
    exam: z.string(),
    reason: z.string(),
    urgency: z.enum(['high', 'medium', 'low']),
    suggestedTimeframe: z.string(),
  })),
  lifestyleRecommendations: z.array(z.object({
    category: z.enum(['exercise', 'nutrition', 'sleep', 'stress', 'hydration', 'habits']),
    recommendation: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    expectedBenefit: z.string(),
  })),
  healthGoals: z.array(z.object({
    goal: z.string(),
    currentStatus: z.string(),
    targetValue: z.string(),
    timeframe: z.string(),
    actionSteps: z.array(z.string()),
  })),
  alerts: z.array(z.object({
    type: z.enum(['urgent', 'warning', 'info']),
    message: z.string(),
    action: z.string(),
  })),
})

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

    // Support patientId for doctors
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const userId = patientId && session.user.role === 'doctor' ? patientId : session.user.id

    console.log(`💡 [RECOMMENDATIONS-API] Fetching latest recommendation for user: ${userId}${patientId ? ' (doctor view)' : ''}`)

    // Get the latest recommendation
    const [latestRec] = await db
      .select({
        id: recommendationsTable.id,
        analysisId: recommendationsTable.analysisId,
        examRecommendations: recommendationsTable.examRecommendations,
        lifestyleRecommendations: recommendationsTable.lifestyleRecommendations,
        healthGoals: recommendationsTable.healthGoals,
        alerts: recommendationsTable.alerts,
        createdAt: recommendationsTable.createdAt,
        analysisDate: analyses.createdAt,
      })
      .from(recommendationsTable)
      .leftJoin(analyses, eq(recommendationsTable.analysisId, analyses.id))
      .where(eq(recommendationsTable.userId, userId))
      .orderBy(desc(recommendationsTable.createdAt))
      .limit(1)

    if (!latestRec) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma recomendação encontrada. Realize uma análise médica primeiro.',
      }, { status: 404 })
    }

    console.log(`✅ [RECOMMENDATIONS-API] Returning latest recommendation from ${latestRec.createdAt}`)

    return NextResponse.json({
      success: true,
      recommendations: {
        examRecommendations: latestRec.examRecommendations,
        lifestyleRecommendations: latestRec.lifestyleRecommendations,
        healthGoals: latestRec.healthGoals,
        alerts: latestRec.alerts,
      },
      generatedAt: latestRec.createdAt.toISOString(),
      analysisDate: latestRec.analysisDate?.toISOString(),
      analysisId: latestRec.analysisId,
      disclaimer: 'Estas recomendações são educacionais e não substituem consulta médica profissional.',
    })
  } catch (error) {
    console.error('❌ [RECOMMENDATIONS-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
