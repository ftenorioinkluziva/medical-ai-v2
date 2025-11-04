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

    console.log(`🤖 [WEEKLY-PLAN] Generating all plans in parallel...`)

    // Generate all plans in parallel for speed
    const [supplementation, shopping, meals, workout] = await Promise.all([
      generateSupplementationStrategy(analysis.analysis),
      generateShoppingList(analysis.analysis),
      generateMealPlan(analysis.analysis),
      generateWorkoutPlan(analysis.analysis),
    ])

    console.log(`✅ [WEEKLY-PLAN] All plans generated successfully`)

    // Calculate week start date (next Monday)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    const weekStartDate = new Date(today)
    weekStartDate.setDate(today.getDate() + daysUntilMonday)
    const weekStartDateString = weekStartDate.toISOString().split('T')[0]

    console.log(`💾 [WEEKLY-PLAN] Saving to database...`)

    // Save to database
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
      })
      .returning()

    console.log(`✅ [WEEKLY-PLAN] Plan saved: ${savedPlan.id}`)

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
