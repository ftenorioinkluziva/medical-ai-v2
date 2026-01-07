/**
 * Weekly Plan Generation API
 * Generates complete weekly plan (supplements, shopping, meals, workouts)
 * Uses the Dynamic Product Generator system (Unified Orchestrator)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { analyses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateWeeklyPlanDynamic } from '@/lib/ai/products/dynamic-orchestrator'
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

    console.log(`📅 [WEEKLY-PLAN] Generating dynamic plan for analysis: ${analysisId}`)

    // Get the analysis
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

    // Verify ownership
    if (analysis.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 403 }
      )
    }

    // ============ CREDIT CHECK ============
    // Estimate based on 4 parallel generations
    const ESTIMATED_TOKENS = 80000
    const estimatedCredits = calculateCreditsFromTokens(ESTIMATED_TOKENS)
    const userCreditsData = await getUserCredits(session.user.id)

    console.log(`💰 [WEEKLY-PLAN] Credit check: required=${estimatedCredits}, current=${userCreditsData.balance}`)

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

    console.log(`🤖 [WEEKLY-PLAN] Executing dynamic generators...`)

    // Call the Unified Orchestrator for weekly plans
    const result = await generateWeeklyPlanDynamic(session.user.id, [analysisId])

    console.log(`✅ [WEEKLY-PLAN] Dynamic generation completed. ID: ${result.id}`)

    // ============ DEBIT CREDITS ============
    try {
      const totalTokens = result.usage.totalTokens
      if (totalTokens > 0) {
        await debitCredits(session.user.id, totalTokens, {
          weeklyPlanId: result.id,
          analysisId: analysis.id,
          operation: 'generate_weekly_plan_dynamic',
          modelName: 'gemini-2.5-flash',
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          description: `Plano semanal dinâmico (${totalTokens} tokens)`,
        })

        console.log(`💰 [WEEKLY-PLAN] Debited credits for ${totalTokens} tokens`)
      }
    } catch (creditError) {
      console.error('⚠️ [WEEKLY-PLAN] Failed to debit credits:', creditError)
    }
    // =======================================

    return NextResponse.json({
      success: true,
      planId: result.id, // Frontend usually redirects to the plan page or refreshes
      usage: result.usage,
      message: 'Plano semanal gerado com sucesso!',
    })
  } catch (error) {
    console.error('❌ [WEEKLY-PLAN] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao gerar plano semanal',
      },
      { status: 500 }
    )
  }
}
