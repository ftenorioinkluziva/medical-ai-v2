/**
 * Knowledge Base Stats API
 * Get statistics about the knowledge base
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getKnowledgeStats } from '@/lib/ai/knowledge'

export async function GET(request: NextRequest) {
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

    console.log('📊 [KNOWLEDGE-STATS] Fetching knowledge base statistics...')

    const stats = await getKnowledgeStats()

    console.log(`✅ [KNOWLEDGE-STATS] Stats retrieved:`, stats)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-STATS] Error fetching stats:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas',
      },
      { status: 500 }
    )
  }
}
