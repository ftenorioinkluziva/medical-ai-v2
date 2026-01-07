/**
 * Schema Validation API
 * POST /api/admin/agents/validate-schema
 * Validates JSON Schema before saving to database
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { validateJsonSchema } from '@/lib/ai/core/schema-converter'

/**
 * POST /api/admin/agents/validate-schema
 * Validate JSON Schema structure and convertibility to Zod
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
    const { schema } = body

    if (!schema) {
      return NextResponse.json(
        { success: false, error: 'Schema é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`🔧 [VALIDATE-SCHEMA] Validating JSON Schema`)

    // Validate schema
    const result = validateJsonSchema(schema)

    if (!result.valid) {
      console.log(`❌ [VALIDATE-SCHEMA] Validation failed: ${result.error}`)
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: result.error,
        },
        { status: 400 }
      )
    }

    console.log(`✅ [VALIDATE-SCHEMA] Schema is valid`)

    return NextResponse.json({
      success: true,
      valid: true,
      message: 'Schema válido e convertível para Zod',
    })
  } catch (error) {
    console.error('❌ [VALIDATE-SCHEMA] Error:', error)

    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: error instanceof Error ? error.message : 'Erro ao validar schema',
      },
      { status: 500 }
    )
  }
}
