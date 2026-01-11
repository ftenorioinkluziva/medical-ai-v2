/**
 * Knowledge Sync - Modify Suggestion API
 * Modifies a suggestion's values before applying
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { knowledgeUpdateSuggestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { suggestedData, notes } = body

    if (!suggestedData) {
      return NextResponse.json(
        { success: false, error: 'Dados sugeridos não fornecidos' },
        { status: 400 }
      )
    }

    console.log(`✏️ [KNOWLEDGE-SYNC] Modifying suggestion: ${id}`)

    // Update suggestion with modified data
    const result = await db
      .update(knowledgeUpdateSuggestions)
      .set({
        suggestedData,
        status: 'modified',
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        reviewNotes: notes || 'Valores modificados pelo administrador',
        updatedAt: new Date(),
      })
      .where(eq(knowledgeUpdateSuggestions.id, id))
      .returning()

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sugestão não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Sugestão modificada com sucesso',
      suggestion: result[0],
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-SYNC] Error modifying suggestion:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao modificar sugestão',
      },
      { status: 500 }
    )
  }
}
