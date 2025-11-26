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
import type { StructuredMedicalDocument } from '@/lib/documents/structuring'
import { generateRecommendationsFromAnalysis } from '@/lib/ai/recommendations/generate'
import {
  generateSupplementationStrategy,
  generateShoppingList,
  generateMealPlan,
  generateWorkoutPlan,
} from '@/lib/ai/weekly-plans/generators'
import { weeklyPlans } from '@/lib/db/schema'

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

    // Parse request body
    const body = await request.json()
    const {
      documentIds = [],
      includeProfile = true,
    } = body

    // Use analysis_prompt from agent configuration
    const analysisPrompt = agent.analysisPrompt || 'Analise os dados médicos fornecidos.'

    console.log(`🤖 [ANALYSIS-API] Starting analysis with agent: ${agent.name}`)
    console.log(`📊 [ANALYSIS-API] User: ${session.user.id}, Documents: ${documentIds.length}, Include Profile: ${includeProfile}`)

    // Build context
    let documentsContext = ''
    let medicalProfileContext = ''
    let knowledgeContext = ''
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
          extractedText: documents.extractedText,
          structuredData: documents.structuredData,
          createdAt: documents.createdAt,
        })
        .from(documents)
        .where(inArray(documents.id, documentIds))
        .orderBy(desc(documents.createdAt))

      if (userDocuments.length > 0) {
        const documentParts: string[] = []

        for (const doc of userDocuments) {
          const structuredData = doc.structuredData as StructuredMedicalDocument | null

          if (structuredData && structuredData.modules && structuredData.modules.length > 0) {
            // Build structured context
            let docContext = `\n## Documento: ${doc.fileName}\n`
            docContext += `**Tipo:** ${structuredData.documentType}\n`
            docContext += `**Data:** ${new Date(doc.createdAt).toLocaleDateString('pt-BR')}\n\n`

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
      knowledgeContext = await buildKnowledgeContext(analysisPrompt, {
        maxChunks: 3,
        maxCharsPerChunk: 1200,
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

        medicalProfileContext = profileParts.join('\n')
        console.log('✅ [ANALYSIS-API] Medical profile included')
      }
    }

    // Prepare structured documents for Logical Brain
    const structuredDocuments: StructuredMedicalDocument[] = userDocuments
      .map(doc => doc.structuredData as StructuredMedicalDocument)
      .filter((sd): sd is StructuredMedicalDocument => sd !== null && sd.modules !== undefined)

    console.log(`🧠 [ANALYSIS-API] Structured documents for Logical Brain: ${structuredDocuments.length}`)

    // Generate analysis
    console.log('🤖 [ANALYSIS-API] Generating analysis...')
    console.log(`📊 [ANALYSIS-API] Context sizes: documents=${documentsContext.length}, profile=${medicalProfileContext.length}, knowledge=${knowledgeContext.length}`)

    const result = await analyzeWithAgent(
      agent,
      analysisPrompt,
      {
        documentsContext,
        medicalProfileContext,
        knowledgeContext,
        structuredDocuments, // NOVO: Passa documentos estruturados para o Cérebro Lógico
        documentIds: userDocuments.map(d => d.id), // NOVO: Passa IDs dos documentos
      }
    )

    console.log('✅ [ANALYSIS-API] Analysis completed successfully')

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
        modelUsed: result.metadata?.model || agent.modelName,
        tokensUsed: result.usage?.totalTokens || null,
        processingTimeMs: result.metadata?.durationMs || null,
        ragUsed: documentIds.length > 0,
      }).returning()

      savedAnalysis = analysis
      console.log(`💾 [ANALYSIS-API] Saved to history: ${savedAnalysis.id} (${Date.now() - startSave}ms)`)
    } catch (saveError) {
      // Don't fail the request if save fails, just log
      console.error('⚠️ [ANALYSIS-API] Failed to save to history:', saveError)
    }

    // Generate recommendations automatically (non-blocking)
    if (savedAnalysis) {
      generateRecommendationsFromAnalysis(savedAnalysis.id, session.user.id)
        .then((rec) => {
          console.log(`✅ [ANALYSIS-API] Recommendations generated: ${rec.id}`)
        })
        .catch((error) => {
          console.error('⚠️ [ANALYSIS-API] Failed to generate recommendations:', error)
        })

      // Generate weekly plan automatically (non-blocking)
      generateWeeklyPlanFromAnalysis(savedAnalysis.id, savedAnalysis.analysis, session.user.id)
        .then((plan) => {
          console.log(`✅ [ANALYSIS-API] Weekly plan generated: ${plan.id}`)
        })
        .catch((error) => {
          console.error('⚠️ [ANALYSIS-API] Failed to generate weekly plan:', error)
        })
    }

    // Helper function to generate weekly plan
    async function generateWeeklyPlanFromAnalysis(analysisId: string, analysisText: string, userId: string) {
      console.log(`📅 [WEEKLY-PLAN] Generating plan for analysis: ${analysisId}`)

      // Generate all plans in parallel
      const [supplementation, shopping, meals, workout] = await Promise.all([
        generateSupplementationStrategy(analysisText),
        generateShoppingList(analysisText),
        generateMealPlan(analysisText),
        generateWorkoutPlan(analysisText),
      ])

      // Calculate week start date (next Monday)
      const today = new Date()
      const dayOfWeek = today.getDay()
      const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
      const weekStartDate = new Date(today)
      weekStartDate.setDate(today.getDate() + daysUntilMonday)
      const weekStartDateString = weekStartDate.toISOString().split('T')[0]

      // Save to database
      const [savedPlan] = await db
        .insert(weeklyPlans)
        .values({
          userId,
          analysisId,
          weekStartDate: weekStartDateString,
          supplementationStrategy: supplementation as any,
          shoppingList: shopping as any,
          mealPlan: meals as any,
          workoutPlan: workout as any,
        })
        .returning()

      return savedPlan
    }

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      agent: result.agent,
      metadata: result.metadata,
      usage: result.usage,
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
