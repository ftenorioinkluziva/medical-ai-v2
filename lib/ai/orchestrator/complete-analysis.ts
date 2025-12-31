/**
 * Complete Analysis Orchestrator
 * Coordinates multi-agent comprehensive analysis workflow
 */

import { db } from '@/lib/db/client'
import { completeAnalyses, analyses, documents, healthAgents, medicalProfiles } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
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

    // 4. Buscar agentes necessários
    const agents = await db.select().from(healthAgents)
    const integrativeAgent = agents.find(a => a.agentKey === 'integrativa')
    const nutritionAgent = agents.find(a => a.agentKey === 'nutricao')
    const exerciseAgent = agents.find(a => a.agentKey === 'exercicio')

    if (!integrativeAgent || !nutritionAgent || !exerciseAgent) {
      throw new Error('Required agents not found in database')
    }

    console.log('✅ [COMPLETE-ANALYSIS] All required agents found')

    // ================================================================
    // FASE 1: ANÁLISE DE MEDICINA INTEGRATIVA (Fundação)
    // ================================================================
    await db
      .update(completeAnalyses)
      .set({ status: 'analyzing_integrative' })
      .where(eq(completeAnalyses.id, analysisRecord.id))

    console.log('📋 [COMPLETE-ANALYSIS] Phase 1: Integrative Medicine Analysis')

    // ✅ RAG HABILITADO: Fornece contexto médico geral para interpretação
    // Validação informacional monitora menções sem bloquear análise
    console.log('🧠 [COMPLETE-ANALYSIS] Searching knowledge base for integrative medicine...')
    let integrativeKnowledge = ''
    try {
      integrativeKnowledge = await buildKnowledgeContext(
        integrativeAgent.analysisPrompt + '\n\n' + documentsContext.substring(0, 500),
        {
          maxChunks: knowledgeConfig.maxChunks,
          maxCharsPerChunk: knowledgeConfig.maxCharsPerChunk,
          agentId: integrativeAgent.id,
        }
      )
      if (integrativeKnowledge) {
        console.log(`✅ [COMPLETE-ANALYSIS] Found integrative knowledge: ${integrativeKnowledge.length} chars`)
      }
    } catch (error) {
      console.warn('⚠️ [COMPLETE-ANALYSIS] Knowledge search failed:', error)
    }

    const integrativeAnalysis = await analyzeWithAgent(
      integrativeAgent,
      integrativeAgent.analysisPrompt,
      {
        documentsContext: '',  // ❌ REMOVIDO temporariamente - Gemini estava alucinando mesmo sem RAG
        medicalProfileContext,
        knowledgeContext: integrativeKnowledge,
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

    // Build the prompt that was used for integrative analysis
    const integrativePromptUsed = `${integrativeAgent.analysisPrompt}

Realize uma análise médica COMPLETA e HOLÍSTICA deste paciente.

Esta é a ANÁLISE FUNDACIONAL que será usada por outros especialistas.
Seja abrangente e detalhado em todas as áreas da saúde.

## Documentos Médicos do Paciente
${documentsContext}

${medicalProfileContext ? `## Perfil Médico do Paciente\n${medicalProfileContext}` : ''}

${integrativeKnowledge ? `## Base de Conhecimento Médico (Referências)\n${integrativeKnowledge}` : ''}`

    // Salvar análise integrativa
    const [savedIntegrative] = await db
      .insert(analyses)
      .values({
        userId,
        agentId: integrativeAgent.id,
        documentId: docs[0].id,
        documentIds: docs.map(d => d.id),
        prompt: integrativePromptUsed,
        medicalProfileSnapshot: profile || null,
        analysis: integrativeAnalysis.analysis,
        insights: integrativeAnalysis.insights as any,
        actionItems: integrativeAnalysis.actionItems as any,
        modelUsed: integrativeAnalysis.model,
        tokensUsed: integrativeAnalysis.usage?.totalTokens || null,
        processingTimeMs: integrativeAnalysis.metadata?.processingTimeMs || null,
        ragUsed: !!integrativeKnowledge,
      })
      .returning()

    console.log(`✅ [COMPLETE-ANALYSIS] Integrative analysis saved: ${savedIntegrative.id}`)

    // Debit credits for integrative analysis
    try {
      const tokensUsed = integrativeAnalysis.usage?.totalTokens || 0
      if (tokensUsed > 0) {
        await debitCredits(userId, tokensUsed, {
          analysisId: savedIntegrative.id,
          operation: 'complete_analysis_integrative',
          modelName: integrativeAgent.modelName || 'gemini-2.5-flash',
          promptTokens: integrativeAnalysis.usage?.promptTokens || 0,
          completionTokens: integrativeAnalysis.usage?.completionTokens || 0,
        })
        console.log(`💰 [COMPLETE-ANALYSIS] Debited ${calculateCreditsFromTokens(tokensUsed)} credits for integrative analysis`)
      }
    } catch (creditError) {
      console.error('⚠️ [COMPLETE-ANALYSIS] Failed to debit credits for integrative:', creditError)
    }

    // ================================================================
    // FASE 2: ANÁLISES ESPECIALIZADAS (Paralelo com Contexto)
    // ================================================================
    await db
      .update(completeAnalyses)
      .set({ status: 'analyzing_specialized' })
      .where(eq(completeAnalyses.id, analysisRecord.id))

    console.log('📋 [COMPLETE-ANALYSIS] Phase 2: Specialized Analyses (Parallel)')

    // Buscar conhecimento para Nutrição e Exercício em paralelo
    console.log('🧠 [COMPLETE-ANALYSIS] Searching knowledge base for nutrition and exercise...')
    const [nutritionKnowledge, exerciseKnowledge] = await Promise.all([
      buildKnowledgeContext(
        nutritionAgent.analysisPrompt + '\n\n' + documentsContext.substring(0, 500),
        {
          maxChunks: knowledgeConfig.maxChunks,
          maxCharsPerChunk: knowledgeConfig.maxCharsPerChunk,
          agentId: nutritionAgent.id,
        }
      ).catch(err => {
        console.warn('⚠️ [COMPLETE-ANALYSIS] Nutrition knowledge search failed:', err)
        return ''
      }),
      buildKnowledgeContext(
        exerciseAgent.analysisPrompt + '\n\n' + documentsContext.substring(0, 500),
        {
          maxChunks: knowledgeConfig.maxChunks,
          maxCharsPerChunk: knowledgeConfig.maxCharsPerChunk,
          agentId: exerciseAgent.id,
        }
      ).catch(err => {
        console.warn('⚠️ [COMPLETE-ANALYSIS] Exercise knowledge search failed:', err)
        return ''
      }),
    ])

    if (nutritionKnowledge) {
      console.log(`✅ [COMPLETE-ANALYSIS] Found nutrition knowledge: ${nutritionKnowledge.length} chars`)
    }
    if (exerciseKnowledge) {
      console.log(`✅ [COMPLETE-ANALYSIS] Found exercise knowledge: ${exerciseKnowledge.length} chars`)
    }

    const nutritionInstruction = `CONTEXTO: Você tem acesso à análise de Medicina Integrativa realizada anteriormente.

SUA MISSÃO: Adicionar insights COMPLEMENTARES focados EXCLUSIVAMENTE em metabolismo e nutrição.

🎯 REGRAS CRÍTICAS - SIGA RIGOROSAMENTE:

1. **ESPECIALIZAÇÃO TOTAL**: Você é um NUTRICIONISTA FUNCIONAL. Foque APENAS em:
   - Metabolismo de macronutrientes e micronutrientes
   - Status vitamínico e mineral (B12, D, ferro, magnésio, zinco, selênio)
   - Saúde digestiva, absorção intestinal, microbiota
   - Perfil lipídico e ácidos graxos essenciais
   - Metabolismo proteico e aminoácidos

2. **INSIGHTS ÚNICOS**: Seus insights devem ser coisas que APENAS um nutricionista identificaria:
   - Deficiências nutricionais específicas
   - Interações entre nutrientes
   - Impacto de padrões alimentares em marcadores bioquímicos
   - Status de cofatores enzimáticos
   - NÃO mencione: exercício, hormônios (a menos que relacionados à nutrição), stress geral

3. **ACTION ITEMS ESPECÍFICOS**: Suas recomendações devem ser 100% nutricionais:
   - Alimentos terapêuticos ESPECÍFICOS (não genéricos)
   - Protocolos de suplementação com dosagens
   - Timing nutricional e combinações de alimentos
   - Estratégias para otimizar absorção
   - NÃO mencione: exercício, meditação, consultas médicas gerais

4. **EVITE REPETIÇÃO**: NÃO repita o que a Medicina Integrativa já disse
   - Se ela mencionou vitamina D baixa, você APROFUNDA: metabolismo, cofatores, absorção
   - Se ela mencionou inflamação, você CONECTA: ácidos graxos ômega-3, antioxidantes alimentares
   - Adicione camadas de profundidade técnica NUTRICIONAL

⚠️ REGRA CRÍTICA DE VALIDAÇÃO:
   - Mencione APENAS parâmetros que estão na lista "PARÂMETROS DISPONÍVEIS NOS DOCUMENTOS"
   - NUNCA mencione parâmetros que não foram testados
   - Se um dado não estiver disponível, diga "não disponível" ou "não testado"

ANÁLISE ANTERIOR (Medicina Integrativa):
${integrativeAnalysis.analysis}

---

Agora, analise os documentos sob a perspectiva EXCLUSIVA de um nutricionista funcional especializado.`

    const exerciseInstruction = `CONTEXTO: Você tem acesso à análise de Medicina Integrativa realizada anteriormente.

SUA MISSÃO: Adicionar insights COMPLEMENTARES focados EXCLUSIVAMENTE em fisiologia do exercício e performance.

🎯 REGRAS CRÍTICAS - SIGA RIGOROSAMENTE:

1. **ESPECIALIZAÇÃO TOTAL**: Você é um FISIOLOGISTA DO EXERCÍCIO. Foque APENAS em:
   - Composição corporal (massa magra, gordura, bioimpedância)
   - Taxa metabólica basal e gasto energético
   - Capacidade aeróbica e anaeróbica
   - Força muscular, potência e resistência
   - Marcadores de performance física (VO2max, força de preensão, teste sentar-levantar)

2. **INSIGHTS ÚNICOS**: Seus insights devem ser coisas que APENAS um fisiologista identificaria:
   - Análise de composição corporal detalhada
   - Capacidade funcional e risco de sarcopenia
   - Eficiência metabólica durante exercício
   - Marcadores de overtraining ou subtreinamento
   - Relação músculo-metabolismo
   - NÃO mencione: dieta detalhada, suplementos (exceto peri-treino), gestão de stress geral

3. **ACTION ITEMS ESPECÍFICOS**: Suas recomendações devem ser 100% sobre EXERCÍCIO:
   - Tipos de exercício ESPECÍFICOS (resistido, aeróbico, HIIT, Zona 2, etc)
   - Protocolos de treinamento com volume, intensidade e frequência
   - Periodização e progressão
   - Estratégias de recuperação FÍSICA (foam rolling, mobilidade, etc)
   - Nutrição PERI-TREINO específica (timing e macros)
   - NÃO mencione: dieta geral, suplementos não relacionados a exercício, terapias alternativas

4. **EVITE REPETIÇÃO**: NÃO repita o que a Medicina Integrativa já disse
   - Se ela mencionou sedentarismo, você DETALHA: protocolos progressivos, testes de aptidão
   - Se ela mencionou composição corporal, você APROFUNDA: distribuição segmentar, índice músculo-esquelético
   - Adicione camadas de profundidade técnica sobre EXERCÍCIO E PERFORMANCE

⚠️ REGRA CRÍTICA DE VALIDAÇÃO:
   - Mencione APENAS parâmetros que estão na lista "PARÂMETROS DISPONÍVEIS NOS DOCUMENTOS"
   - NUNCA mencione parâmetros que não foram testados
   - Se um dado não estiver disponível, diga "não disponível" ou "não testado"

ANÁLISE ANTERIOR (Medicina Integrativa):
${integrativeAnalysis.analysis}

---

Agora, analise os documentos sob a perspectiva EXCLUSIVA de um fisiologista do exercício.`

    const [nutritionAnalysis, exerciseAnalysis] = await Promise.all([
      // Agente de Nutrição - Análise Complementar
      analyzeWithAgent(
        nutritionAgent,
        nutritionAgent.analysisPrompt,
        {
          documentsContext: '',  // ❌ REMOVIDO - usar apenas Logical Brain
          medicalProfileContext,
          knowledgeContext: nutritionKnowledge,
          structuredDocuments: structuredDocuments || [],
          documentIds: docs.map(d => d.id),
          instruction: nutritionInstruction,
        }
      ),

      // Agente de Exercício - Análise Complementar
      analyzeWithAgent(
        exerciseAgent,
        exerciseAgent.analysisPrompt,
        {
          documentsContext: '',  // ❌ REMOVIDO - usar apenas Logical Brain
          medicalProfileContext,
          knowledgeContext: exerciseKnowledge,
          structuredDocuments: structuredDocuments || [],
          documentIds: docs.map(d => d.id),
          instruction: exerciseInstruction,
        }
      ),
    ])

    // Build the prompts that were used
    const nutritionPromptUsed = `${nutritionAgent.analysisPrompt}

${nutritionInstruction}

## Documentos Médicos do Paciente
${documentsContext}

${medicalProfileContext ? `## Perfil Médico do Paciente\n${medicalProfileContext}` : ''}

${nutritionKnowledge ? `## Base de Conhecimento Médico (Referências)\n${nutritionKnowledge}` : ''}`

    const exercisePromptUsed = `${exerciseAgent.analysisPrompt}

${exerciseInstruction}

## Documentos Médicos do Paciente
${documentsContext}

${medicalProfileContext ? `## Perfil Médico do Paciente\n${medicalProfileContext}` : ''}

${exerciseKnowledge ? `## Base de Conhecimento Médico (Referências)\n${exerciseKnowledge}` : ''}`

    // Salvar análises especializadas
    const [savedNutrition, savedExercise] = await Promise.all([
      db
        .insert(analyses)
        .values({
          userId,
          agentId: nutritionAgent.id,
          documentId: docs[0].id,
          documentIds: docs.map(d => d.id),
          prompt: nutritionPromptUsed,
          medicalProfileSnapshot: profile || null,
          analysis: nutritionAnalysis.analysis,
          insights: nutritionAnalysis.insights as any,
          actionItems: nutritionAnalysis.actionItems as any,
          modelUsed: nutritionAnalysis.model,
          tokensUsed: nutritionAnalysis.usage?.totalTokens || null,
          processingTimeMs: nutritionAnalysis.metadata?.processingTimeMs || null,
          ragUsed: !!nutritionKnowledge,
        })
        .returning()
        .then(r => r[0]),

      db
        .insert(analyses)
        .values({
          userId,
          agentId: exerciseAgent.id,
          documentId: docs[0].id,
          documentIds: docs.map(d => d.id),
          prompt: exercisePromptUsed,
          medicalProfileSnapshot: profile || null,
          analysis: exerciseAnalysis.analysis,
          insights: exerciseAnalysis.insights as any,
          actionItems: exerciseAnalysis.actionItems as any,
          modelUsed: exerciseAnalysis.model,
          tokensUsed: exerciseAnalysis.usage?.totalTokens || null,
          processingTimeMs: exerciseAnalysis.metadata?.processingTimeMs || null,
          ragUsed: !!exerciseKnowledge,
        })
        .returning()
        .then(r => r[0]),
    ])

    console.log(`✅ [COMPLETE-ANALYSIS] Specialized analyses saved:`)
    console.log(`   - Nutrition: ${savedNutrition.id}`)
    console.log(`   - Exercise: ${savedExercise.id}`)

    // Debit credits for specialized analyses
    try {
      const nutritionTokens = nutritionAnalysis.usage?.totalTokens || 0
      if (nutritionTokens > 0) {
        await debitCredits(userId, nutritionTokens, {
          analysisId: savedNutrition.id,
          operation: 'complete_analysis_nutrition',
          modelName: nutritionAgent.modelName || 'gemini-2.5-flash',
          promptTokens: nutritionAnalysis.usage?.promptTokens || 0,
          completionTokens: nutritionAnalysis.usage?.completionTokens || 0,
        })
        console.log(`💰 [COMPLETE-ANALYSIS] Debited ${calculateCreditsFromTokens(nutritionTokens)} credits for nutrition analysis`)
      }

      const exerciseTokens = exerciseAnalysis.usage?.totalTokens || 0
      if (exerciseTokens > 0) {
        await debitCredits(userId, exerciseTokens, {
          analysisId: savedExercise.id,
          operation: 'complete_analysis_exercise',
          modelName: exerciseAgent.modelName || 'gemini-2.5-flash',
          promptTokens: exerciseAnalysis.usage?.promptTokens || 0,
          completionTokens: exerciseAnalysis.usage?.completionTokens || 0,
        })
        console.log(`💰 [COMPLETE-ANALYSIS] Debited ${calculateCreditsFromTokens(exerciseTokens)} credits for exercise analysis`)
      }
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

    const synthesis = await generateSynthesis(
      [
        {
          agent: integrativeAgent.name,
          agentKey: integrativeAgent.agentKey,
          analysis: integrativeAnalysis.analysis,
        },
        {
          agent: nutritionAgent.name,
          agentKey: nutritionAgent.agentKey,
          analysis: nutritionAnalysis.analysis,
        },
        {
          agent: exerciseAgent.name,
          agentKey: exerciseAgent.agentKey,
          analysis: exerciseAnalysis.analysis,
        },
      ],
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

    const analysisIds = [savedIntegrative.id, savedNutrition.id, savedExercise.id]

    const [recommendations, weeklyPlan] = await Promise.all([
      generateRecommendationsFromMultipleAnalyses(userId, analysisIds),
      generateCompleteWeeklyPlan(userId, analysisIds),
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
        integrativeAnalysisId: savedIntegrative.id,
        nutritionAnalysisId: savedNutrition.id,
        exerciseAnalysisId: savedExercise.id,
        synthesis: synthesis as any,
        recommendationsId: recommendations.id,
        weeklyPlanId: weeklyPlan.id,
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(completeAnalyses.id, analysisRecord.id))

    console.log('✅ [COMPLETE-ANALYSIS] Complete analysis workflow finished successfully')

    return {
      id: analysisRecord.id,
      analyses: {
        integrative: savedIntegrative,
        nutrition: savedNutrition,
        exercise: savedExercise,
      },
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
