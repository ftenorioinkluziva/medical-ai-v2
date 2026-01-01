/**
 * Agent Analysis Functions
 * Handles medical analysis using configured agents
 */

import { generateStructuredMedicalAnalysis } from '../core/generate'
import type { HealthAgent } from '@/lib/db/schema'
import type { StructuredMedicalDocument } from '@/lib/documents/structuring'
import { runLogicalAnalysis, formatLogicalAnalysisForPrompt } from '@/lib/logic'
import { buildParametersContext, validateMentionedParameters, extractAvailableParameters } from '../synthesis/parameter-extractor'

export interface AnalyzeWithAgentOptions {
  documentsContext?: string
  medicalProfileContext?: string
  knowledgeContext?: string
  previousAnalysesContext?: string
  ragContext?: string
  structuredDocuments?: StructuredMedicalDocument[]
  documentIds?: string[]
  instruction?: string
  enableValidation?: boolean
}

/**
 * Analyze medical data using a specific health agent
 */
export async function analyzeWithAgent(
  agent: HealthAgent,
  analysisPrompt: string,
  options: AnalyzeWithAgentOptions = {}
) {
  const {
    documentsContext = '',
    medicalProfileContext = '',
    knowledgeContext = '',
    previousAnalysesContext = '',
    ragContext = '',
    structuredDocuments = [],
    documentIds = [],
    instruction = '',
    enableValidation = true,
  } = options

  console.log(`🤖 [AGENT] Starting analysis with: ${agent.name}`)
  console.log(`📊 [AGENT] Model: ${agent.modelName}, Temp: ${agent.modelConfig.temperature}`)
  console.log(`🔍 [AGENT] Validation enabled: ${enableValidation}`)

  if (previousAnalysesContext) {
    // Count number of previous analyses included
    const analysisCount = (previousAnalysesContext.match(/## Análise Prévia:/g) || []).length
    console.log(`📋 [AGENT] Including ${analysisCount} previous analysis/analyses from other specialists`)
  }

  // Extract available parameters for validation
  let parametersContext = ''
  let availableParameters: string[] = []

  if (structuredDocuments.length > 0 && enableValidation) {
    parametersContext = buildParametersContext(structuredDocuments)
    const extracted = extractAvailableParameters(structuredDocuments)
    availableParameters = extracted.allParameters

    console.log(`✅ [AGENT] Extracted ${availableParameters.length} available parameters for validation`)
    console.log(`   First 10:`, availableParameters.slice(0, 10).join(', '), '...')
  }

  // ========== CÉREBRO LÓGICO (LOGICAL BRAIN) ==========
  let logicalContext = ''

  if (structuredDocuments.length > 0) {
    console.log(`🧠 [LOGICAL-BRAIN] Running deterministic analysis on ${structuredDocuments.length} documents...`)

    try {
      const logicalAnalysis = await runLogicalAnalysis(structuredDocuments, documentIds)

      if (logicalAnalysis.biomarkers.length > 0) {
        logicalContext = formatLogicalAnalysisForPrompt(logicalAnalysis)

        console.log(`✅ [LOGICAL-BRAIN] Logical analysis complete:`)
        console.log(`   - Biomarkers: ${logicalAnalysis.biomarkers.length}`)
        console.log(`   - Metrics: ${logicalAnalysis.metrics.length}`)
        console.log(`   - Protocols triggered: ${logicalAnalysis.protocols.length}`)
        console.log(`   - Critical alerts: ${logicalAnalysis.summary.criticalAlerts.length}`)
      } else {
        console.log(`ℹ️ [LOGICAL-BRAIN] No biomarkers found in structured documents`)
      }
    } catch (error) {
      console.error('❌ [LOGICAL-BRAIN] Error during logical analysis:', error)
      // Continue without logical analysis - don't block the agent
    }
  }

  // ========== BUILD COMPREHENSIVE PROMPT ==========
  const parts = [agent.analysisPrompt]

  // Add instruction if provided (used for specialized agents)
  if (instruction) {
    parts.push('\n\n' + instruction)
  }

  // Parameters list comes FIRST (validation layer)
  if (parametersContext) {
    parts.push('\n\n' + parametersContext)
  }

  // Logical analysis comes SECOND (most reliable data)
  if (logicalContext) {
    parts.push('\n\n' + logicalContext)
  }

  if (knowledgeContext) {
    parts.push('\n\n## Base de Conhecimento Médico (Referências)')
    parts.push('⚠️ ATENÇÃO: Este é conhecimento médico GERAL para CONTEXTO e INTERPRETAÇÃO.')
    parts.push('NÃO use este conhecimento para INVENTAR ou INFERIR valores de parâmetros que não foram testados.')
    parts.push('Se um parâmetro mencionado aqui NÃO está na lista "PARÂMETROS DISPONÍVEIS", diga "não testado".\n')
    parts.push(knowledgeContext)
  }

  if (documentsContext) {
    parts.push('\n\n## Documentos Médicos do Paciente')
    parts.push(documentsContext)
  }

  if (medicalProfileContext) {
    parts.push('\n\n## Perfil Médico do Paciente')
    parts.push(medicalProfileContext)
  }

  if (previousAnalysesContext) {
    parts.push('\n\n## Análises Prévias de Outros Especialistas')
    parts.push('As análises abaixo foram realizadas por outros especialistas e podem fornecer insights adicionais:')
    parts.push(previousAnalysesContext)
  }

  const userPrompt = parts.join('\n')

  // ✅ Use agent-configured thinking mode (from database)
  const useThinkingMode = agent.useThinkingMode

  if (useThinkingMode) {
    console.log(`🧠 [AGENT] Enabling thinking mode for ${agent.name}`)
  }

  // Generate structured analysis using AI SDK with system_prompt from agent
  const result = await generateStructuredMedicalAnalysis(
    agent.systemPrompt,
    userPrompt,
    ragContext,
    {
      model: agent.modelName,
      temperature: agent.modelConfig.temperature,
      maxTokens: agent.modelConfig.maxOutputTokens,
      topP: agent.modelConfig.topP,
      topK: agent.modelConfig.topK,
      enableCaching: false,  // ❌ CACHE DESABILITADO - estava causando alucinações persistentes
      useThinkingMode,  // ✅ Enable for complex agents
    }
  )

  console.log(`✅ [AGENT] Analysis completed for: ${agent.name}`)
  console.log(`   💡 Insights: ${result.insights.length}`)
  console.log(`   🎯 Action Items: ${result.actionItems.length}`)

  // Optional validation (informational only, does not block)
  if (enableValidation && availableParameters.length > 0) {
    console.log(`🔍 [AGENT] Checking analysis for parameter mentions...`)

    const analysisText = result.analysis
    const validation = validateMentionedParameters(analysisText, availableParameters)

    if (!validation.valid) {
      // ℹ️ Just log as informational - don't block the analysis
      console.log(`ℹ️  [AGENT] Detected mentions of parameters not in available list:`)
      console.log(`   Mentioned:`, validation.hallucinatedParameters)
      console.log(`   Note: These may be contextual (e.g., "not available" or "suggested for next evaluation")`)
      validation.warnings.forEach(w => console.log(`   `, w))
    } else {
      console.log(`✅ [AGENT] All parameter mentions are from available parameters`)
    }
  }

  return {
    analysis: result.analysis,
    insights: result.insights,
    actionItems: result.actionItems,
    model: result.model,
    usage: result.usage,
    finishReason: result.finishReason,
    metadata: result.metadata,
    agent: {
      id: agent.id,
      agentKey: agent.agentKey,
      name: agent.name,
      title: agent.title,
    },
  }
}
