/**
 * Complete Analysis Orchestrator
 * Coordinates multi-agent comprehensive analysis workflow
 */

import { db } from '@/lib/db/client'
import { completeAnalyses, analyses, documents, healthAgents, medicalProfiles } from '@/lib/db/schema'
import { eq, inArray, and, ne } from 'drizzle-orm'
import { analyzeWithAgent } from '@/lib/ai/agents/analyze'
import { generateSynthesis } from '@/lib/ai/synthesis/generator'
import { generateRecommendationsFromMultipleAnalyses } from '@/lib/ai/recommendations/multi-analysis-generator'
import { generateCompleteWeeklyPlan } from '@/lib/ai/weekly-plans/multi-analysis-orchestrator'
import { buildKnowledgeContext } from '@/lib/ai/knowledge'
import { getKnowledgeConfig } from '@/lib/db/settings'
import { debitCredits, calculateCreditsFromTokens } from '@/lib/billing/credits'

/**
 * Run complete multi-agent analysis workflow
 */
export async function runCompleteAnalysis(
  userId: string,
  documentIds: string[]
) {
  console.log('🔬 [COMPLETE-ANALYSIS] Starting comprehensive analysis workflow...')
  console.log(`📄 [COMPLETE-ANALYSIS] Documents: ${documentIds.length}`)

  // 1. Criar registro inicial
  const [analysisRecord] = await db
    .insert(completeAnalyses)
    .values({
      userId,
      documentIds,
      status: 'pending',
      synthesis: null as any,
    })
    .returning()

  console.log(`📝 [COMPLETE-ANALYSIS] Created record: ${analysisRecord.id}`)

  try {
    // 2. Validar e filtrar documentIds
    console.log(`📄 [COMPLETE-ANALYSIS] Validating document IDs...`)
    console.log(`   Raw documentIds:`, documentIds)

    // Garantir que documentIds é um array válido sem nulls/undefined
    const validDocumentIds = Array.isArray(documentIds)
      ? documentIds.filter(id => id !== null && id !== undefined && typeof id === 'string')
      : []

    console.log(`   Valid documentIds:`, validDocumentIds)

    if (validDocumentIds.length === 0) {
      throw new Error('No valid document IDs provided')
    }

    // 3. Buscar documentos
    console.log(`📄 [COMPLETE-ANALYSIS] Fetching ${validDocumentIds.length} documents...`)

    let docs
    try {
      docs = await db
        .select({
          id: documents.id,
          name: documents.fileName,  // ✅ Correto: fileName, não name
          documentType: documents.documentType,
          documentDate: documents.documentDate,
          extractedText: documents.extractedText,
          structuredData: documents.structuredData,
          userId: documents.userId,
          createdAt: documents.createdAt,
        })
        .from(documents)
        .where(inArray(documents.id, validDocumentIds))
    } catch (queryError) {
      console.error('❌ [COMPLETE-ANALYSIS] Query error:', queryError)
      console.error('Stack:', (queryError as Error).stack)
      throw queryError
    }

    console.log(`📄 [COMPLETE-ANALYSIS] Query returned ${docs.length} documents`)

    if (docs.length === 0) {
      throw new Error('No documents found')
    }

    console.log(`📄 [COMPLETE-ANALYSIS] Found ${docs.length} documents`)

    // Verificar ownership
    const invalidDocs = docs.filter(d => d.userId !== userId)
    if (invalidDocs.length > 0) {
      throw new Error('Unauthorized: Some documents do not belong to this user')
    }

    // Preparar documentos estruturados para o Cérebro Lógico
    console.log(`🧠 [COMPLETE-ANALYSIS] Preparing structured documents...`)

    const structuredDocuments = docs
      .map((doc, idx) => {
        console.log(`  Document ${idx + 1}: ${doc.name}, structuredData: ${doc.structuredData ? 'present' : 'null'}`)
        return doc.structuredData
      })
      .filter((sd): sd is any => {
        if (!sd || typeof sd !== 'object') return false
        return 'modules' in sd && Array.isArray((sd as any).modules)
      })

    console.log(`🧠 [COMPLETE-ANALYSIS] Structured documents for Logical Brain: ${structuredDocuments.length}`)

    // Concatenar texto extraído dos documentos
    const documentsContext = docs
      .map(d => {
        const docInfo = `\n## Documento: ${d.name} (${d.documentType})\n\n`
        return docInfo + (d.extractedText || '')
      })
      .join('\n\n---\n\n')

    // 2.5. Buscar perfil médico do paciente
    console.log('👤 [COMPLETE-ANALYSIS] Loading medical profile...')
    let medicalProfileContext = ''

    const [profile] = await db
      .select()
      .from(medicalProfiles)
      .where(eq(medicalProfiles.userId, userId))
      .limit(1)

    if (profile) {
      const profileParts = [
        `**Idade:** ${profile.age || 'Não informado'} anos`,
        `**Sexo:** ${profile.gender || 'Não informado'}`,
        `**Peso:** ${profile.weight || 'Não informado'} kg`,
        `**Altura:** ${profile.height || 'Não informado'} cm`,
      ]

      if (profile.medicalConditions && Array.isArray(profile.medicalConditions) && profile.medicalConditions.length > 0) {
        profileParts.push(`**Condições Médicas:** ${profile.medicalConditions.join(', ')}`)
      }

      if (profile.medications && Array.isArray(profile.medications) && profile.medications.length > 0) {
        profileParts.push(`**Medicações Atuais:** ${profile.medications.join(', ')}`)
      }

      if (profile.allergies && Array.isArray(profile.allergies) && profile.allergies.length > 0) {
        profileParts.push(`**Alergias:** ${profile.allergies.join(', ')}`)
      }

      if (profile.exerciseIntensity) {
        profileParts.push(`**Intensidade de Exercício:** ${profile.exerciseIntensity}`)
      }

      if (profile.exerciseFrequency) {
        profileParts.push(`**Frequência de Exercício:** ${profile.exerciseFrequency}x por semana`)
      }

      if (profile.currentDiet) {
        profileParts.push(`**Dieta Atual:** ${profile.currentDiet}`)
      }

      // Biomarcadores Funcionais
      if (profile.handgripStrength) {
        profileParts.push(`**Força de Preensão Manual:** ${profile.handgripStrength} kg (biomarcador de integridade neuromuscular)`)
      }

      if (profile.sitToStandTime) {
        const sarcopeniaRisk = profile.sitToStandTime > 15 ? ' ⚠️ ALTO RISCO DE SARCOPENIA' : ''
        profileParts.push(`**Teste Sentar-Levantar 5x:** ${profile.sitToStandTime} segundos (potência de membros inferiores)${sarcopeniaRisk}`)
      }

      medicalProfileContext = profileParts.join('\n')
      console.log('✅ [COMPLETE-ANALYSIS] Medical profile loaded')
    } else {
      console.log('⚠️ [COMPLETE-ANALYSIS] No medical profile found for user')
    }

    // 3. Carregar configuração da base de conhecimento
    console.log('⚙️ [COMPLETE-ANALYSIS] Loading knowledge base configuration...')
    const knowledgeConfig = await getKnowledgeConfig()
    console.log(`✅ [COMPLETE-ANALYSIS] Knowledge config: maxChunks=${knowledgeConfig.maxChunks}, threshold=${knowledgeConfig.similarityThreshold}`)

    // 4. Load agents for complete analysis workflow (dynamic based on DB config)
    const allAgents = await db
      .select()
      .from(healthAgents)
      .where(
        and(
          eq(healthAgents.isActive, true),
          ne(healthAgents.analysisRole, 'none')
        )
      )
      .orderBy(healthAgents.analysisOrder)

    // Separate foundation and specialized agents
    const foundationAgents = allAgents.filter(a => a.analysisRole === 'foundation')
    const specializedAgents = allAgents.filter(a => a.analysisRole === 'specialized')

    // ================================================================
    // VALIDAÇÃO: Garantir que há agentes suficientes configurados
    // ================================================================
    if (foundationAgents.length === 0) {
      throw new Error(
        'Nenhum agente de fundação configurado. ' +
        'Configure pelo menos um agente com "Papel na Análise Completa" = "Fundação" no painel admin.'
      )
    }

    if (specializedAgents.length === 0) {
      throw new Error(
        'Nenhum agente especializado configurado. ' +
        'Configure pelo menos um agente com "Papel na Análise Completa" = "Especializado" no painel admin.'
      )
    }

    console.log(`✅ [COMPLETE-ANALYSIS] Validation passed:`)
    console.log(`   - Foundation agents: ${foundationAgents.map(a => a.name).join(', ')}`)
    console.log(`   - Specialized agents: ${specializedAgents.map(a => a.name).join(', ')}`)

    // ================================================================
    // FASE 1: ANÁLISE DE FUNDAÇÃO (Foundation Agents - Sequential)
    // ================================================================
    await db
      .update(completeAnalyses)
      .set({ status: 'analyzing_foundation' })
      .where(eq(completeAnalyses.id, analysisRecord.id))

    const foundationAnalyses = []

    // Run foundation agents sequentially (in case there are multiple)
    for (const foundationAgent of foundationAgents) {
      console.log(`📋 [COMPLETE-ANALYSIS] Phase 1: ${foundationAgent.name} Analysis`)

      // ✅ RAG HABILITADO: Fornece contexto médico geral para interpretação
      // Validação informacional monitora menções sem bloquear análise
      console.log(`🧠 [COMPLETE-ANALYSIS] Searching knowledge base for ${foundationAgent.name}...`)
      let foundationKnowledge = ''
      try {
        foundationKnowledge = await buildKnowledgeContext(
          foundationAgent.analysisPrompt + '\n\n' + documentsContext.substring(0, 500),
          {
            maxChunks: knowledgeConfig.maxChunks,
            maxCharsPerChunk: knowledgeConfig.maxCharsPerChunk,
            agentId: foundationAgent.id,
          }
        )
        if (foundationKnowledge) {
          console.log(`✅ [COMPLETE-ANALYSIS] Found knowledge: ${foundationKnowledge.length} chars`)
        }
      } catch (error) {
        console.warn('⚠️ [COMPLETE-ANALYSIS] Knowledge search failed:', error)
      }

      const foundationAnalysisResult = await analyzeWithAgent(
        foundationAgent,
        foundationAgent.analysisPrompt,
        {
          documentsContext: '',  // ❌ REMOVIDO temporariamente - Gemini estava alucinando mesmo sem RAG
          medicalProfileContext,
          knowledgeContext: foundationKnowledge,
          structuredDocuments: structuredDocuments || [],
          documentIds: docs.map(d => d.id),
          instruction: `Esta é a ANÁLISE FUNDACIONAL que será usada por outros especialistas.

⚠️ REGRA CRÍTICA: Analise APENAS os dados e parâmetros que estão EFETIVAMENTE DISPONÍVEIS nos documentos.
Se um sistema não tiver dados disponíveis, diga explicitamente "Dados não disponíveis para avaliar [sistema]".
NUNCA mencione parâmetros que não foram testados.

ℹ️ IMPORTANTE: Você receberá dados do CÉREBRO LÓGICO com todos os parâmetros estruturados e validados.
Use APENAS esses dados estruturados para sua análise.`,
        }
      )

      // Build the prompt that was used for foundation analysis
      const foundationPromptUsed = `${foundationAgent.analysisPrompt}

Realize uma análise médica COMPLETA e HOLÍSTICA deste paciente.

Esta é a ANÁLISE FUNDACIONAL que será usada por outros especialistas.
Seja abrangente e detalhado em todas as áreas da saúde.

## Documentos Médicos do Paciente
${documentsContext}

${medicalProfileContext ? `## Perfil Médico do Paciente\n${medicalProfileContext}` : ''}

${foundationKnowledge ? `## Base de Conhecimento Médico (Referências)\n${foundationKnowledge}` : ''}`

      // Salvar análise fundacional
      const [savedFoundation] = await db
        .insert(analyses)
        .values({
          userId,
          agentId: foundationAgent.id,
          documentId: docs[0].id,
          documentIds: docs.map(d => d.id),
          prompt: foundationPromptUsed,
          medicalProfileSnapshot: profile || null,
          analysis: foundationAnalysisResult.analysis,
          insights: foundationAnalysisResult.insights as any,
          actionItems: foundationAnalysisResult.actionItems as any,
          modelUsed: foundationAnalysisResult.model,
          tokensUsed: foundationAnalysisResult.usage?.totalTokens || null,
          processingTimeMs: foundationAnalysisResult.metadata?.processingTimeMs || null,
          ragUsed: !!foundationKnowledge,
        })
        .returning()

      console.log(`✅ [COMPLETE-ANALYSIS] ${foundationAgent.name} analysis saved: ${savedFoundation.id}`)

      // Debit credits for foundation analysis
      try {
        const tokensUsed = foundationAnalysisResult.usage?.totalTokens || 0
        if (tokensUsed > 0) {
          await debitCredits(userId, tokensUsed, {
            analysisId: savedFoundation.id,
            operation: `complete_analysis_foundation_${foundationAgent.agentKey}`,
            modelName: foundationAgent.modelName || 'gemini-2.5-flash',
            promptTokens: foundationAnalysisResult.usage?.promptTokens || 0,
            completionTokens: foundationAnalysisResult.usage?.completionTokens || 0,
          })
          console.log(`💰 [COMPLETE-ANALYSIS] Debited ${calculateCreditsFromTokens(tokensUsed)} credits for ${foundationAgent.name} analysis`)
        }
      } catch (creditError) {
        console.error('⚠️ [COMPLETE-ANALYSIS] Failed to debit credits:', creditError)
      }

      foundationAnalyses.push(savedFoundation)
    }

    // ================================================================
    // FASE 2: ANÁLISES ESPECIALIZADAS (Paralelo com Contexto)
    // ================================================================
    await db
      .update(completeAnalyses)
      .set({ status: 'analyzing_specialized' })
      .where(eq(completeAnalyses.id, analysisRecord.id))

    console.log(`📋 [COMPLETE-ANALYSIS] Phase 2: Running ${specializedAgents.length} Specialized Analyses (Parallel)`)

    // Build context from ALL foundation analyses
    const foundationContext = foundationAnalyses
      .map(a => `## ${a.agentName || a.agentId}\n\n${a.analysis}`)
      .join('\n\n---\n\n')

    // Buscar conhecimento para todos agentes especializados em paralelo
    console.log(`🧠 [COMPLETE-ANALYSIS] Searching knowledge base for ${specializedAgents.length} specialized agents...`)
    const specializedKnowledgePromises = specializedAgents.map(agent =>
      buildKnowledgeContext(
        agent.analysisPrompt + '\n\n' + documentsContext.substring(0, 500),
        {
          maxChunks: knowledgeConfig.maxChunks,
          maxCharsPerChunk: knowledgeConfig.maxCharsPerChunk,
          agentId: agent.id,
        }
      ).catch(err => {
        console.warn(`⚠️ [COMPLETE-ANALYSIS] ${agent.name} knowledge search failed:`, err)
        return ''
      })
    )

    const specializedKnowledgeResults = await Promise.all(specializedKnowledgePromises)

    specializedKnowledgeResults.forEach((knowledge, idx) => {
      if (knowledge) {
        console.log(`✅ [COMPLETE-ANALYSIS] Found ${specializedAgents[idx].name} knowledge: ${knowledge.length} chars`)
      }
    })

    // Build generic instruction for all specialized agents
    const buildSpecializedInstruction = () => `CONTEXTO: Você tem acesso às análises de fundação realizadas anteriormente.

SUA MISSÃO: Adicionar insights COMPLEMENTARES focados em sua especialidade.

🎯 REGRAS CRÍTICAS - SIGA RIGOROSAMENTE:

1. **ESPECIALIZAÇÃO TOTAL**: Foque APENAS na sua área de especialidade conforme definido no seu perfil.
   - Aprofunde nos aspectos técnicos da sua especialidade
   - Analise marcadores e parâmetros relevantes à sua área
   - Forneça perspectiva única que apenas um especialista da sua área identificaria

2. **INSIGHTS ÚNICOS**: Seus insights devem ser específicos da sua especialidade:
   - Identifique padrões e correlações na sua área de atuação
   - Conecte marcadores bioquímicos aos aspectos da sua especialidade
   - NÃO invada o território de outras especialidades

3. **ACTION ITEMS ESPECÍFICOS**: Suas recomendações devem ser 100% da sua área:
   - Recomendações específicas e acionáveis
   - Protocolos detalhados quando aplicável
   - Estratégias práticas de implementação

4. **EVITE REPETIÇÃO**: NÃO repita o que as análises de fundação já disseram
   - Se a fundação mencionou algo, você APROFUNDA tecnicamente
   - Adicione camadas de profundidade específicas da sua especialidade
   - Complemente, não duplique

⚠️ REGRA CRÍTICA DE VALIDAÇÃO:
   - Mencione APENAS parâmetros que estão na lista "PARÂMETROS DISPONÍVEIS NOS DOCUMENTOS"
   - NUNCA mencione parâmetros que não foram testados
   - Se um dado não estiver disponível, diga "não disponível" ou "não testado"

ANÁLISES ANTERIORES (FUNDAÇÃO):
${foundationContext}

---

Agora, analise os documentos sob sua perspectiva especializada.`

    // Execute all specialized analyses in parallel
    const specializedAnalysisPromises = specializedAgents.map((agent, idx) => {
      const agentKnowledge = specializedKnowledgeResults[idx] || ''
      const instruction = buildSpecializedInstruction()

      return analyzeWithAgent(
        agent,
        agent.analysisPrompt,
        {
          documentsContext: '',  // Using Logical Brain only
          medicalProfileContext,
          knowledgeContext: agentKnowledge,
          structuredDocuments: structuredDocuments || [],
          documentIds: docs.map(d => d.id),
          instruction,
        }
      ).then(analysisResult => ({
        agent,
        analysisResult,
        agentKnowledge,
        instruction,
      }))
    })

    const specializedAnalysesData = await Promise.all(specializedAnalysisPromises)

    console.log(`✅ [COMPLETE-ANALYSIS] All ${specializedAnalysesData.length} specialized analyses completed`)

    // Save all specialized analyses to database in parallel
    const savedSpecializedPromises = specializedAnalysesData.map(({ agent, analysisResult, agentKnowledge, instruction }) => {
      const promptUsed = `${agent.analysisPrompt}

${instruction}

## Documentos Médicos do Paciente
${documentsContext}

${medicalProfileContext ? `## Perfil Médico do Paciente\n${medicalProfileContext}` : ''}

${agentKnowledge ? `## Base de Conhecimento Médico (Referências)\n${agentKnowledge}` : ''}`

      return db
        .insert(analyses)
        .values({
          userId,
          agentId: agent.id,
          documentId: docs[0].id,
          documentIds: docs.map(d => d.id),
          prompt: promptUsed,
          medicalProfileSnapshot: profile || null,
          analysis: analysisResult.analysis,
          insights: analysisResult.insights as any,
          actionItems: analysisResult.actionItems as any,
          modelUsed: analysisResult.model,
          tokensUsed: analysisResult.usage?.totalTokens || null,
          processingTimeMs: analysisResult.metadata?.processingTimeMs || null,
          ragUsed: !!agentKnowledge,
        })
        .returning()
        .then(r => ({ savedAnalysis: r[0], agent, analysisResult }))
    })

    const savedSpecializedAnalyses = await Promise.all(savedSpecializedPromises)

    console.log(`✅ [COMPLETE-ANALYSIS] Specialized analyses saved:`)
    savedSpecializedAnalyses.forEach(({ savedAnalysis, agent }) => {
      console.log(`   - ${agent.name}: ${savedAnalysis.id}`)
    })

    // Debit credits for all specialized analyses
    try {
      await Promise.all(
        savedSpecializedAnalyses.map(async ({ savedAnalysis, agent, analysisResult }) => {
          const tokens = analysisResult.usage?.totalTokens || 0
          if (tokens > 0) {
            await debitCredits(userId, tokens, {
              analysisId: savedAnalysis.id,
              operation: `complete_analysis_${agent.agentKey}`,
              modelName: agent.modelName || 'gemini-2.5-flash',
              promptTokens: analysisResult.usage?.promptTokens || 0,
              completionTokens: analysisResult.usage?.completionTokens || 0,
            })
            console.log(`💰 [COMPLETE-ANALYSIS] Debited ${calculateCreditsFromTokens(tokens)} credits for ${agent.name} analysis`)
          }
        })
      )
    } catch (creditError) {
      console.error('⚠️ [COMPLETE-ANALYSIS] Failed to debit credits for specialized analyses:', creditError)
    }

    // ================================================================
    // FASE 3: SÍNTESE CONSOLIDADA
    // ================================================================
    await db
      .update(completeAnalyses)
      .set({ status: 'generating_synthesis' })
      .where(eq(completeAnalyses.id, analysisRecord.id))

    console.log('🧠 [COMPLETE-ANALYSIS] Phase 3: Generating Synthesis')

    // Build synthesis input from all analyses (foundation + specialized)
    const allAnalysesForSynthesis = [
      // Foundation analyses
      ...foundationAnalyses.map(fa => ({
        agent: fa.agentName || 'Foundation Agent',
        agentKey: fa.agentKey || 'foundation',
        analysis: fa.analysis,
      })),
      // Specialized analyses
      ...savedSpecializedAnalyses.map(({ savedAnalysis, agent }) => ({
        agent: agent.name,
        agentKey: agent.agentKey,
        analysis: savedAnalysis.analysis,
      })),
    ]

    const synthesis = await generateSynthesis(
      allAnalysesForSynthesis,
      {
        structuredDocuments,
        enableValidation: true, // Enable validation to prevent hallucinations
      }
    )

    console.log('✅ [COMPLETE-ANALYSIS] Synthesis generated')

    // ================================================================
    // FASE 4: RECOMENDAÇÕES E PLANO SEMANAL (Paralelo)
    // ================================================================
    await db
      .update(completeAnalyses)
      .set({ status: 'generating_products' })
      .where(eq(completeAnalyses.id, analysisRecord.id))

    console.log('💡 [COMPLETE-ANALYSIS] Phase 4: Generating Recommendations & Weekly Plan')

    // Collect all analysis IDs (foundation + specialized)
    const allAnalysisIds = [
      ...foundationAnalyses.map(fa => fa.id),
      ...savedSpecializedAnalyses.map(({ savedAnalysis }) => savedAnalysis.id),
    ]

    const [recommendations, weeklyPlan] = await Promise.all([
      generateRecommendationsFromMultipleAnalyses(userId, allAnalysisIds),
      generateCompleteWeeklyPlan(userId, allAnalysisIds),
    ])

    console.log('✅ [COMPLETE-ANALYSIS] Recommendations and Weekly Plan generated')

    // Debit credits for recommendations
    try {
      const recTokens = recommendations.usage?.totalTokens || 0
      if (recTokens > 0) {
        await debitCredits(userId, recTokens, {
          operation: 'complete_analysis_recommendations',
          modelName: 'gemini-2.5-flash',
          promptTokens: recommendations.usage?.promptTokens || 0,
          completionTokens: recommendations.usage?.completionTokens || 0,
          description: `Recommendations for complete analysis ${analysisRecord.id}`,
        })
        console.log(`💰 [COMPLETE-ANALYSIS] Debited ${calculateCreditsFromTokens(recTokens)} credits for recommendations`)
      }
    } catch (creditError) {
      console.error('⚠️ [COMPLETE-ANALYSIS] Failed to debit credits for recommendations:', creditError)
    }

    // Debit credits for weekly plan (sum of all 4 components)
    try {
      const planTokens = weeklyPlan.usage?.totalTokens || 0
      if (planTokens > 0) {
        await debitCredits(userId, planTokens, {
          operation: 'complete_analysis_weekly_plan',
          modelName: 'gemini-2.5-flash',
          promptTokens: weeklyPlan.usage?.promptTokens || 0,
          completionTokens: weeklyPlan.usage?.completionTokens || 0,
          description: `Weekly plan (Supp: ${weeklyPlan.usage?.supplementation || 0}, Shop: ${weeklyPlan.usage?.shopping || 0}, Meals: ${weeklyPlan.usage?.meals || 0}, Workout: ${weeklyPlan.usage?.workout || 0})`,
        })
        console.log(`💰 [COMPLETE-ANALYSIS] Debited ${calculateCreditsFromTokens(planTokens)} credits for weekly plan (${planTokens} tokens)`)
      }
    } catch (creditError) {
      console.error('⚠️ [COMPLETE-ANALYSIS] Failed to debit credits for weekly plan:', creditError)
    }

    // ================================================================
    // FINALIZAÇÃO: Atualizar registro com todos os IDs
    // ================================================================
    await db
      .update(completeAnalyses)
      .set({
        analysisIds: allAnalysisIds,
        synthesis: synthesis as any,
        recommendationsId: recommendations.id,
        weeklyPlanId: weeklyPlan.id,
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(completeAnalyses.id, analysisRecord.id))

    console.log('✅ [COMPLETE-ANALYSIS] Complete analysis workflow finished successfully')

    // Build dynamic analyses object for return
    const analysesObject = Object.fromEntries([
      ...foundationAnalyses.map((fa, idx) => [`foundation_${idx}`, fa]),
      ...savedSpecializedAnalyses.map(({ savedAnalysis, agent }) => [agent.agentKey, savedAnalysis]),
    ])

    return {
      id: analysisRecord.id,
      analyses: analysesObject,
      analysisIds: allAnalysisIds,
      synthesis,
      recommendations,
      weeklyPlan,
      status: 'completed' as const,
    }
  } catch (error) {
    console.error('❌ [COMPLETE-ANALYSIS] Error:', error)

    // Atualizar status para falha
    await db
      .update(completeAnalyses)
      .set({
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      .where(eq(completeAnalyses.id, analysisRecord.id))

    throw error
  }
}
