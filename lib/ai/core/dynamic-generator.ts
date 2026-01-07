/**
 * Dynamic Product Generator
 * Factory pattern to execute product generators based on database configuration
 * Supports both weekly_plan and recommendations generators
 */

import { db } from '@/lib/db/client'
import { healthAgents, type HealthAgent, type RAGConfig } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { jsonSchemaToZod } from './schema-converter'
import { buildKnowledgeContext } from '@/lib/ai/knowledge'

export type GeneratorResult = {
  object: any
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  generatorId: string
  generatorKey: string
  productType: 'weekly_plan' | 'recommendations'
  modelUsed: string
  processingTimeMs: number
}

/**
 * Load generator configuration from database
 */
export async function loadGenerator(
  generatorKey: string
): Promise<HealthAgent | null> {
  const [generator] = await db
    .select()
    .from(healthAgents)
    .where(
      and(
        eq(healthAgents.generatorKey, generatorKey),
        eq(healthAgents.agentType, 'product_generator'),
        eq(healthAgents.isActive, true)
      )
    )
    .limit(1)

  return generator || null
}

/**
 * Load all active product generators of a specific type
 */
export async function loadGeneratorsByType(
  productType: 'weekly_plan' | 'recommendations'
): Promise<HealthAgent[]> {
  const generators = await db
    .select()
    .from(healthAgents)
    .where(
      and(
        eq(healthAgents.agentType, 'product_generator'),
        eq(healthAgents.productType, productType),
        eq(healthAgents.isActive, true)
      )
    )
    .orderBy(healthAgents.executionOrder)

  return generators
}

/**
 * Load all active product generators (all types)
 */
export async function loadAllGenerators(): Promise<HealthAgent[]> {
  const generators = await db
    .select()
    .from(healthAgents)
    .where(
      and(
        eq(healthAgents.agentType, 'product_generator'),
        eq(healthAgents.isActive, true)
      )
    )
    .orderBy(healthAgents.executionOrder)

  return generators
}

/**
 * Execute a product generator with dynamic configuration
 */
export async function executeGenerator(
  generator: HealthAgent,
  analysisText: string,
  options?: {
    additionalContext?: string
  }
): Promise<GeneratorResult> {
  const startTime = Date.now()

  console.log(`🤖 [DYNAMIC-GEN] Executing generator: ${generator.name} (${generator.generatorKey})`)

  // 1. Validate generator has required fields
  if (!generator.outputSchema) {
    throw new Error(`Generator ${generator.generatorKey} missing outputSchema`)
  }

  if (!generator.productType) {
    throw new Error(`Generator ${generator.generatorKey} missing productType`)
  }

  // 2. Convert JSON Schema to Zod
  console.log('🔄 [DYNAMIC-GEN] Converting JSON Schema to Zod...')
  let zodSchema
  try {
    zodSchema = jsonSchemaToZod(generator.outputSchema)
  } catch (error) {
    throw new Error(
      `Failed to convert outputSchema for ${generator.generatorKey}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }

  // 3. Build RAG context if enabled
  let knowledgeContext = ''
  if (generator.ragConfig && (generator.ragConfig as RAGConfig).enabled) {
    console.log('🧠 [DYNAMIC-GEN] Building RAG context...')

    try {
      const ragConfig = generator.ragConfig as RAGConfig

      knowledgeContext = await buildKnowledgeContext(analysisText, {
        maxChunks: ragConfig.maxChunks,
        maxCharsPerChunk: ragConfig.maxCharsPerChunk,
        // Note: buildKnowledgeContext uses embeddings from analysis text
        // We could enhance this to use ragConfig.keywords for targeted search
      })

      if (knowledgeContext) {
        console.log(`✅ [DYNAMIC-GEN] RAG context: ${knowledgeContext.length} chars`)
      }
    } catch (error) {
      console.warn('⚠️ [DYNAMIC-GEN] RAG context failed:', error)
      // Continue without RAG if it fails
    }
  }

  // 4. Build final prompt
  let finalPrompt = generator.systemPrompt + '\n\n'

  if (generator.analysisPrompt) {
    finalPrompt += generator.analysisPrompt + '\n\n'
  }

  finalPrompt += `# Análise do Paciente\n\n${analysisText}\n\n`

  if (knowledgeContext) {
    finalPrompt += `# Base de Conhecimento Médico (Referências)\n\n${knowledgeContext}\n\n`
  }

  if (options?.additionalContext) {
    finalPrompt += options.additionalContext + '\n\n'
  }

  finalPrompt += '\nGere a saída estruturada conforme o schema fornecido.'

  // 5. Execute with AI
  console.log(`🚀 [DYNAMIC-GEN] Calling AI with model: ${generator.modelName}`)

  const result = await generateObject({
    model: google(generator.modelName),
    schema: zodSchema,
    prompt: finalPrompt,
    // Apply model config if provided
    ...(generator.modelConfig && {
      temperature: generator.modelConfig.temperature,
      topP: generator.modelConfig.topP,
      topK: generator.modelConfig.topK,
      maxTokens: generator.modelConfig.maxOutputTokens,
    }),
  })

  const processingTimeMs = Date.now() - startTime

  console.log(`✅ [DYNAMIC-GEN] Generator completed in ${processingTimeMs}ms`)
  console.log(`📊 [DYNAMIC-GEN] Token usage: ${result.usage?.totalTokens || 0} tokens`)

  return {
    object: result.object,
    usage: {
      promptTokens: result.usage?.promptTokens || 0,
      completionTokens: result.usage?.completionTokens || 0,
      totalTokens: result.usage?.totalTokens || 0,
    },
    generatorId: generator.id,
    generatorKey: generator.generatorKey!,
    productType: generator.productType as 'weekly_plan' | 'recommendations',
    modelUsed: generator.modelName,
    processingTimeMs,
  }
}

/**
 * Execute multiple generators in parallel
 */
export async function executeGenerators(
  generators: HealthAgent[],
  analysisText: string,
  options?: {
    additionalContext?: string
  }
): Promise<GeneratorResult[]> {
  console.log(`🔄 [DYNAMIC-GEN] Executing ${generators.length} generators in parallel...`)

  const results = await Promise.all(
    generators.map(generator => executeGenerator(generator, analysisText, options))
  )

  console.log(`✅ [DYNAMIC-GEN] All generators completed`)

  return results
}
