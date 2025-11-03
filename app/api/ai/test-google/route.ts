/**
 * Google AI Test API
 * Test Google AI / Gemini integration
 */

import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { googleModels } from '@/lib/ai/providers'
import { generateEmbedding } from '@/lib/ai/core/embeddings'

export async function GET() {
  try {
    console.log('🧪 [GOOGLE-TEST] Starting Google AI tests...')

    // Test 1: Gemini 2.5 Flash text generation
    console.log('\n1️⃣ Testing Gemini 2.5 Flash...')
    const textResult = await generateText({
      model: googleModels.flash,
      prompt: 'Explique em uma frase o que é hemoglobina glicada.',
      temperature: 0.5,
    })
    console.log('✅ Gemini Flash:', textResult.text.substring(0, 100))

    // Test 2: Google embeddings
    console.log('\n2️⃣ Testing Google embeddings...')
    const embeddingResult = await generateEmbedding(
      'hemoglobina glicada diabetes',
      { provider: 'google' }
    )
    console.log(`✅ Google Embedding: ${embeddingResult.dimensions} dimensions`)

    console.log('\n✅ [GOOGLE-TEST] All tests passed!')

    return NextResponse.json({
      success: true,
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
    console.error('❌ [GOOGLE-TEST] Test failed:', error)

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
