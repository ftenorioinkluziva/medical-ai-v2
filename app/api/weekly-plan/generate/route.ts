/**
 * Weekly Plan Generation API
 * Generates complete weekly plan (supplements, shopping, meals, workouts)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { weeklyPlans, analyses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import {
  generateSupplementationStrategy,
  generateShoppingList,
  generateMealPlan,
  generateWorkoutPlan,
} from '@/lib/ai/weekly-plans/generators'
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

    console.log(`📅 [WEEKLY-PLAN] Generating plan for analysis: ${analysisId}`)

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
    // Estimate: 4 parallel generations (~20k tokens each = 80k total)
    const ESTIMATED_TOKENS = 80000
    const estimatedCredits = calculateCreditsFromTokens(ESTIMATED_TOKENS)
    const userCreditsData = await getUserCredits(session.user.id)

    console.log(`💰 [WEEKLY-PLAN] Credit check: required=${estimatedCredits}, current=${userCreditsData.balance}`)

    if (userCreditsData.balance < estimatedCredits) {
      const shortfall = estimatedCredits - userCreditsData.balance
      return NextResponse.json(
        {
          success: false,
          error: `Créditos insuficientes. Você precisa de mais ${shortfall} créditos para gerar o plano semanal.`,
          details: {
            required: estimatedCredits,
            current: userCreditsData.balance,
            shortfall: shortfall,
            message: `Saldo atual: ${userCreditsData.balance} créditos | Necessário: ${estimatedCredits} créditos | Faltam: ${shortfall} créditos`
          },
        },
        { status: 402 }
      )
    }
    // ======================================

    console.log(`🤖 [WEEKLY-PLAN] Generating all plans in parallel...`)

    const startTime = Date.now()

    // Generate all plans in parallel for speed
    const [suppResult, shopResult, mealResult, workoutResult] = await Promise.all([
      generateSupplementationStrategy(analysis.analysis),
      generateShoppingList(analysis.analysis),
      generateMealPlan(analysis.analysis),
      generateWorkoutPlan(analysis.analysis),
    ])

    const processingTimeMs = Date.now() - startTime

    // Extract objects and usage
    const supplementation = suppResult.object
    const shopping = shopResult.object
    const meals = mealResult.object
    const workout = workoutResult.object

    // Calculate total tokens from all 4 generations
    const suppTokens = suppResult.usage?.totalTokens || 0
    const shopTokens = shopResult.usage?.totalTokens || 0
    const mealTokens = mealResult.usage?.totalTokens || 0
    const workoutTokens = workoutResult.usage?.totalTokens || 0
    const totalTokens = suppTokens + shopTokens + mealTokens + workoutTokens

    console.log(`✅ [WEEKLY-PLAN] All plans generated successfully`)
    console.log(`📊 [WEEKLY-PLAN] Token breakdown:`)
    console.log(`   - Supplementation: ${suppTokens} tokens`)
    console.log(`   - Shopping List: ${shopTokens} tokens`)
    console.log(`   - Meal Plan: ${mealTokens} tokens`)
    console.log(`   - Workout Plan: ${workoutTokens} tokens`)
    console.log(`   - TOTAL: ${totalTokens} tokens`)
    console.log(`⏱️ [WEEKLY-PLAN] Processing time: ${processingTimeMs}ms`)

    // Calculate week start date (current week's Monday)
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Calculate days back to Monday (if today is Sunday, go back 6 days; if Monday, go back 0 days)
    const daysBackToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStartDate = new Date(today)
    weekStartDate.setDate(today.getDate() - daysBackToMonday)
    const weekStartDateString = weekStartDate.toISOString().split('T')[0]

    console.log(`💾 [WEEKLY-PLAN] Saving to database...`)

    // Save to database with metadata
    const [savedPlan] = await db
      .insert(weeklyPlans)
      .values({
        userId: session.user.id,
        analysisId: analysis.id,
        weekStartDate: weekStartDateString,
        supplementationStrategy: supplementation as any,
        shoppingList: shopping as any,
        mealPlan: meals as any,
        workoutPlan: workout as any,
        // Metadata
        tokensUsed: totalTokens,
        processingTimeMs,
        modelUsed: 'gemini-2.5-flash',
        prompt: `Weekly plan generation: Supplementation (${suppTokens}t), Shopping (${shopTokens}t), Meals (${mealTokens}t), Workout (${workoutTokens}t)`,
      })
      .returning()

    console.log(`✅ [WEEKLY-PLAN] Plan saved: ${savedPlan.id}`)

    // ============ DEBIT CREDITS ============
    // Debit actual tokens from all 4 generations
    try {
      if (totalTokens > 0) {
        await debitCredits(session.user.id, totalTokens, {
          weeklyPlanId: savedPlan.id,
          analysisId: analysis.id,
          operation: 'generate_weekly_plan',
          modelName: 'gemini-2.5-flash',
          promptTokens: (suppResult.usage?.promptTokens || 0) + (shopResult.usage?.promptTokens || 0) + (mealResult.usage?.promptTokens || 0) + (workoutResult.usage?.promptTokens || 0),
          completionTokens: (suppResult.usage?.completionTokens || 0) + (shopResult.usage?.completionTokens || 0) + (mealResult.usage?.completionTokens || 0) + (workoutResult.usage?.completionTokens || 0),
          description: `Weekly plan: Supp(${suppTokens}), Shop(${shopTokens}), Meal(${mealTokens}), Workout(${workoutTokens})`,
        })

        const actualCreditsDebited = calculateCreditsFromTokens(totalTokens)
        console.log(`💰 [WEEKLY-PLAN] Debited ${actualCreditsDebited} credits for ${totalTokens} real tokens`)
      } else {
        console.log(`⚠️ [WEEKLY-PLAN] No tokens used, skipping debit`)
      }
    } catch (creditError) {
      console.error('⚠️ [WEEKLY-PLAN] Failed to debit credits:', creditError)
      // Don't fail the operation, log for manual review
    }
    // =======================================

    return NextResponse.json({
      success: true,
      plan: {
        id: savedPlan.id,
        weekStartDate: savedPlan.weekStartDate,
        supplementationStrategy: savedPlan.supplementationStrategy,
        shoppingList: savedPlan.shoppingList,
        mealPlan: savedPlan.mealPlan,
        workoutPlan: savedPlan.workoutPlan,
        createdAt: savedPlan.createdAt,
      },
      usage: {
        totalTokens,
        supplementation: suppTokens,
        shopping: shopTokens,
        meals: mealTokens,
        workout: workoutTokens,
      },
      creditsDebited: calculateCreditsFromTokens(totalTokens),
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
