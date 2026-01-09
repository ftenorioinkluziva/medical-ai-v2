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
  weeklyPlan: any | null
  recommendations: any | null
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  weeklyPlanUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  recommendationsUsage?: {
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
  analysisIds: string[],
  synthesisContext?: string // ✅ New optional parameter
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

  // 2. Build consolidated context (Use synthesis if available, else build from analyses)
  let consolidatedContext = ''

  if (synthesisContext) {
    console.log('✨ [PRODUCTS] Using provided SYNTHESIS context')
    console.log('📝 [PRODUCTS] Synthesis Preview:', synthesisContext.substring(0, 100).replace(/\n/g, ' ') + '...')
    consolidatedContext = synthesisContext
  } else {
    console.log('⚠️ [PRODUCTS] No synthesis context provided, building from raw analyses')
    consolidatedContext = '# ANÁLISES MÉDICAS CONSOLIDADAS\n\n'
    consolidatedContext += `**Total de Especialistas:** ${allAnalyses.length}\n\n`

    for (const analysis of allAnalyses) {
      consolidatedContext += `## ${analysis.agentName} - ${analysis.agentTitle}\n\n`
      consolidatedContext += `${analysis.analysis}\n\n`
      consolidatedContext += '---\n\n'
    }
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

  // 5. Execute generators
  // Weekly Plan: Sequential (Meals -> Shopping)
  const shoppingGen = weeklyPlanGenerators.find(g => g.generatorKey === 'shopping')
  const otherWeeklyGens = weeklyPlanGenerators.filter(g => g.generatorKey !== 'shopping')

  // Phase 1: Run non-shopping weekly generators and all recommendations
  const [phase1WeeklyResults, recommendationsResults] = await Promise.all([
    otherWeeklyGens.length > 0
      ? executeGenerators(otherWeeklyGens, consolidatedContext)
      : Promise.resolve([]),
    recommendationsGenerators.length > 0
      ? executeGenerators(recommendationsGenerators, consolidatedContext)
      : Promise.resolve([]),
  ])

  // Phase 2: Run Shopping List (dependent on Meals)
  let shoppingResults: GeneratorResult[] = []
  if (shoppingGen) {
    const mealsResult = phase1WeeklyResults.find(r => r.generatorKey === 'meals')
    let shoppingContext = consolidatedContext

    if (mealsResult) {
      console.log('🔄 [PRODUCTS] Injecting Meal Plan into Shopping List context')
      shoppingContext += `\n\n# PLANO DE REFEIÇÕES GERADO (Use este plano para criar a lista de compras)\n`
      shoppingContext += JSON.stringify(mealsResult.object, null, 2)
    }

    shoppingResults = await executeGenerators([shoppingGen], shoppingContext)
  }

  const weeklyPlanResults = [...phase1WeeklyResults, ...shoppingResults]

  // 6. Calculate separate token usage
  const calculateUsage = (results: GeneratorResult[]) => results.reduce(
    (acc, result) => ({
      promptTokens: acc.promptTokens + result.usage.promptTokens,
      completionTokens: acc.completionTokens + result.usage.completionTokens,
      totalTokens: acc.totalTokens + result.usage.totalTokens,
    }),
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  )

  const weeklyPlanUsage = calculateUsage(weeklyPlanResults)
  const recommendationsUsage = calculateUsage(recommendationsResults)

  const totalUsage = {
    promptTokens: weeklyPlanUsage.promptTokens + recommendationsUsage.promptTokens,
    completionTokens: weeklyPlanUsage.completionTokens + recommendationsUsage.completionTokens,
    totalTokens: weeklyPlanUsage.totalTokens + recommendationsUsage.totalTokens,
  }

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

    const insertedPlans = await db
      .insert(weeklyPlans)
      .values({
        userId,
        analysisId: analysisIds[0] || '',
        weekStartDate: weekStartDateString,
        supplementationStrategy: (weeklyPlanData.supplementation as any) || {},
        shoppingList: (weeklyPlanData.shopping as any) || {},
        mealPlan: (weeklyPlanData.meals as any) || {},
        workoutPlan: (weeklyPlanData.workout as any) || {},
        // Metadata
        tokensUsed: weeklyPlanUsage.totalTokens,
        modelUsed: weeklyPlanResults[0]?.modelUsed || 'gemini-2.5-flash',
        prompt: 'Dynamic product generator - all products',
      } as any)
      .returning()

    savedWeeklyPlan = insertedPlans[0] || null
    if (savedWeeklyPlan) {
      console.log(`✅ [PRODUCTS] Weekly plan saved: ${savedWeeklyPlan.id}`)
    }
  }

  // Save recommendations if we have the generator
  if (recommendationsData) {
    console.log('💾 [PRODUCTS] Saving recommendations...')

    const insertedRecs = await db
      .insert(recommendationsTable)
      .values({
        userId,
        analysisId: analysisIds[0] || '',
        examRecommendations: recommendationsData.examRecommendations || [],
        lifestyleRecommendations: recommendationsData.lifestyleRecommendations || [],
        healthGoals: recommendationsData.healthGoals || [],
        alerts: recommendationsData.alerts || [],
        // Metadata
        tokensUsed: recommendationsUsage.totalTokens,
        processingTimeMs: recommendationsResults[0]?.processingTimeMs || null,
        modelUsed: recommendationsResults[0]?.modelUsed || null,
        prompt: 'Dynamic product generator - recommendations',
      } as any)
      .returning()

    savedRecommendations = insertedRecs[0] || null
    if (savedRecommendations) {
      console.log(`✅ [PRODUCTS] Recommendations saved: ${savedRecommendations.id}`)
    }
  }

  console.log('\n✨ [PRODUCTS] All products generated successfully!\n')

  return {
    weeklyPlan: savedWeeklyPlan,
    recommendations: savedRecommendations,
    usage: totalUsage,
    weeklyPlanUsage,
    recommendationsUsage,
  }
}

/**
 * Generate weekly plan only (dynamic)
 * For backward compatibility or when only weekly plan is needed
 */
export async function generateWeeklyPlanDynamic(
  userId: string,
  analysisIds: string[],
  synthesisContext?: string // ✅ New param
) {
  console.log(`\n📅 [WEEKLY-PLAN] Generating weekly plan for user ${userId}`)

  // 1. Build context (Synthesis OR Raw Analyses)
  let consolidatedContext = ''

  if (synthesisContext) {
    console.log('✨ [WEEKLY-PLAN] Using provided SYNTHESIS context')
    consolidatedContext = synthesisContext
  } else {
    // Fallback to raw analyses
    const allAnalyses = await db
      .select({
        id: analyses.id,
        analysis: analyses.analysis,
        agentName: healthAgents.name,
      })
      .from(analyses)
      .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
      .where(inArray(analyses.id, analysisIds))

    consolidatedContext = '# ANÁLISES CONSOLIDADAS\n\n'
    for (const analysis of allAnalyses) {
      consolidatedContext += `## ${analysis.agentName}\n${analysis.analysis}\n\n---\n\n`
    }
  }

  const generators = await loadGeneratorsByType('weekly_plan')
  console.log(`🔧 [WEEKLY-PLAN] Loaded ${generators.length} generators`)

  // Sequential Execution: Meals -> Shopping
  const shoppingGen = generators.find(g => g.generatorKey === 'shopping')
  const otherGens = generators.filter(g => g.generatorKey !== 'shopping')

  // Phase 1: Standard generators (parallel)
  console.log(`⏱️  [WEEKLY-PLAN] Starting Phase 1 (${otherGens.length} generators)...`)
  const phase1Start = Date.now()
  const phase1Results = await executeGenerators(otherGens, consolidatedContext)
  console.log(`✅ [WEEKLY-PLAN] Phase 1 completed in ${Date.now() - phase1Start}ms`)

  // Phase 2: Shopping List (dependent)
  let shoppingResults: GeneratorResult[] = []
  if (shoppingGen) {
    const mealsResult = phase1Results.find(r => r.generatorKey === 'meals')
    let shoppingContext = consolidatedContext

    if (mealsResult) {
      console.log('🔄 [WEEKLY-PLAN] Injecting Meal Plan into Shopping List context')
      shoppingContext += `\n\n# PLANO DE REFEIÇÕES GERADO (Use este plano para criar a lista de compras)\n`
      shoppingContext += JSON.stringify(mealsResult.object, null, 2)
    }

    shoppingResults = await executeGenerators([shoppingGen], shoppingContext)
  }

  const results = [...phase1Results, ...shoppingResults]

  // 5. Group by generatorKey for easy access
  const weeklyPlanData: Record<string, any> = {}
  for (const result of results) {
    weeklyPlanData[result.generatorKey] = result.object
  }

  // 6. Calculate next Monday for week_start_date (consistent with generateAllProducts)
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const weekStartDate = new Date(today)
  weekStartDate.setDate(today.getDate() + daysUntilMonday)
  const weekStartDateString = weekStartDate.toISOString().split('T')[0]

  // 7. Save to database with CORRECT keys
  const insertedPlans = await db
    .insert(weeklyPlans)
    .values({
      userId,
      analysisId: analysisIds[0] || '',
      weekStartDate: weekStartDateString,
      supplementationStrategy: (weeklyPlanData.supplementation as any) || {},
      shoppingList: (weeklyPlanData.shopping as any) || {},
      mealPlan: (weeklyPlanData.meals as any) || {},
      workoutPlan: (weeklyPlanData.workout as any) || {},
      // Metadata
      tokensUsed: results.reduce((acc, r) => acc + r.usage.totalTokens, 0),
      modelUsed: results[0]?.modelUsed || 'gemini-2.5-flash',
      prompt: 'Dynamic weekly plan generation',
    } as any)
    .returning()

  const savedPlan = insertedPlans[0]

  if (!savedPlan) {
    throw new Error('Failed to save weekly plan')
  }

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
  analysisIds: string[],
  synthesisContext?: string // ✅ New param
) {
  console.log(`\n💡 [RECOMMENDATIONS] Generating for user ${userId}`)

  // 1. Build context (Synthesis OR Raw Analyses)
  let consolidatedContext = ''

  if (synthesisContext) {
    console.log('✨ [RECOMMENDATIONS] Using provided SYNTHESIS context')
    console.log('📝 [RECOMMENDATIONS] Synthesis Preview:', synthesisContext.substring(0, 100).replace(/\n/g, ' ') + '...')
    consolidatedContext = synthesisContext
  } else {
    // Fallback to raw analyses
    const allAnalyses = await db
      .select({
        id: analyses.id,
        analysis: analyses.analysis,
        agentName: healthAgents.name,
      })
      .from(analyses)
      .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
      .where(inArray(analyses.id, analysisIds))

    consolidatedContext = '# ANÁLISES CONSOLIDADAS\n\n'
    for (const analysis of allAnalyses) {
      consolidatedContext += `## ${analysis.agentName}\n${analysis.analysis}\n\n---\n\n`
    }
  }

  const generators = await loadGeneratorsByType('recommendations')
  console.log(`🔧 [RECOMMENDATIONS] Loaded ${generators.length} generators`)

  if (generators.length === 0) {
    throw new Error('No active recommendations generator found')
  }

  const results = await executeGenerators(generators, consolidatedContext)
  const recommendationsData = results[0]?.object || {}

  const insertedRecs = await db
    .insert(recommendationsTable)
    .values({
      userId,
      analysisId: (analysisIds && analysisIds[0]) || '',
      examRecommendations: (recommendationsData.examRecommendations as any) || [],
      lifestyleRecommendations: (recommendationsData.lifestyleRecommendations as any) || [],
      healthGoals: (recommendationsData.healthGoals as any) || [],
      alerts: (recommendationsData.alerts as any) || [],
      tokensUsed: results[0]?.usage?.totalTokens || 0,
      processingTimeMs: results[0]?.processingTimeMs || 0,
      modelUsed: results[0]?.modelUsed || 'gemini-2.5-flash',
      prompt: 'Dynamic recommendations generator',
    } as any)
    .returning()

  const savedRecs = insertedRecs[0]

  if (!savedRecs) {
    throw new Error('Failed to save recommendations')
  }

  console.log(`✅ [RECOMMENDATIONS] Saved: ${savedRecs.id}\n`)

  return {
    id: savedRecs.id,
    recommendations: recommendationsData,
    usage: results[0].usage,
  }
}
