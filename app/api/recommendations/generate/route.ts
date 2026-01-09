/**
 * Recommendations Generation API
 * Generates personalized health recommendations from an analysis on-demand
 * Uses the Dynamic Product Generator system (Unified Orchestrator)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { generateRecommendationsDynamic } from '@/lib/ai/products/dynamic-orchestrator'
import { db } from '@/lib/db/client'
import { analyses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getUserCredits, calculateCreditsFromTokens, debitCredits } from '@/lib/billing/credits'

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

    console.log(`💡 [RECOMMENDATIONS-API] Generating dynamic recommendations for analysis: ${analysisId}`)

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

    // Prepare Synthesis Context if available
    let synthesisContext: string | undefined = undefined
    if (analysis && (analysis as any).synthesis) {
      try {
        const synthesisObj = (analysis as any).synthesis
        synthesisContext = `# SÍNTESE CLÍNICA CONSOLIDADA\n\n`

        if (synthesisObj.executiveSummary) {
          synthesisContext += `## Resumo Executivo\n${synthesisObj.executiveSummary}\n\n`
        }

        if (synthesisObj.keyFindings && Array.isArray(synthesisObj.keyFindings)) {
          synthesisContext += `## Principais Descobertas\n`
          synthesisObj.keyFindings.forEach((f: any) => {
            synthesisContext += `- **${f.category}**: ${f.finding} (Impacto: ${f.impact})\n`
          })
          synthesisContext += '\n'
        }

        if (synthesisObj.mainRecommendations && Array.isArray(synthesisObj.mainRecommendations)) {
          synthesisContext += `## Principais Recomendações\n`
          synthesisObj.mainRecommendations.forEach((r: any) => {
            synthesisContext += `- ${r.title}: ${r.description} (Prioridade: ${r.priority})\n`
          })
          synthesisContext += '\n'
        }

        console.log('✅ [RECOMMENDATIONS-API] Synthesis context prepared from DB')
      } catch (e) {
        console.warn('⚠️ [RECOMMENDATIONS-API] Failed to parse synthesis:', e)
      }
    }

    // ============ CREDIT CHECK ============
    const ESTIMATED_TOKENS = 100000 // Estimate for recommendations generation
    const estimatedCredits = calculateCreditsFromTokens(ESTIMATED_TOKENS)
    const userCreditsData = await getUserCredits(session.user.id)

    if (!userCreditsData) {
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar créditos' },
        { status: 500 }
      )
    }

    console.log(`💰 [RECOMMENDATIONS-API] Credit check: required=${estimatedCredits}, current=${userCreditsData.balance}`)

    if (userCreditsData.balance < estimatedCredits) {
      const shortfall = estimatedCredits - userCreditsData.balance
      return NextResponse.json(
        {
          success: false,
          error: `Créditos insuficientes. Você precisa de mais ${shortfall} créditos.`,
          details: {
            required: estimatedCredits,
            current: userCreditsData.balance,
            shortfall: shortfall
          },
        },
        { status: 402 }
      )
    }
    // ======================================

    // Generate recommendations using the Dynamic Orchestrator (with synthesis context)
    const result = await generateRecommendationsDynamic(
      analysis.userId,
      [analysisId],
      synthesisContext
    )

    console.log(`✅ [RECOMMENDATIONS-API] Dynamic recommendations generated: ${result.id}`)

    // ============ DEBIT CREDITS ============
    try {
      const tokensUsed = result.usage?.totalTokens || 0
      if (tokensUsed > 0) {
        await debitCredits(session.user.id, tokensUsed, {
          analysisId,
          operation: 'generate_recommendations_dynamic',
          modelName: 'gemini-2.5-flash',
          promptTokens: result.usage?.promptTokens || 0,
          completionTokens: result.usage?.completionTokens || 0,
        })
        console.log(`💰 [RECOMMENDATIONS-API] Debited credits for ${tokensUsed} tokens`)
      }
    } catch (creditError) {
      console.error('⚠️ [RECOMMENDATIONS-API] Failed to debit credits:', creditError)
    }
    // =======================================

    return NextResponse.json({
      success: true,
      recommendationId: result.id,
      usage: result.usage,
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
