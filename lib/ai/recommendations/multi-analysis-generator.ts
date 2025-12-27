/**
 * Multi-Analysis Recommendations Generator
 * Generates integrated recommendations from multiple agent analyses
 */

import { db } from '@/lib/db/client'
import { recommendations as recommendationsTable, analyses, healthAgents } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'
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

/**
 * Generate recommendations from multiple analyses (multi-agent approach)
 */
export async function generateRecommendationsFromMultipleAnalyses(
  userId: string,
  analysisIds: string[]
) {
  console.log(`💡 [MULTI-RECOMMENDATIONS] Generating from ${analysisIds.length} analyses...`)

  // Buscar todas as análises com informações dos agentes
  const allAnalyses = await db
    .select({
      id: analyses.id,
      analysis: analyses.analysis,
      agentName: healthAgents.name,
      agentKey: healthAgents.agentKey,
      agentTitle: healthAgents.title,
      createdAt: analyses.createdAt,
    })
    .from(analyses)
    .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
    .where(
      or(...analysisIds.map(id => eq(analyses.id, id)))
    )

  if (allAnalyses.length === 0) {
    throw new Error('No analyses found')
  }

  console.log(`📊 [MULTI-RECOMMENDATIONS] Found ${allAnalyses.length} analyses from: ${allAnalyses.map(a => a.agentName).join(', ')}`)

  // Montar contexto consolidado com todas as análises
  let context = '# ANÁLISES MÉDICAS MULTI-ESPECIALIDADE\n\n'
  context += `**Especialistas consultados:** ${allAnalyses.map(a => a.agentName).join(', ')}\n\n`

  for (const analysis of allAnalyses) {
    context += `## ${analysis.agentName} - ${analysis.agentTitle}\n\n`
    context += `${analysis.analysis}\n\n`
    context += '---\n\n'
  }

  // Buscar conhecimento da base com foco nas análises
  console.log('🧠 [MULTI-RECOMMENDATIONS] Searching knowledge base...')
  let knowledgeContext = ''
  try {
    // Combina todas as análises para busca mais abrangente
    const combinedAnalysisText = allAnalyses.map(a => a.analysis).join(' ')
    knowledgeContext = await buildKnowledgeContext(combinedAnalysisText, {
      maxChunks: 7, // Mais chunks porque temos múltiplas análises
      maxCharsPerChunk: 1500,
    })

    if (knowledgeContext) {
      console.log(`✅ [MULTI-RECOMMENDATIONS] Knowledge context: ${knowledgeContext.length} chars`)
      context += '\n# BASE DE CONHECIMENTO MÉDICO (Referências)\n\n'
      context += knowledgeContext
    }
  } catch (error) {
    console.warn('⚠️ [MULTI-RECOMMENDATIONS] Knowledge search failed:', error)
  }

  console.log('🤖 [MULTI-RECOMMENDATIONS] Generating integrated recommendations...')

  // Gerar recomendações integradas
  const { object: recommendations } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: recommendationsSchema,
    prompt: `Você é um coordenador médico especializado em medicina integrativa.

CONTEXTO MULTI-ESPECIALIDADE:
Você tem acesso a análises de ${allAnalyses.length} especialistas diferentes:
${allAnalyses.map(a => `- ${a.agentName} (${a.agentTitle})`).join('\n')}

TODAS AS ANÁLISES:
${context}

SUA MISSÃO:
Gere recomendações que INTEGREM e HARMONIZEM as perspectivas de todos os especialistas acima.

REGRAS CRÍTICAS DE INTEGRAÇÃO:
1. ✅ SINTETIZE insights comuns entre os especialistas
   - Se 2+ especialistas mencionam o mesmo problema, consolide em 1 recomendação
   - Exemplo: Se nutrição E exercício sugerem melhorar resistência insulínica, crie 1 meta integrada

2. ✅ IDENTIFIQUE SINERGIAS entre diferentes áreas
   - Exemplo: "Exercício HIIT + Dieta low carb = impacto sinérgico em HOMA-IR"
   - Priorize recomendações que abordem múltiplas questões simultaneamente

3. ✅ RESOLVA CONFLITOS usando hierarquia médica
   - Se especialistas divergem, use evidências da knowledge base
   - Priorize: Consenso > Evidências científicas > Especialista mais qualificado no tema

4. ✅ EVITE DUPLICAÇÃO absoluta
   - Se Nutrição sugere "suplementar Vitamina D" e Integrativa também, crie 1 item apenas
   - Mencione que é consenso entre especialistas

5. ✅ PRIORIZE por impacto consolidado
   - Recomendações que tenham apoio de múltiplos especialistas = alta prioridade
   - Recomendações únicas de 1 especialista = considerar contexto

6. ✅ USE a knowledge base para fundamentar decisões
   - Sempre que houver conflito, busque evidências nas referências
   - Cite as referências quando relevante

HIERARQUIA DE EVIDÊNCIA:
1. Consenso entre múltiplos especialistas
2. Evidências científicas da knowledge base
3. Recomendação do especialista mais qualificado no tema específico
4. Visão integrativa considerando contexto completo do paciente

Gere recomendações nas seguintes categorias:

1. **Exames Recomendados**:
   - Consolide exames sugeridos por diferentes especialistas
   - Se múltiplos agentes sugeriram o mesmo exame, mencione isso (aumenta urgência)
   - Priorize exames que ajudem a monitorar múltiplas condições

2. **Recomendações de Lifestyle**:
   - Integre sugestões de exercício (do fisiologista) + nutrição (do nutricionista)
   - Identifique sinergias (ex: dieta + treino específico)
   - Seja específico e prático

3. **Metas de Saúde**:
   - Crie metas que integrem múltiplas análises
   - Exemplo: "Melhorar sensibilidade insulínica" pode envolver nutrição + exercício + sono
   - Passos de ação devem refletir insights de todos os especialistas

4. **Alertas**:
   - Consolide alertas críticos de todos os agentes
   - Se múltiplos especialistas alertam sobre o mesmo problema = URGENTE
   - Priorize por gravidade e convergência entre especialistas

DIRETRIZES IMPORTANTES:
- Base TODAS as recomendações nas análises fornecidas
- Utilize as referências da base de conhecimento para fundamentar
- Seja específico e prático - evite recomendações genéricas
- Priorize ações baseadas em evidências científicas
- Use linguagem clara, acessível e encorajadora
- Foque em recomendações acionáveis que o paciente pode implementar
- SEMPRE mantenha postura educacional - não substitui consulta médica
- Mencione quando há CONSENSO entre especialistas (isso aumenta confiança)

Gere as recomendações consolidadas.`,
  })

  console.log(`✅ [MULTI-RECOMMENDATIONS] Generated:`)
  console.log(`   - ${recommendations.examRecommendations.length} exam recommendations`)
  console.log(`   - ${recommendations.lifestyleRecommendations.length} lifestyle recommendations`)
  console.log(`   - ${recommendations.healthGoals.length} health goals`)
  console.log(`   - ${recommendations.alerts.length} alerts`)

  // Salvar no banco referenciando a primeira análise (medicina integrativa)
  const [savedRec] = await db
    .insert(recommendationsTable)
    .values({
      userId,
      analysisId: analysisIds[0], // Referência principal (Medicina Integrativa)
      examRecommendations: recommendations.examRecommendations as any,
      lifestyleRecommendations: recommendations.lifestyleRecommendations as any,
      healthGoals: recommendations.healthGoals as any,
      alerts: recommendations.alerts as any,
    })
    .returning()

  console.log(`💾 [MULTI-RECOMMENDATIONS] Saved to database: ${savedRec.id}`)

  return {
    id: savedRec.id,
    recommendations,
    analysisIds,
    createdAt: savedRec.createdAt,
  }
}
