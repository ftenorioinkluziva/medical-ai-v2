/**
 * Agent Analysis Functions
 * Handles medical analysis using configured agents
 */

import { generateMedicalAnalysis } from '../core/generate'
import type { HealthAgent } from '@/lib/db/schema'

export interface AnalyzeWithAgentOptions {
  documentsContext?: string
  medicalProfileContext?: string
  knowledgeContext?: string
  ragContext?: string
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
    ragContext = '',
  } = options

  console.log(`🤖 [AGENT] Starting analysis with: ${agent.name}`)
  console.log(`📊 [AGENT] Model: ${agent.modelName}, Temp: ${agent.modelConfig.temperature}`)

  // Build comprehensive prompt using analysis_prompt from agent
  const parts = [agent.analysisPrompt]

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
