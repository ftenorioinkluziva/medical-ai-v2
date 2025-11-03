import { createOpenAI } from '@ai-sdk/openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set')
}

// Initialize OpenAI provider
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Common model configurations
export const openaiModels = {
  // GPT-4o - Flagship model for complex tasks
  gpt4o: openai('gpt-4o'),

  // GPT-4o mini - Cost-effective alternative
  gpt4oMini: openai('gpt-4o-mini'),

  // GPT-4 Turbo with Vision - For image analysis
  gpt4Vision: openai('gpt-4-turbo'),

  // Embeddings models
  embeddings: {
    // text-embedding-3-small - Cost-effective, 1536 dimensions
    small: openai.textEmbeddingModel('text-embedding-3-small'),

    // text-embedding-3-large - Higher quality, 3072 dimensions (can be reduced)
    large: openai.textEmbeddingModel('text-embedding-3-large'),

    // ada-002 - Legacy, still good, 1536 dimensions
    ada: openai.textEmbeddingModel('text-embedding-ada-002'),
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
