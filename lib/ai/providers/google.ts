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
  // Gemini 2.5 Flash - Fast, cost-effective (default for most agents)
  flash: google('gemini-2.5-flash'),

  // Gemini 2.5 Pro - More capable, for complex analyses
  pro: google('gemini-2.5-pro'),

  // Embedding model
  embedding: google.textEmbeddingModel('text-embedding-004'),
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
  switch (modelName) {
    case 'gemini-2.5-flash':
      return googleModels.flash
    case 'gemini-2.5-pro':
      return googleModels.pro
    default:
      return googleModels.flash // default to flash
  }
}
