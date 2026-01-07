/**
 * Unified Products Orchestrator
 * Dynamically generates all products (weekly plans + recommendations)
 * based on database configuration
 */

import { db } from '@/lib/db/client'
import { analyses, healthAgents, weeklyPlans, recommendations as recommendationsTable } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import {
  loadAllGenerators,
  loadGeneratorsByType,
  executeGenerators,
  type GeneratorResult,
} from '@/lib/ai/core/dynamic-generator'

export type ProductsResult = {
  weeklyPlan: {
    id: string
    supplementation: any
    shopping: any
    meals: any
    workout: any
    createdAt: Date
  } | null
  recommendations: {
    id: string
    examRecommendations: any[]
    lifestyleRecommendations: any[]
    healthGoals: any[]
    alerts: any[]
    createdAt: Date
  } | null
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Generate all products (weekly plans + recommendations) dynamically
 * Replaces generateCompleteWeeklyPlan + generateRecommendationsFromMultipleAnalyses
 */
export async function generateAllProducts(
  userId: string,
  analysisIds: string[]
): Promise<ProductsResult> {
  console.log(`\n🏭 [PRODUCTS] Generating all products for user ${userId}`)
  console.log(`📊 [PRODUCTS] Based on ${analysisIds.length} analyses\n`)

  // 1. Load all analyses with agent info
  const allAnalyses = await db
    .select({
      id: analyses.id,
      analysis: analyses.analysis,
      agentName: healthAgents.name,
      agentTitle: healthAgents.title,
      createdAt: analyses.createdAt,
    })
    .from(analyses)
    .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
    .where(inArray(analyses.id, analysisIds))

  console.log(`📄 [PRODUCTS] Loaded ${allAnalyses.length} analyses`)

  // 2. Build consolidated context
  let consolidatedContext = '# ANÁLISES MÉDICAS CONSOLIDADAS\n\n'
  consolidatedContext += `**Total de Especialistas:** ${allAnalyses.length}\n\n`

  for (const analysis of allAnalyses) {
    consolidatedContext += `## ${analysis.agentName} - ${analysis.agentTitle}\n\n`
    consolidatedContext += `${analysis.analysis}\n\n`
    consolidatedContext += '---\n\n'
  }

  console.log(`📝 [PRODUCTS] Consolidated context: ${consolidatedContext.length} chars\n`)

  // 3. Load all active product generators
  const allGenerators = await loadAllGenerators()

  console.log(`🔧 [PRODUCTS] Loaded ${allGenerators.length} active generators`)

  // 4. Group by product type
  const weeklyPlanGenerators = allGenerators.filter(g => g.productType === 'weekly_plan')
  const recommendationsGenerators = allGenerators.filter(g => g.productType === 'recommendations')

  console.log(`  - Weekly Plan generators: ${weeklyPlanGenerators.length}`)
  console.log(`  - Recommendations generators: ${recommendationsGenerators.length}\n`)

  // 5. Execute generators in parallel
  const [weeklyPlanResults, recommendationsResults] = await Promise.all([
    weeklyPlanGenerators.length > 0
      ? executeGenerators(weeklyPlanGenerators, consolidatedContext)
      : Promise.resolve([]),
    recommendationsGenerators.length > 0
      ? executeGenerators(recommendationsGenerators, consolidatedContext)
      : Promise.resolve([]),
  ])

  // 6. Calculate total token usage
  const allResults = [...weeklyPlanResults, ...recommendationsResults]
  const totalUsage = allResults.reduce(
    (acc, result) => ({
      promptTokens: acc.promptTokens + result.usage.promptTokens,
      completionTokens: acc.completionTokens + result.usage.completionTokens,
      totalTokens: acc.totalTokens + result.usage.totalTokens,
    }),
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  )

  console.log(`\n💰 [PRODUCTS] Total token usage: ${totalUsage.totalTokens}`)

  // 7. Map weekly plan results by generatorKey
  const weeklyPlanData: Record<string, any> = {}
  for (const result of weeklyPlanResults) {
    weeklyPlanData[result.generatorKey] = result.object
  }

  // 8. Get recommendations data (should be only one)
  const recommendationsData = recommendationsResults[0]?.object || null

  // 9. Save to database
  let savedWeeklyPlan = null
  let savedRecommendations = null

  // Save weekly plan if we have at least one generator
  if (weeklyPlanResults.length > 0) {
    console.log('💾 [PRODUCTS] Saving weekly plan...')

    // Calculate next Monday for week_start_date
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    const weekStartDate = new Date(today)
    weekStartDate.setDate(today.getDate() + daysUntilMonday)
    const weekStartDateString = weekStartDate.toISOString().split('T')[0]

    const [plan] = await db
      .insert(weeklyPlans)
      .values({
        userId,
        analysisId: analysisIds[0], // Referência principal (primeiro agente - foundation)
        weekStartDate: weekStartDateString, // Próxima segunda-feira
        supplementationStrategy: weeklyPlanData.supplementation || {},
        shoppingList: weeklyPlanData.shopping || {},
        mealPlan: weeklyPlanData.meals || {},
        workoutPlan: weeklyPlanData.workout || {},
      })
      .returning()

    savedWeeklyPlan = plan
    console.log(`✅ [PRODUCTS] Weekly plan saved: ${plan.id}`)
  }

  // Save recommendations if we have the generator
  if (recommendationsData) {
    console.log('💾 [PRODUCTS] Saving recommendations...')

    const [recs] = await db
      .insert(recommendationsTable)
      .values({
        userId,
        analysisId: analysisIds[0], // Reference first analysis
        examRecommendations: recommendationsData.examRecommendations || [],
        lifestyleRecommendations: recommendationsData.lifestyleRecommendations || [],
        healthGoals: recommendationsData.healthGoals || [],
        alerts: recommendationsData.alerts || [],
        // Metadata
        tokensUsed: totalUsage.totalTokens,
        processingTimeMs: recommendationsResults[0]?.processingTimeMs || null,
        modelUsed: recommendationsResults[0]?.modelUsed || null,
        prompt: 'Dynamic product generator - recommendations',
      })
      .returning()

    savedRecommendations = recs
    console.log(`✅ [PRODUCTS] Recommendations saved: ${recs.id}`)
  }

  console.log('\n✨ [PRODUCTS] All products generated successfully!\n')

  return {
    weeklyPlan: savedWeeklyPlan,
    recommendations: savedRecommendations,
    usage: totalUsage,
  }
}

/**
 * Generate weekly plan only (dynamic)
 * For backward compatibility or when only weekly plan is needed
 */
export async function generateWeeklyPlanDynamic(
  userId: string,
  analysisIds: string[]
) {
  console.log(`\n📅 [WEEKLY-PLAN] Generating weekly plan for user ${userId}`)

  const allAnalyses = await db
    .select({
      id: analyses.id,
      analysis: analyses.analysis,
      agentName: healthAgents.name,
    })
    .from(analyses)
    .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
    .where(inArray(analyses.id, analysisIds))

  let consolidatedContext = '# ANÁLISES CONSOLIDADAS\n\n'
  for (const analysis of allAnalyses) {
    consolidatedContext += `## ${analysis.agentName}\n${analysis.analysis}\n\n---\n\n`
  }

  const generators = await loadGeneratorsByType('weekly_plan')
  console.log(`🔧 [WEEKLY-PLAN] Loaded ${generators.length} generators`)

  const results = await executeGenerators(generators, consolidatedContext)

  const weeklyPlanData: Record<string, any> = {}
  for (const result of results) {
    weeklyPlanData[result.generatorKey] = result.object
  }

  const [savedPlan] = await db
    .insert(weeklyPlans)
    .values({
      userId,
      supplementation: weeklyPlanData.supplementation || null,
      shopping: weeklyPlanData.shopping || null,
      meals: weeklyPlanData.meals || null,
      workout: weeklyPlanData.workout || null,
    })
    .returning()

  console.log(`✅ [WEEKLY-PLAN] Saved: ${savedPlan.id}\n`)

  return {
    id: savedPlan.id,
    weeklyPlan: weeklyPlanData,
    usage: results.reduce(
      (acc, r) => ({
        promptTokens: acc.promptTokens + r.usage.promptTokens,
        completionTokens: acc.completionTokens + r.usage.completionTokens,
        totalTokens: acc.totalTokens + r.usage.totalTokens,
      }),
      { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    ),
  }
}

/**
 * Generate recommendations only (dynamic)
 * For backward compatibility or when only recommendations are needed
 */
export async function generateRecommendationsDynamic(
  userId: string,
  analysisIds: string[]
) {
  console.log(`\n💡 [RECOMMENDATIONS] Generating for user ${userId}`)

  const allAnalyses = await db
    .select({
      id: analyses.id,
      analysis: analyses.analysis,
      agentName: healthAgents.name,
    })
    .from(analyses)
    .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
    .where(inArray(analyses.id, analysisIds))

  let consolidatedContext = '# ANÁLISES CONSOLIDADAS\n\n'
  for (const analysis of allAnalyses) {
    consolidatedContext += `## ${analysis.agentName}\n${analysis.analysis}\n\n---\n\n`
  }

  const generators = await loadGeneratorsByType('recommendations')
  console.log(`🔧 [RECOMMENDATIONS] Loaded ${generators.length} generators`)

  if (generators.length === 0) {
    throw new Error('No active recommendations generator found')
  }

  const results = await executeGenerators(generators, consolidatedContext)
  const recommendationsData = results[0].object

  const [savedRecs] = await db
    .insert(recommendationsTable)
    .values({
      userId,
      analysisId: analysisIds[0],
      examRecommendations: recommendationsData.examRecommendations || [],
      lifestyleRecommendations: recommendationsData.lifestyleRecommendations || [],
      healthGoals: recommendationsData.healthGoals || [],
      alerts: recommendationsData.alerts || [],
      tokensUsed: results[0].usage.totalTokens,
      processingTimeMs: results[0].processingTimeMs,
      modelUsed: results[0].modelUsed,
      prompt: 'Dynamic recommendations generator',
    })
    .returning()

  console.log(`✅ [RECOMMENDATIONS] Saved: ${savedRecs.id}\n`)

  return {
    id: savedRecs.id,
    recommendations: recommendationsData,
    usage: results[0].usage,
  }
}
