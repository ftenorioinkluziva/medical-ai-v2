/**
 * Agent Analysis Functions
 * Handles medical analysis using configured agents
 */

import { generateMedicalAnalysis } from '../core/generate'
import type { HealthAgent } from '@/lib/db/schema'
import type { StructuredMedicalDocument } from '@/lib/documents/structuring'
import { runLogicalAnalysis, formatLogicalAnalysisForPrompt } from '@/lib/logic'

export interface AnalyzeWithAgentOptions {
  documentsContext?: string
  medicalProfileContext?: string
  knowledgeContext?: string
  previousAnalysesContext?: string
  ragContext?: string
  structuredDocuments?: StructuredMedicalDocument[]
  documentIds?: string[]
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
  } = options

  console.log(`🤖 [AGENT] Starting analysis with: ${agent.name}`)
  console.log(`📊 [AGENT] Model: ${agent.modelName}, Temp: ${agent.modelConfig.temperature}`)

  if (previousAnalysesContext) {
    // Count number of previous analyses included
    const analysisCount = (previousAnalysesContext.match(/## Análise Prévia:/g) || []).length
    console.log(`📋 [AGENT] Including ${analysisCount} previous analysis/analyses from other specialists`)
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

  // Logical analysis comes FIRST (most reliable data)
  if (logicalContext) {
    parts.push('\n\n' + logicalContext)
  }

  if (knowledgeContext) {
    parts.push('\n\n## Base de Conhecimento Médico (Referências)')
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

  // Generate analysis using AI SDK with system_prompt from agent
  const result = await generateMedicalAnalysis(
    agent.systemPrompt,
    userPrompt,
    ragContext,
    {
      model: agent.modelName,
      temperature: agent.modelConfig.temperature,
      maxTokens: agent.modelConfig.maxOutputTokens,
      topP: agent.modelConfig.topP,
      topK: agent.modelConfig.topK,
    }
  )

  console.log(`✅ [AGENT] Analysis completed for: ${agent.name}`)

  return {
    ...result,
    agent: {
      id: agent.id,
      agentKey: agent.agentKey,
      name: agent.name,
      title: agent.title,
    },
  }
}
