/**
 * Knowledge Sync - Approve Suggestion API
 * Approves and applies a suggestion to the Cérebro Lógico
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { applySuggestion } from '@/lib/ai/knowledge/applier'

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

    console.log(`✅ [KNOWLEDGE-SYNC] Approving and applying suggestion: ${id}`)

    // Apply the suggestion
    const result = await applySuggestion(id, session.user.id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Sugestão aprovada e aplicada com sucesso',
      changes: result.changes,
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-SYNC] Error approving suggestion:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao aprovar sugestão',
      },
      { status: 500 }
    )
  }
}
