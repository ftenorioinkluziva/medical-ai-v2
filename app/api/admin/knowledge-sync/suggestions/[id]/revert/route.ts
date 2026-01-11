/**
 * Knowledge Sync - Revert Suggestion API
 * Reverts an already applied suggestion (rollback)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { revertSuggestion } from '@/lib/ai/knowledge/applier'

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

    console.log(`⏪ [KNOWLEDGE-SYNC] Reverting suggestion: ${id}`)

    // Revert the suggestion
    const result = await revertSuggestion(id, session.user.id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Sugestão revertida com sucesso',
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-SYNC] Error reverting suggestion:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao reverter sugestão',
      },
      { status: 500 }
    )
  }
}
