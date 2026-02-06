/**
 * Agent Analysis API
 * Analyzes medical data using a specific health agent
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { healthAgents, medicalProfiles, documents, analyses } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { analyzeWithAgent } from '@/lib/ai/agents/analyze'
import { buildKnowledgeContext } from '@/lib/ai/knowledge'
import { generateSynthesis } from '@/lib/ai/synthesis/generator'
import type { StructuredMedicalDocument } from '@/lib/documents/structuring'
import { getKnowledgeConfig } from '@/lib/db/settings'
import { getUserCredits, calculateCreditsFromTokens, debitCredits } from '@/lib/billing/credits'
import { checkHourlyRateLimit, checkDailyRateLimit } from '@/lib/billing/rate-limiting'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ agentId: string }> }
) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { agentId } = await context.params

    // Get agent configuration
    const [agent] = await db
      .select()
      .from(healthAgents)
      .where(eq(healthAgents.id, agentId))
      .limit(1)

    if (!agent) {
      return NextResponse.json(
        { error: 'Agente não encontrado' },
        { status: 404 }
      )
    }

    // Check if user has permission to use this agent
    const userRole = session.user.role || 'patient'
    if (!agent.allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para usar este agente' },
        { status: 403 }
      )
    }

    // ============ CREDIT CHECK ============
    const ESTIMATED_TOKENS = 70000
    const estimatedCredits = calculateCreditsFromTokens(ESTIMATED_TOKENS)
    const userCreditsData = await getUserCredits(session.user.id)

    if (userCreditsData.balance < estimatedCredits) {
      const shortfall = estimatedCredits - userCreditsData.balance
      return NextResponse.json(
        {
          error: `Créditos insuficientes. Você precisa de mais ${shortfall} créditos para realizar esta análise.`,
          details: {
            required: estimatedCredits,
            current: userCreditsData.balance,
            shortfall: shortfall,
            message: `Saldo atual: ${userCreditsData.balance} créditos | Necessário: ${estimatedCredits} créditos | Faltam: ${shortfall} créditos`
          }
        },
        { status: 402 }
      )
    }

    // Rate limiting
    const exceededHourly = await checkHourlyRateLimit(session.user.id)
    if (exceededHourly) {
      return NextResponse.json(
        { error: 'Limite de uso por hora excedido. Tente novamente mais tarde.' },
        { status: 429 }
      )
    }

    const exceededDaily = await checkDailyRateLimit(session.user.id)
    if (exceededDaily) {
      return NextResponse.json(
        { error: 'Limite de uso diário excedido. Tente novamente amanhã.' },
        { status: 429 }
      )
    }
    // ======================================

    // Parse request body
    const body = await request.json()
    const {
      documentIds = [],
      includeProfile = true,
      previousAnalysisIds = [],
    } = body

    // Use analysis_prompt from agent configuration
    const analysisPrompt = agent.analysisPrompt || 'Analise os dados médicos fornecidos.'

    console.log(`🤖 [ANALYSIS-API] Starting analysis with agent: ${agent.name}`)
    console.log(`📊 [ANALYSIS-API] User: ${session.user.id}, Documents: ${documentIds.length}, Include Profile: ${includeProfile}, Previous Analyses: ${previousAnalysisIds.length}`)

    // Build context
    let documentsContext = ''
    let medicalProfileContext = ''
    let knowledgeContext = ''
    let previousAnalysesContext = ''
    let userDocuments: any[] = []
    let profile: any = null

    // 1. Documents Context (using structured data)
    if (documentIds && documentIds.length > 0) {
      console.log(`📄 [ANALYSIS-API] Loading ${documentIds.length} selected documents...`)

      const { inArray } = await import('drizzle-orm')

      userDocuments = await db
        .select({
          id: documents.id,
          fileName: documents.fileName,
          documentType: documents.documentType,
          documentDate: documents.documentDate, // ✅ Include document date
          extractedText: documents.extractedText,
          structuredData: documents.structuredData,
          createdAt: documents.createdAt,
        })
        .from(documents)
        .where(inArray(documents.id, documentIds))
        .orderBy(desc(documents.documentDate), desc(documents.createdAt)) // ✅ Order by exam date first

      if (userDocuments.length > 0) {
        const documentParts: string[] = []

        for (const doc of userDocuments) {
          const structuredData = doc.structuredData as StructuredMedicalDocument | null

          if (structuredData && structuredData.modules && structuredData.modules.length > 0) {
            // Build structured context
            let docContext = `\n## Documento: ${doc.fileName}\n`
            docContext += `**Tipo:** ${structuredData.documentType}\n`
            // ✅ Use documentDate (real exam date) instead of createdAt (upload date)
            const displayDate = doc.documentDate
              ? new Date(doc.documentDate).toLocaleDateString('pt-BR')
              : new Date(doc.createdAt).toLocaleDateString('pt-BR')
            docContext += `**Data do Exame:** ${displayDate}\n\n`

            // Patient info
            if (structuredData.patientInfo && Object.keys(structuredData.patientInfo).length > 0) {
              docContext += `**Paciente:** ${structuredData.patientInfo.name || ''}, ${structuredData.patientInfo.age || ''} anos, ${structuredData.patientInfo.sex || ''}\n\n`
            }

            // Overall summary
            if (structuredData.overallSummary) {
              docContext += `**Resumo:** ${structuredData.overallSummary}\n\n`
            }

            // Modules
            docContext += `**Resultados dos Exames:**\n\n`
            for (const module of structuredData.modules) {
              docContext += `### ${module.moduleName} (${module.category}) - Status: ${module.status}\n`

              if (module.summary) {
                docContext += `${module.summary}\n\n`
              }

              if (module.parameters && module.parameters.length > 0) {
                docContext += `| Parâmetro | Valor | Unidade | Referência | Status |\n`
                docContext += `|-----------|-------|---------|------------|--------|\n`

                for (const param of module.parameters.slice(0, 20)) { // Limit to 20 params per module
                  docContext += `| ${param.name} | ${param.value} | ${param.unit || '-'} | ${param.referenceRange || '-'} | ${param.status || '-'} |\n`
                }
                docContext += '\n'
              }
            }

            documentParts.push(docContext)
          } else if (doc.extractedText) {
            // Fallback to raw text if no structured data
            documentParts.push(`\n## Documento: ${doc.fileName}\n${doc.extractedText.substring(0, 2000)}...\n`)
          }
        }

        documentsContext = documentParts.join('\n---\n')
        console.log(`✅ [ANALYSIS-API] Loaded ${userDocuments.length} documents (${documentsContext.length} chars)`)
      } else {
        console.log('⚠️ [ANALYSIS-API] No documents found for user')
      }
    }

    // 2. Knowledge Base Context (medical knowledge)
    console.log('🧠 [ANALYSIS-API] Searching knowledge base...')
    try {
      // Load knowledge base configuration from database
      const knowledgeConfig = await getKnowledgeConfig()
      console.log(`⚙️ [ANALYSIS-API] Knowledge config: maxChunks=${knowledgeConfig.maxChunks}, threshold=${knowledgeConfig.similarityThreshold}`)

      knowledgeContext = await buildKnowledgeContext(analysisPrompt, {
        maxChunks: knowledgeConfig.maxChunks,
        maxCharsPerChunk: knowledgeConfig.maxCharsPerChunk,
        agentId: agentId, // Use agent's knowledge configuration
      })

      if (knowledgeContext) {
        console.log(`✅ [ANALYSIS-API] Knowledge context: ${knowledgeContext.length} chars`)
      }
    } catch (error) {
      console.warn('⚠️ [ANALYSIS-API] Knowledge search failed (tables may not exist yet):', error)
    }

    // 3. Medical profile context (if enabled)
    if (includeProfile) {
      console.log('👤 [ANALYSIS-API] Including medical profile...')
      const [fetchedProfile] = await db
        .select()
        .from(medicalProfiles)
        .where(eq(medicalProfiles.userId, session.user.id))
        .limit(1)

      if (fetchedProfile) {
        profile = fetchedProfile
        const profileParts = [
          `**Idade:** ${fetchedProfile.age || 'Não informado'} anos`,
          `**Sexo:** ${fetchedProfile.gender || 'Não informado'}`,
          `**Peso:** ${fetchedProfile.weight || 'Não informado'} kg`,
          `**Altura:** ${fetchedProfile.height || 'Não informado'} cm`,
        ]

        if (fetchedProfile.medicalConditions && Array.isArray(fetchedProfile.medicalConditions)) {
          profileParts.push(`**Condições Médicas:** ${fetchedProfile.medicalConditions.join(', ')}`)
        }

        if (fetchedProfile.medications && Array.isArray(fetchedProfile.medications)) {
          profileParts.push(`**Medicações Atuais:** ${fetchedProfile.medications.join(', ')}`)
        }

        if (fetchedProfile.allergies && Array.isArray(fetchedProfile.allergies)) {
          profileParts.push(`**Alergias:** ${fetchedProfile.allergies.join(', ')}`)
        }

        if (fetchedProfile.exerciseIntensity) {
          profileParts.push(`**Intensidade de Exercício:** ${fetchedProfile.exerciseIntensity}`)
        }

        if (fetchedProfile.exerciseFrequency) {
          profileParts.push(`**Frequência de Exercício:** ${fetchedProfile.exerciseFrequency}x por semana`)
        }

        if (fetchedProfile.currentDiet) {
          profileParts.push(`**Dieta Atual:** ${fetchedProfile.currentDiet}`)
        }

        // Biomarcadores Funcionais
        if (fetchedProfile.handgripStrength) {
          profileParts.push(`**Força de Preensão Manual:** ${fetchedProfile.handgripStrength} kg (biomarcador de integridade neuromuscular e preditor de mortalidade)`)
        }

        if (fetchedProfile.sitToStandTime) {
          const sarcopeniaRisk = fetchedProfile.sitToStandTime > 15 ? ' ⚠️ ALTO RISCO DE SARCOPENIA' : ''
          profileParts.push(`**Teste Sentar-Levantar 5x:** ${fetchedProfile.sitToStandTime} segundos (potência de membros inferiores)${sarcopeniaRisk}`)
        }

        medicalProfileContext = profileParts.join('\n')
        console.log('✅ [ANALYSIS-API] Medical profile included')
      }
    }

    // 4. Previous Analyses Context (insights from other agents)
    if (previousAnalysisIds && previousAnalysisIds.length > 0) {
      console.log(`📋 [ANALYSIS-API] Loading ${previousAnalysisIds.length} previous analyses...`)

      try {
        const { inArray } = await import('drizzle-orm')

        const previousAnalyses = await db
          .select({
            id: analyses.id,
            agentName: healthAgents.name,
            analysis: analyses.analysis,
            createdAt: analyses.createdAt,
          })
          .from(analyses)
          .leftJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
          .where(inArray(analyses.id, previousAnalysisIds))

        if (previousAnalyses.length > 0) {
          const analysesParts: string[] = []

          for (const prevAnalysis of previousAnalyses) {
            analysesParts.push(`
## Análise Prévia: ${prevAnalysis.agentName || 'Agente Desconhecido'}
**Data:** ${new Date(prevAnalysis.createdAt).toLocaleDateString('pt-BR')}

${prevAnalysis.analysis}
`)
          }

          previousAnalysesContext = analysesParts.join('\n---\n')
          console.log(`✅ [ANALYSIS-API] Included ${previousAnalyses.length} previous analyses (${previousAnalysesContext.length} chars)`)
        }
      } catch (error) {
        console.error('⚠️ [ANALYSIS-API] Error loading previous analyses:', error)
      }
    }

    // Prepare structured documents for Logical Brain
    const structuredDocuments: StructuredMedicalDocument[] = userDocuments
      .map(doc => doc.structuredData as StructuredMedicalDocument)
      .filter((sd): sd is StructuredMedicalDocument => sd !== null && sd.modules !== undefined)

    console.log(`🧠 [ANALYSIS-API] Structured documents for Logical Brain: ${structuredDocuments.length}`)

    // Generate analysis
    console.log('🤖 [ANALYSIS-API] Generating analysis...')
    console.log(`📊 [ANALYSIS-API] Context sizes: documents=${documentsContext.length}, profile=${medicalProfileContext.length}, knowledge=${knowledgeContext.length}, previousAnalyses=${previousAnalysesContext.length}`)

    const result = await analyzeWithAgent(
      agent,
      analysisPrompt,
      {
        documentsContext,
        medicalProfileContext,
        knowledgeContext,
        previousAnalysesContext,
        structuredDocuments, // NOVO: Passa documentos estruturados para o Cérebro Lógico
        documentIds: userDocuments.map(d => d.id), // NOVO: Passa IDs dos documentos
      }
    )

    console.log('✅ [ANALYSIS-API] Analysis completed successfully')

    // Generate Synthesis for Single Analysis
    let synthesisResult = null
    try {
      console.log('🧠 [ANALYSIS-API] Generating synthesis for single analysis...')
      synthesisResult = await generateSynthesis(
        [{
          agent: agent.name,
          agentKey: agent.agentKey || 'agent',
          analysis: result.analysis
        }],
        {
          structuredDocuments,
          enableValidation: true
        }
      )
      console.log('✅ [ANALYSIS-API] Synthesis generated')
    } catch (synthesisError) {
      console.error('⚠️ [ANALYSIS-API] Failed to generate synthesis:', synthesisError)
    }

    // Save analysis to history
    let savedAnalysis: any = null
    try {
      const startSave = Date.now()

      const [analysis] = await db.insert(analyses).values({
        userId: session.user.id,
        agentId,
        documentIds: userDocuments.map(d => d.id),
        prompt: analysisPrompt,
        medicalProfileSnapshot: profile || null,
        analysis: result.analysis,
        // ✅ NEW: Save full synthesis object
        synthesis: synthesisResult,
        // Legacy fields left null as requested (user relies on synthesis now)
        insights: null,
        actionItems: null,
        modelUsed: result.metadata?.model || agent.modelName,
        tokensUsed: result.usage?.totalTokens || null,
        processingTimeMs: result.metadata?.processingTimeMs || null,
        ragUsed: documentIds.length > 0,
      }).returning()

      savedAnalysis = analysis
      console.log(`💾 [ANALYSIS-API] Saved to history: ${savedAnalysis.id} (${Date.now() - startSave}ms)`)
    } catch (saveError) {
      // Don't fail the request if save fails, just log
      console.error('⚠️ [ANALYSIS-API] Failed to save to history:', saveError)
    }

    // ============ DEBIT CREDITS ============
    try {
      const tokensUsed = result.usage?.totalTokens || 0

      if (tokensUsed > 0 && savedAnalysis) {
        await debitCredits(session.user.id, tokensUsed, {
          analysisId: savedAnalysis.id,
          operation: 'agent_analysis',
          modelName: agent.modelName || 'gemini-2.5-flash',
          promptTokens: result.usage?.promptTokens || 0,
          completionTokens: result.usage?.completionTokens || 0,
          cachedTokens: result.usage?.cachedTokens,
        })
        console.log(`💰 [ANALYSIS-API] Debited ${calculateCreditsFromTokens(tokensUsed)} credits for ${tokensUsed} tokens`)
      }
    } catch (creditError) {
      console.error('⚠️ [ANALYSIS-API] Failed to debit credits:', creditError)
      // Don't fail the analysis, but log for manual review
    }
    // =======================================

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      agent: result.agent,
      metadata: result.metadata,
      usage: result.usage,
      creditsDebited: result.usage?.totalTokens
        ? calculateCreditsFromTokens(result.usage.totalTokens)
        : 0,
      timestamp: new Date().toISOString(),
      analysisId: savedAnalysis?.id,
    })
  } catch (error) {
    console.error('❌ [ANALYSIS-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
