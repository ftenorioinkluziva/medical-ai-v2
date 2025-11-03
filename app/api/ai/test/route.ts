/**
 * AI Test API
 * For testing AI SDK integration
 */

import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openaiModels } from '@/lib/ai/providers'
import { generateEmbedding } from '@/lib/ai/core/embeddings'

export async function GET() {
  try {
    console.log('🧪 [AI-TEST] Starting AI SDK tests...')

    // Test 1: Simple text generation with OpenAI
    console.log('\n1️⃣ Testing text generation with OpenAI...')
    const textResult = await generateText({
      model: openaiModels.gpt4oMini,
      prompt: 'Explique em uma frase o que é hemoglobina glicada.',
      temperature: 0.5,
    })
    console.log('✅ Text generation:', textResult.text.substring(0, 100))

    // Test 2: Embeddings
    console.log('\n2️⃣ Testing embeddings...')
    const embeddingResult = await generateEmbedding(
      'hemoglobina glicada diabetes',
      { provider: 'openai' }
    )
    console.log(`✅ Embedding: ${embeddingResult.dimensions} dimensions (${embeddingResult.provider})`)

    console.log('\n✅ [AI-TEST] All tests passed!')

    return NextResponse.json({
      success: true,
      note: 'Using OpenAI (Google AI key is invalid)',
      tests: {
        textGeneration: {
          model: 'gpt-4o-mini',
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
