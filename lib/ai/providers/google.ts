import { createGoogleGenerativeAI } from '@ai-sdk/google'

// Lazy initialization - only fails when actually used, not at import time
function getGoogleInstance() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set')
  }
  return createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })
}

let _googleInstance: ReturnType<typeof createGoogleGenerativeAI> | null = null

function getGoogle() {
  if (!_googleInstance) {
    _googleInstance = getGoogleInstance()
  }
  return _googleInstance
}

// Export a proxy that initializes on first access
export const google = new Proxy({} as ReturnType<typeof createGoogleGenerativeAI>, {
  get(target, prop) {
    return (getGoogle() as any)[prop]
  },
  apply(target, thisArg, args) {
    return (getGoogle() as any)(...args)
  },
})

// Common model configurations (lazy getters to avoid initialization at import time)
export const googleModels = {
  // Gemini 3 Series (Latest generation)
  get 'gemini-3-pro-preview'() {
    return getGoogle()('gemini-3-pro-preview')
  },

  // Gemini 2.5 Series (Current stable generation)
  get 'gemini-2.5-flash'() {
    return getGoogle()('gemini-2.5-flash')
  },
  get 'gemini-2.5-flash-lite'() {
    return getGoogle()('gemini-2.5-flash-lite')
  },
  get 'gemini-2.5-pro'() {
    return getGoogle()('gemini-2.5-pro')
  },

  // Gemini 2.0 Series (Second generation)
  get 'gemini-2.0-flash'() {
    return getGoogle()('gemini-2.0-flash')
  },

  // Gemini 1.5 Series (First generation)
  get 'gemini-1.5-flash'() {
    return getGoogle()('gemini-1.5-flash')
  },
  get 'gemini-1.5-pro'() {
    return getGoogle()('gemini-1.5-pro')
  },

  // Aliases for convenience
  get flash() {
    return getGoogle()('gemini-2.5-flash')
  },
  get pro() {
    return getGoogle()('gemini-2.5-pro')
  },

  // Embedding model
  get embedding() {
    return getGoogle().textEmbeddingModel('gemini-embedding-001')
  },
}

// Safety settings to use when calling generateText/streamText
export const googleSafetySettings = [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
]

// Helper to get model by name
export function getGoogleModel(modelName: string) {
  // Direct lookup (supports all model names)
  if (modelName in googleModels) {
    return (googleModels as any)[modelName]
  }

  // Default fallback
  return googleModels['gemini-2.5-flash']
}
