/**
 * Knowledge Categories API
 * Get available knowledge categories with article counts
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getKnowledgeCategories } from '@/lib/ai/rag/agent-knowledge-filter'

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

    // Get categories with counts
    const categories = await getKnowledgeCategories()

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error('[ADMIN-API] Error fetching knowledge categories:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    )
  }
}
