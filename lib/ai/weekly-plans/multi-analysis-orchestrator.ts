/**
 * Multi-Analysis Weekly Plan Orchestrator
 * Generates integrated weekly plans from multiple agent analyses
 */

import { db } from '@/lib/db/client'
import { weeklyPlans, analyses, healthAgents, recommendations as recommendationsTable } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'
import {
  generateSupplementationStrategy,
  generateShoppingList,
  generateMealPlan,
  generateWorkoutPlan,
} from './generators'

/**
 * Generate complete weekly plan from multiple analyses
 */
export async function generateCompleteWeeklyPlan(
  userId: string,
  analysisIds: string[],
  recommendationsId?: string
) {
  console.log(`📅 [MULTI-WEEKLY-PLAN] Generating from ${analysisIds.length} analyses...`)

  // Buscar todas as análises
  const allAnalyses = await db
    .select({
      id: analyses.id,
      analysis: analyses.analysis,
      agentName: healthAgents.name,
      agentKey: healthAgents.agentKey,
    })
    .from(analyses)
    .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
    .where(
      or(...analysisIds.map(id => eq(analyses.id, id)))
    )

  if (allAnalyses.length === 0) {
    throw new Error('No analyses found')
  }

  console.log(`📊 [MULTI-WEEKLY-PLAN] Found ${allAnalyses.length} analyses`)

  // Buscar recomendações se fornecidas (para garantir consistência)
  let recommendationsContext = ''
  if (recommendationsId) {
    const [recs] = await db
      .select()
      .from(recommendationsTable)
      .where(eq(recommendationsTable.id, recommendationsId))
      .limit(1)

    if (recs) {
      recommendationsContext = `
# RECOMENDAÇÕES MÉDICAS CONSOLIDADAS

## Exames Recomendados:
${JSON.stringify(recs.examRecommendations, null, 2)}

## Recomendações de Estilo de Vida:
${JSON.stringify(recs.lifestyleRecommendations, null, 2)}

## Metas de Saúde:
${JSON.stringify(recs.healthGoals, null, 2)}

## Alertas:
${JSON.stringify(recs.alerts, null, 2)}

IMPORTANTE: Seu plano semanal deve IMPLEMENTAR estas recomendações.
`
    }
  }

  // Montar contexto consolidado
  let consolidatedContext = '# ANÁLISES MÉDICAS CONSOLIDADAS\n\n'

  for (const analysis of allAnalyses) {
    consolidatedContext += `## ${analysis.agentName}\n\n${analysis.analysis}\n\n---\n\n`
  }

  if (recommendationsContext) {
    consolidatedContext += recommendationsContext
  }

  console.log('🤖 [MULTI-WEEKLY-PLAN] Generating all components in parallel...')

  // Gerar todos os componentes em paralelo
  const [suppResult, shopResult, mealResult, workoutResult] = await Promise.all([
    // Suplementação - com contexto integrado
    generateSupplementationStrategy(consolidatedContext),

    // Lista de compras - com contexto integrado
    generateShoppingList(consolidatedContext),

    // Plano de refeições - com contexto integrado
    generateMealPlan(consolidatedContext),

    // Plano de treinos - com contexto integrado
    generateWorkoutPlan(consolidatedContext),
  ])

  console.log('✅ [MULTI-WEEKLY-PLAN] All components generated')

  // Extract objects from results (discard usage metadata)
  const supplementation = suppResult.object
  const shopping = shopResult.object
  const meals = mealResult.object
  const workout = workoutResult.object

  // Calcular data de início (próxima segunda-feira)
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const weekStartDate = new Date(today)
  weekStartDate.setDate(today.getDate() + daysUntilMonday)
  const weekStartDateString = weekStartDate.toISOString().split('T')[0]

  console.log('💾 [MULTI-WEEKLY-PLAN] Saving to database...')

  // Salvar no banco
  const [savedPlan] = await db
    .insert(weeklyPlans)
    .values({
      userId,
      analysisId: analysisIds[0], // Referência principal (Medicina Integrativa)
      weekStartDate: weekStartDateString,
      supplementationStrategy: supplementation as any,
      shoppingList: shopping as any,
      mealPlan: meals as any,
      workoutPlan: workout as any,
    })
    .returning()

  console.log(`✅ [MULTI-WEEKLY-PLAN] Plan saved: ${savedPlan.id}`)

  // Calculate total usage from all generators
  const totalTokens = (suppResult.usage?.totalTokens || 0) +
                     (shopResult.usage?.totalTokens || 0) +
                     (mealResult.usage?.totalTokens || 0) +
                     (workoutResult.usage?.totalTokens || 0)

  return {
    id: savedPlan.id,
    weekStartDate: savedPlan.weekStartDate,
    supplementationStrategy: savedPlan.supplementationStrategy,
    shoppingList: savedPlan.shoppingList,
    mealPlan: savedPlan.mealPlan,
    workoutPlan: savedPlan.workoutPlan,
    createdAt: savedPlan.createdAt,
    usage: {
      totalTokens,
      supplementation: suppResult.usage?.totalTokens || 0,
      shopping: shopResult.usage?.totalTokens || 0,
      meals: mealResult.usage?.totalTokens || 0,
      workout: workoutResult.usage?.totalTokens || 0,
      promptTokens: (suppResult.usage?.promptTokens || 0) +
                    (shopResult.usage?.promptTokens || 0) +
                    (mealResult.usage?.promptTokens || 0) +
                    (workoutResult.usage?.promptTokens || 0),
      completionTokens: (suppResult.usage?.completionTokens || 0) +
                       (shopResult.usage?.completionTokens || 0) +
                       (mealResult.usage?.completionTokens || 0) +
                       (workoutResult.usage?.completionTokens || 0),
    },
  }
}
