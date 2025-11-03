/**
 * Text Generation Functions
 * Using Vercel AI SDK
 */

import { generateText } from 'ai'
import { getGoogleModel, googleSafetySettings } from '../providers/google'

export interface GenerateOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  topK?: number
}

/**
 * Generate medical analysis using AI
 */
export async function generateMedicalAnalysis(
  systemPrompt: string,
  userPrompt: string,
  ragContext?: string,
  options: GenerateOptions = {}
) {
  const {
    model = 'gemini-2.5-flash',
    temperature = 0.3,
    maxTokens = 8192,
    topP = 0.9,
    topK = 40,
  } = options

  // Build comprehensive prompt
  const parts = [systemPrompt]

  if (userPrompt) {
    parts.push('\n\n## Dados para Análise')
    parts.push(userPrompt)
  }

  if (ragContext) {
    parts.push('\n\n## Contexto Especializado (Base de Conhecimento)')
    parts.push(ragContext)
  }

  parts.push('\n\n## IMPORTANTE')
  parts.push('Esta análise é gerada por IA para fins educacionais e NÃO substitui consulta médica profissional.')
  parts.push('Sempre consulte um profissional de saúde qualificado para interpretação médica definitiva.')

  const fullPrompt = parts.join('\n')

  console.log(`🤖 [AI] Generating analysis with ${model}...`)
  console.log(`📊 [AI] Config: temp=${temperature}, maxTokens=${maxTokens}`)

  const startTime = Date.now()

  const result = await generateText({
    model: getGoogleModel(model),
    prompt: fullPrompt,
    temperature,
    topP,
    topK,
  })

  const endTime = Date.now()

  console.log(`✅ [AI] Analysis completed in ${endTime - startTime}ms`)
  console.log(`📝 [AI] Response length: ${result.text.length} characters`)

  return {
    analysis: result.text,
    model,
    usage: result.usage,
    finishReason: result.finishReason,
    metadata: {
      temperature,
      maxTokens,
      processingTimeMs: endTime - startTime,
      ragUsed: !!ragContext,
    },
  }
}

/**
 * Generate simple text response (for testing)
 */
export async function generateSimpleText(
  prompt: string,
  options: GenerateOptions = {}
) {
  const {
    model = 'gemini-2.5-flash',
    temperature = 0.7,
    maxTokens = 1024,
  } = options

  const result = await generateText({
    model: getGoogleModel(model),
    prompt,
    temperature,
  })

  return {
    text: result.text,
    usage: result.usage,
  }
}
