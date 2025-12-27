/**
 * AI Test API
 * For testing AI SDK integration with Google AI (Gemini)
 */

import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { googleModels } from '@/lib/ai/providers'
import { generateEmbedding } from '@/lib/ai/core/embeddings'

export async function GET() {
  try {
    console.log('🧪 [AI-TEST] Starting AI SDK tests with Google AI...')

    // Test 1: Simple text generation with Gemini
    console.log('\n1️⃣ Testing text generation with Gemini 2.5 Flash...')
    const textResult = await generateText({
      model: googleModels.flash,
      prompt: 'Explique em uma frase o que é hemoglobina glicada.',
      temperature: 0.5,
    })
    console.log('✅ Text generation:', textResult.text.substring(0, 100))

    // Test 2: Embeddings with Google
    console.log('\n2️⃣ Testing embeddings with Google text-embedding-004...')
    const embeddingResult = await generateEmbedding(
      'hemoglobina glicada diabetes',
      { provider: 'google' }
    )
    console.log(`✅ Embedding: ${embeddingResult.dimensions} dimensions (${embeddingResult.provider})`)

    console.log('\n✅ [AI-TEST] All tests passed!')

    return NextResponse.json({
      success: true,
      note: 'Using Google AI (Gemini)',
      tests: {
        textGeneration: {
          model: 'gemini-2.5-flash',
          text: textResult.text,
          usage: textResult.usage,
        },
        embeddings: {
          provider: embeddingResult.provider,
          model: embeddingResult.model,
          dimensions: embeddingResult.dimensions,
          usage: embeddingResult.usage,
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ [AI-TEST] Test failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      },
      { status: 500 }
    )
  }
}
