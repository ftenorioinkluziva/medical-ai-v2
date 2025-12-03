import { createOpenAI } from '@ai-sdk/openai'

/**
 * OpenAI Provider (Optional - Legacy Support)
 * Only initialized if OPENAI_API_KEY is present
 */

// Lazy initialization - only fails when actually used
function getOpenAIInstance() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. ' +
      'OpenAI provider is optional and only needed for legacy support. ' +
      'The system now uses Google AI by default.'
    )
  }
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Export a proxy that initializes on first access
let _openaiInstance: ReturnType<typeof createOpenAI> | null = null

export const openai = new Proxy({} as ReturnType<typeof createOpenAI>, {
  get(target, prop) {
    if (!_openaiInstance) {
      _openaiInstance = getOpenAIInstance()
    }
    return (_openaiInstance as any)[prop]
  }
})

// Common model configurations (lazy getters)
export const openaiModels = {
  // GPT-4o - Flagship model for complex tasks
  get gpt4o() {
    return openai('gpt-4o')
  },

  // GPT-4o mini - Cost-effective alternative
  get gpt4oMini() {
    return openai('gpt-4o-mini')
  },

  // GPT-4 Turbo with Vision - For image analysis
  get gpt4Vision() {
    return openai('gpt-4-turbo')
  },

  // Embeddings models
  embeddings: {
    // text-embedding-3-small - Cost-effective, 1536 dimensions
    get small() {
      return openai.textEmbeddingModel('text-embedding-3-small')
    },

    // text-embedding-3-large - Higher quality, 3072 dimensions (can be reduced)
    get large() {
      return openai.textEmbeddingModel('text-embedding-3-large')
    },

    // ada-002 - Legacy, still good, 1536 dimensions
    get ada() {
      return openai.textEmbeddingModel('text-embedding-ada-002')
    },
  },
}

// Helper to get model by name
export function getOpenAIModel(modelName: string) {
  switch (modelName) {
    case 'gpt-4o':
      return openaiModels.gpt4o
    case 'gpt-4o-mini':
      return openaiModels.gpt4oMini
    case 'gpt-4-turbo':
    case 'gpt-4-vision':
      return openaiModels.gpt4Vision
    default:
      return openaiModels.gpt4oMini // default to mini
  }
}

// Helper to get embedding model
export function getEmbeddingModel(modelName?: string) {
  switch (modelName) {
    case 'text-embedding-3-large':
      return openaiModels.embeddings.large
    case 'text-embedding-ada-002':
      return openaiModels.embeddings.ada
    case 'text-embedding-3-small':
    default:
      return openaiModels.embeddings.small // default to small (cost-effective)
  }
}
