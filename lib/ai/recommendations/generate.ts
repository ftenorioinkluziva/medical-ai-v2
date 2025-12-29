/**
 * Recommendations Generation
 * Generates personalized health recommendations from medical analysis
 */

import { db } from '@/lib/db/client'
import { recommendations as recommendationsTable, analyses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { buildKnowledgeContext } from '@/lib/ai/knowledge'
import { getKnowledgeConfig } from '@/lib/db/settings'

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

export async function generateRecommendationsFromAnalysis(
  analysisId: string,
  userId: string
) {
  console.log(`💡 [RECOMMENDATIONS] Generating for analysis: ${analysisId}`)

  // Get the analysis
  const [analysis] = await db
    .select()
    .from(analyses)
    .where(eq(analyses.id, analysisId))
    .limit(1)

  if (!analysis) {
    throw new Error('Analysis not found')
  }

  // Build knowledge context from the analysis
  console.log('🧠 [RECOMMENDATIONS] Searching knowledge base...')
  let knowledgeContext = ''
  try {
    // Load knowledge base configuration from database
    const knowledgeConfig = await getKnowledgeConfig()
    console.log(`⚙️ [RECOMMENDATIONS] Knowledge config: maxChunks=${knowledgeConfig.maxChunks}, threshold=${knowledgeConfig.similarityThreshold}`)

    knowledgeContext = await buildKnowledgeContext(analysis.analysis, {
      maxChunks: knowledgeConfig.maxChunks,
      maxCharsPerChunk: knowledgeConfig.maxCharsPerChunk,
    })

    if (knowledgeContext) {
      console.log(`✅ [RECOMMENDATIONS] Knowledge context: ${knowledgeContext.length} chars`)
    }
  } catch (error) {
    console.warn('⚠️ [RECOMMENDATIONS] Knowledge search failed:', error)
  }

  // Build context
  let context = '# Análise Médica\n\n'
  context += `**Data da Análise:** ${new Date(analysis.createdAt).toLocaleDateString('pt-BR')}\n\n`
  context += `**Análise Completa:**\n${analysis.analysis}\n\n`

  if (knowledgeContext) {
    context += '\n# Base de Conhecimento Médico (Referências)\n\n'
    context += knowledgeContext
  }

  console.log(`🤖 [RECOMMENDATIONS] Generating AI recommendations...`)

  const startTime = Date.now()

  // Generate recommendations
  const modelUsed = 'gemini-2.5-flash'
  const promptSummary = 'Generating personalized health recommendations based on medical analysis'

  const result = await generateObject({
    model: google(modelUsed),
    schema: recommendationsSchema,
    prompt: `Você é um assistente médico especializado em medicina preventiva e integrativa.

Baseado na análise médica do paciente e na base de conhecimento médico, gere recomendações personalizadas e acionáveis.

${context}

Gere recomendações nas seguintes categorias:

1. **Exames Recomendados**: Sugira exames complementares baseado em:
   - Achados da análise médica
   - Valores alterados identificados
   - Necessidade de monitoramento ou investigação adicional
   - Utilize as referências da base de conhecimento para fundamentar suas sugestões

2. **Recomendações de Lifestyle**: Sugestões práticas:
   - Exercícios (tipo, frequência, intensidade)
   - Nutrição (alimentos específicos, restrições, suplementos)
   - Sono (duração, qualidade, higiene do sono)
   - Gestão de estresse (técnicas, práticas)
   - Hidratação adequada
   - Modificação de hábitos (tabagismo, álcool)
   - Base suas recomendações em evidências científicas da base de conhecimento

3. **Metas de Saúde**: Objetivos SMART:
   - Normalização de parâmetros alterados identificados na análise
   - Objetivos baseados nas necessidades identificadas
   - Metas de prevenção e otimização da saúde
   - Passos concretos para alcançar cada meta

4. **Alertas**: Avisos importantes:
   - Valores críticos que precisam atenção médica urgente
   - Padrões preocupantes identificados na análise
   - Combinações de fatores de risco
   - Necessidade de consulta médica presencial

DIRETRIZES IMPORTANTES:
- Base TODAS as recomendações na análise médica fornecida
- Utilize as referências da base de conhecimento para fundamentar suas sugestões
- Seja específico e prático - evite recomendações genéricas
- Priorize ações baseadas em evidências científicas
- Use linguagem clara, acessível e encorajadora
- Foque em recomendações acionáveis que o paciente pode implementar
- SEMPRE mantenha postura educacional - não substitui consulta médica`,
  })

  const recommendations = result.object
  const processingTimeMs = Date.now() - startTime

  console.log(`✅ [RECOMMENDATIONS] Generated ${recommendations.examRecommendations.length} exam recommendations`)
  console.log(`📊 [RECOMMENDATIONS] Token usage: ${result.usage?.totalTokens || 0} tokens`)
  console.log(`⏱️ [RECOMMENDATIONS] Processing time: ${processingTimeMs}ms`)

  // Save to database with metadata
  const [savedRec] = await db
    .insert(recommendationsTable)
    .values({
      userId,
      analysisId,
      examRecommendations: recommendations.examRecommendations as any,
      lifestyleRecommendations: recommendations.lifestyleRecommendations as any,
      healthGoals: recommendations.healthGoals as any,
      alerts: recommendations.alerts as any,
      // Metadata
      tokensUsed: result.usage?.totalTokens || null,
      processingTimeMs,
      modelUsed,
      prompt: promptSummary,
    })
    .returning()

  console.log(`💾 [RECOMMENDATIONS] Saved to database: ${savedRec.id}`)

  return {
    id: savedRec.id,
    recommendations,
    analysisId,
    createdAt: savedRec.createdAt,
    usage: result.usage, // Return usage for credit debit
  }
}
