/**
 * Knowledge Authors API
 * Get available knowledge authors with article counts
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getKnowledgeAuthors } from '@/lib/ai/rag/agent-knowledge-filter'

export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Get authors with counts
    const authors = await getKnowledgeAuthors()

    return NextResponse.json({
      success: true,
      authors,
    })
  } catch (error) {
    console.error('[ADMIN-API] Error fetching knowledge authors:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar autores' },
      { status: 500 }
    )
  }
}
