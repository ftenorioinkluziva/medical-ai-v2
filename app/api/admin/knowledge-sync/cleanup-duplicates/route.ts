/**
 * Knowledge Sync - Cleanup Duplicates API
 * Remove sugestões duplicadas mantendo apenas a mais antiga de cada grupo
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { knowledgeUpdateSuggestions } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
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

    console.log('🧹 [KNOWLEDGE-SYNC] Starting duplicate cleanup...')

    // Buscar todas as sugestões pendentes
    const pendingSuggestions = await db
      .select()
      .from(knowledgeUpdateSuggestions)
      .where(eq(knowledgeUpdateSuggestions.status, 'pending'))
      .orderBy(knowledgeUpdateSuggestions.createdAt)

    console.log(`📊 [KNOWLEDGE-SYNC] Found ${pendingSuggestions.length} pending suggestions`)

    // Agrupar por target_type:target_slug
    const groups = new Map<string, any[]>()

    for (const suggestion of pendingSuggestions) {
      const key = `${suggestion.targetType}:${suggestion.targetSlug}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(suggestion)
    }

    // Identificar duplicatas (grupos com mais de 1 item)
    const duplicateGroups = Array.from(groups.entries()).filter(([_, items]) => items.length > 1)

    if (duplicateGroups.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhuma duplicata encontrada',
        removed: 0,
        kept: pendingSuggestions.length,
      })
    }

    console.log(`🔍 [KNOWLEDGE-SYNC] Found ${duplicateGroups.length} groups with duplicates`)

    // Remover duplicatas (manter a mais antiga de cada grupo)
    let removedCount = 0

    for (const [key, items] of duplicateGroups) {
      // Manter a primeira (mais antiga), remover as demais
      const [keep, ...remove] = items

      console.log(
        `🗑️  [KNOWLEDGE-SYNC] ${key}: keeping ${keep.id}, removing ${remove.length} duplicates`
      )

      for (const duplicate of remove) {
        await db
          .delete(knowledgeUpdateSuggestions)
          .where(eq(knowledgeUpdateSuggestions.id, duplicate.id))

        removedCount++
      }
    }

    console.log(`✅ [KNOWLEDGE-SYNC] Cleanup complete: removed ${removedCount} duplicates`)

    return NextResponse.json({
      success: true,
      message: `${removedCount} duplicatas removidas com sucesso`,
      removed: removedCount,
      kept: pendingSuggestions.length - removedCount,
      groups: duplicateGroups.length,
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-SYNC] Error cleaning up duplicates:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao limpar duplicatas',
      },
      { status: 500 }
    )
  }
}
