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
  enableCaching?: boolean  // Enable context caching for repeated contexts
  useThinkingMode?: boolean  // Enable thinking mode for complex reasoning
}

/**
 * Calculate optimal maxTokens based on input context size
 * Gemini 2.5 Flash supports up to 65K output tokens - let's use it wisely!
 */
function calculateOptimalMaxTokens(
  systemPrompt: string,
  userPrompt: string,
  ragContext?: string,
  explicitMaxTokens?: number
): number {
  // If user explicitly set maxTokens, respect it
  if (explicitMaxTokens) {
    return explicitMaxTokens
  }

  // Calculate total input length
  const totalInputLength =
    systemPrompt.length +
    userPrompt.length +
    (ragContext?.length || 0)

  // Auto-scale based on input complexity
  // Large inputs → need more output space for comprehensive analysis
  if (totalInputLength > 100000) {
    return 32768  // 32K for very large contexts (multiple documents)
  } else if (totalInputLength > 50000) {
    return 24576  // 24K for large contexts (comprehensive analysis)
  } else if (totalInputLength > 20000) {
    return 16384  // 16K for medium contexts (detailed analysis)
  } else if (totalInputLength > 10000) {
    return 12288  // 12K for medium-small contexts
  } else {
    return 8192   // 8K for simple contexts (default)
  }
}

/**
 * Generate medical analysis using AI
 * Now with dynamic token limits based on context size
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
    maxTokens,  // Optional - will auto-calculate if not provided
    topP = 0.9,
    topK = 40,
    enableCaching = true,  // ✅ Enable by default for cost savings
    useThinkingMode = false,  // Disable by default (can enable for complex agents)
  } = options

  // ✅ Calculate optimal maxTokens dynamically
  const optimalMaxTokens = calculateOptimalMaxTokens(
    systemPrompt,
    userPrompt,
    ragContext,
    maxTokens
  )

  // Build messages with context caching support
  const messages: any[] = []

  // System prompt with caching (agent prompts rarely change)
  messages.push({
    role: 'system',
    content: systemPrompt,
    ...(enableCaching && {
      experimental_providerMetadata: {
        google: {
          cacheControl: { type: 'ephemeral' }
        }
      }
    })
  })

  // Build user message parts
  const userParts: string[] = []

  // RAG context (cacheable - knowledge base doesn't change often)
  if (ragContext) {
    userParts.push('## Contexto Especializado (Base de Conhecimento)')
    userParts.push(ragContext)
    userParts.push('\n')
  }

  // Actual data to analyze (not cached - changes every time)
  userParts.push('## Dados para Análise')
  userParts.push(userPrompt)

  userParts.push('\n## IMPORTANTE')
  userParts.push('Esta análise é gerada por IA para fins educacionais e NÃO substitui consulta médica profissional.')
  userParts.push('Sempre consulte um profissional de saúde qualificado para interpretação médica definitiva.')

  messages.push({
    role: 'user',
    content: userParts.join('\n')
  })

  const totalInputLength = systemPrompt.length + userParts.join('\n').length

  console.log(`🤖 [AI] Generating analysis with ${model}...`)
  console.log(`📊 [AI] Config: temp=${temperature}, maxTokens=${optimalMaxTokens} ${!maxTokens ? '(auto-calculated)' : ''}`)
  console.log(`📏 [AI] Input length: ${totalInputLength} chars`)
  if (enableCaching) {
    console.log(`⚡ [AI] Context caching: ENABLED (system prompt + RAG)`)
  }
  if (useThinkingMode) {
    console.log(`🧠 [AI] Thinking mode: ENABLED`)
  }

  const startTime = Date.now()

  const result = await generateText({
    model: getGoogleModel(model),
    messages,
    temperature,
    maxTokens: optimalMaxTokens,
    topP,
    topK,
    ...(useThinkingMode && {
      experimental_providerMetadata: {
        google: {
          useThinking: true
        }
      }
    })
  })

  const endTime = Date.now()

  console.log(`✅ [AI] Analysis completed in ${endTime - startTime}ms`)
  console.log(`📝 [AI] Response length: ${result.text.length} characters`)
  console.log(`📊 [AI] Tokens used: ${result.usage.totalTokens} (output: ${result.usage.completionTokens})`)

  // Check if cache was used (Gemini API returns this info)
  if (result.usage && 'cachedTokens' in result.usage) {
    const cachedTokens = (result.usage as any).cachedTokens
    if (cachedTokens > 0) {
      console.log(`💰 [AI] Cache hit! Saved ${cachedTokens} tokens`)
    }
  }

  return {
    analysis: result.text,
    model,
    usage: result.usage,
    finishReason: result.finishReason,
    metadata: {
      temperature,
      maxTokens: optimalMaxTokens,
      processingTimeMs: endTime - startTime,
      ragUsed: !!ragContext,
      inputLength: totalInputLength,
      autoCalculatedTokens: !maxTokens,
      cachingEnabled: enableCaching,
      thinkingModeEnabled: useThinkingMode,
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
