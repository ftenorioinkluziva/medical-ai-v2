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

    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    console.log(`💡 [RECOMMENDATIONS-API] Fetching recommendations for user: ${session.user.id}, forceRefresh: ${forceRefresh}`)

    // Check for cached recommendations
    if (!forceRefresh) {
      const [cachedRec] = await db
        .select()
        .from(recommendationsTable)
        .where(eq(recommendationsTable.userId, session.user.id))
        .orderBy(desc(recommendationsTable.updatedAt))
        .limit(1)

      if (cachedRec) {
        console.log(`✅ [RECOMMENDATIONS-API] Returning cached recommendations from ${cachedRec.updatedAt}`)
        return NextResponse.json({
          success: true,
          recommendations: {
            examRecommendations: cachedRec.examRecommendations,
            lifestyleRecommendations: cachedRec.lifestyleRecommendations,
            healthGoals: cachedRec.healthGoals,
            alerts: cachedRec.alerts,
          },
          generatedAt: cachedRec.updatedAt.toISOString(),
          cached: true,
          disclaimer: 'Estas recomendações são educacionais e não substituem consulta médica profissional.',
        })
      }
    }

    console.log(`💡 [RECOMMENDATIONS-API] Generating new recommendations for user: ${session.user.id}`)

    // Get ONLY the most recent analysis
    const [latestAnalysis] = await db
      .select({
        id: analyses.id,
        agentId: analyses.agentId,
        prompt: analyses.prompt,
        analysis: analyses.analysis,
        createdAt: analyses.createdAt,
      })
      .from(analyses)
      .where(eq(analyses.userId, session.user.id))
      .orderBy(desc(analyses.createdAt))
      .limit(1)

    if (!latestAnalysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhuma análise encontrada. Por favor, realize uma análise médica primeiro.',
        },
        { status: 404 }
      )
    }

    console.log(`📊 [RECOMMENDATIONS-API] Using latest analysis from ${latestAnalysis.createdAt}`)

    // Build knowledge context from the analysis
    console.log('🧠 [RECOMMENDATIONS-API] Searching knowledge base...')
    let knowledgeContext = ''
    try {
      knowledgeContext = await buildKnowledgeContext(latestAnalysis.analysis, {
        maxChunks: 5,
        maxCharsPerChunk: 1500,
      })

      if (knowledgeContext) {
        console.log(`✅ [RECOMMENDATIONS-API] Knowledge context: ${knowledgeContext.length} chars`)
      }
    } catch (error) {
      console.warn('⚠️ [RECOMMENDATIONS-API] Knowledge search failed:', error)
    }

    // Build context for AI using ONLY the latest analysis
    let context = '# Última Análise Médica\n\n'
    context += `**Data da Análise:** ${new Date(latestAnalysis.createdAt).toLocaleDateString('pt-BR')}\n\n`
    context += `**Análise Completa:**\n${latestAnalysis.analysis}\n\n`

    // Add knowledge base context if available
    if (knowledgeContext) {
      context += '\n# Base de Conhecimento Médico (Referências)\n\n'
      context += knowledgeContext
    }

    console.log(`🤖 [RECOMMENDATIONS-API] Generating AI recommendations...`)

    // Generate recommendations using AI
    const { object: recommendations } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: recommendationsSchema,
      prompt: `Você é um assistente médico especializado em medicina preventiva e integrativa.

Baseado na última análise médica do paciente e na base de conhecimento médico, gere recomendações personalizadas e acionáveis.

${context}

Gere recomendações nas seguintes categorias:

1. **Exames Recomendados**: Sugira exames complementares que o paciente deve fazer baseado em:
   - Achados da análise médica mais recente
   - Valores alterados identificados
   - Necessidade de monitoramento ou investigação adicional
   - Perfil de risco do paciente
   - Utilize as referências da base de conhecimento para fundamentar suas sugestões

2. **Recomendações de Lifestyle**: Sugestões práticas para melhorar saúde:
   - Exercícios (tipo, frequência, intensidade)
   - Nutrição (alimentos específicos, restrições, suplementos)
   - Sono (duração, qualidade, higiene do sono)
   - Gestão de estresse (técnicas, práticas)
   - Hidratação adequada
   - Modificação de hábitos (tabagismo, álcool)
   - Base suas recomendações em evidências científicas da base de conhecimento

3. **Metas de Saúde**: Objetivos SMART (Específicos, Mensuráveis, Atingíveis, Relevantes, Temporais):
   - Normalização de parâmetros alterados identificados na análise
   - Objetivos baseados nas necessidades identificadas
   - Metas de prevenção e otimização da saúde
   - Passos concretos para alcançar cada meta

4. **Alertas**: Avisos importantes sobre:
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

    console.log(`✅ [RECOMMENDATIONS-API] Generated ${recommendations.examRecommendations.length} exam recommendations`)

    // Save to database (delete existing and insert new)
    await db
      .delete(recommendationsTable)
      .where(eq(recommendationsTable.userId, session.user.id))

    const [savedRec] = await db
      .insert(recommendationsTable)
      .values({
        userId: session.user.id,
        examRecommendations: recommendations.examRecommendations as any,
        lifestyleRecommendations: recommendations.lifestyleRecommendations as any,
        healthGoals: recommendations.healthGoals as any,
        alerts: recommendations.alerts as any,
      })
      .returning()

    console.log(`💾 [RECOMMENDATIONS-API] Saved recommendations to database`)

    return NextResponse.json({
      success: true,
      recommendations,
      generatedAt: savedRec.updatedAt.toISOString(),
      cached: false,
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
