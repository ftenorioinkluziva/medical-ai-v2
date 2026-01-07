/**
 * Test Generator API
 * POST /api/admin/agents/test-generator
 * Tests a product generator execution with sample input
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { executeGenerator, loadGenerator } from '@/lib/ai/core/dynamic-generator'

/**
 * POST /api/admin/agents/test-generator
 * Test generator execution with sample analysis text
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and check admin role
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { generatorKey, sampleInput } = body

    // Validation
    if (!generatorKey) {
      return NextResponse.json(
        { success: false, error: 'generatorKey é obrigatório' },
        { status: 400 }
      )
    }

    if (!sampleInput || typeof sampleInput !== 'string') {
      return NextResponse.json(
        { success: false, error: 'sampleInput é obrigatório e deve ser uma string' },
        { status: 400 }
      )
    }

    console.log(`🔧 [TEST-GENERATOR] Testing generator: ${generatorKey}`)

    // Load generator from database
    const generator = await loadGenerator(generatorKey)

    if (!generator) {
      return NextResponse.json(
        { success: false, error: `Gerador não encontrado: ${generatorKey}` },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!generator.outputSchema) {
      return NextResponse.json(
        { success: false, error: 'Gerador não possui outputSchema configurado' },
        { status: 400 }
      )
    }

    if (!generator.productType) {
      return NextResponse.json(
        { success: false, error: 'Gerador não possui productType configurado' },
        { status: 400 }
      )
    }

    console.log(`🚀 [TEST-GENERATOR] Executing generator with sample input...`)

    // Execute generator
    const startTime = Date.now()
    const result = await executeGenerator(generator, sampleInput)
    const executionTime = Date.now() - startTime

    console.log(`✅ [TEST-GENERATOR] Generator executed successfully in ${executionTime}ms`)
    console.log(`   Tokens used: ${result.usage.totalTokens} (${result.usage.promptTokens} prompt + ${result.usage.completionTokens} completion)`)

    return NextResponse.json({
      success: true,
      result: {
        generatorKey: result.generatorKey,
        productType: result.productType,
        output: result.object,
        usage: result.usage,
        executionTimeMs: executionTime,
        modelUsed: result.modelUsed,
      },
      message: 'Gerador testado com sucesso',
    })
  } catch (error) {
    console.error('❌ [TEST-GENERATOR] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao testar gerador',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
