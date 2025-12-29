/**
 * Knowledge Subcategories API
 * Get available knowledge subcategories with article counts
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getKnowledgeSubcategories } from '@/lib/ai/rag/agent-knowledge-filter'

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

    // Get subcategories with counts
    const subcategories = await getKnowledgeSubcategories()

    return NextResponse.json({
      success: true,
      subcategories,
    })
  } catch (error) {
    console.error('[ADMIN-API] Error fetching knowledge subcategories:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar subcategorias' },
      { status: 500 }
    )
  }
}
