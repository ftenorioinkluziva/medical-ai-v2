import { createGoogleGenerativeAI } from '@ai-sdk/google'

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set')
}

// Initialize Google AI provider
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

// Common model configurations
export const googleModels = {
  // Gemini 3 Series (Latest generation)
  'gemini-3-pro-preview': google('gemini-3-pro-preview'),

  // Gemini 2.5 Series (Current stable generation)
  'gemini-2.5-flash': google('gemini-2.5-flash'),
  'gemini-2.5-flash-lite': google('gemini-2.5-flash-lite'),
  'gemini-2.5-pro': google('gemini-2.5-pro'),

  // Gemini 2.0 Series (Second generation)
  'gemini-2.0-flash': google('gemini-2.0-flash'),

  // Gemini 1.5 Series (First generation)
  'gemini-1.5-flash': google('gemini-1.5-flash'),
  'gemini-1.5-pro': google('gemini-1.5-pro'),

  // Aliases for convenience
  flash: google('gemini-2.5-flash'),
  pro: google('gemini-2.5-pro'),

  // Embedding model
  embedding: google.textEmbeddingModel('gemini-embedding-001'),
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
