/**
 * Weekly Plans API
 * List weekly plans for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { weeklyPlans, analyses, healthAgents } from '@/lib/db/schema'
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

    // Support patientId for doctors
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const userId = patientId && session.user.role === 'doctor' ? patientId : session.user.id

    console.log(`📋 [WEEKLY-PLAN-API] Fetching plans for user: ${userId}${patientId ? ' (doctor view)' : ''}`)

    // Get all weekly plans with analysis and agent info
    const userPlans = await db
      .select({
        id: weeklyPlans.id,
        weekStartDate: weeklyPlans.weekStartDate,
        supplementationStrategy: weeklyPlans.supplementationStrategy,
        shoppingList: weeklyPlans.shoppingList,
        mealPlan: weeklyPlans.mealPlan,
        workoutPlan: weeklyPlans.workoutPlan,
        createdAt: weeklyPlans.createdAt,
        updatedAt: weeklyPlans.updatedAt,
        analysisId: weeklyPlans.analysisId,
        analysisDate: analyses.createdAt,
        agentName: healthAgents.name,
        agentTitle: healthAgents.title,
        agentColor: healthAgents.color,
      })
      .from(weeklyPlans)
      .leftJoin(analyses, eq(weeklyPlans.analysisId, analyses.id))
      .leftJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
      .where(eq(weeklyPlans.userId, userId))
      .orderBy(desc(weeklyPlans.createdAt))

    console.log(`✅ [WEEKLY-PLAN-API] Found ${userPlans.length} plans`)

    return NextResponse.json({
      success: true,
      plans: userPlans,
      total: userPlans.length,
    })
  } catch (error) {
    console.error('❌ [WEEKLY-PLAN-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
