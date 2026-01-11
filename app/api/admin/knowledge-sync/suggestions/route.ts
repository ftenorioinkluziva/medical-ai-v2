/**
 * Knowledge Sync - Suggestions API
 * List and filter knowledge update suggestions
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { knowledgeUpdateSuggestions } from '@/lib/db/schema'
import { desc, eq, and, or, inArray, sql } from 'drizzle-orm'

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

    const { searchParams } = new URL(request.url)

    // Filters
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const targetType = searchParams.get('targetType')
    const suggestionType = searchParams.get('suggestionType')
    const isConflict = searchParams.get('isConflict')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('📋 [KNOWLEDGE-SYNC] Fetching suggestions with filters:', {
      status,
      priority,
      targetType,
      suggestionType,
      isConflict,
      limit,
      offset,
    })

    // Build where conditions
    const conditions = []

    if (status) {
      conditions.push(eq(knowledgeUpdateSuggestions.status, status))
    }

    if (priority) {
      conditions.push(eq(knowledgeUpdateSuggestions.priority, priority))
    }

    if (targetType) {
      conditions.push(eq(knowledgeUpdateSuggestions.targetType, targetType))
    }

    if (suggestionType) {
      conditions.push(eq(knowledgeUpdateSuggestions.suggestionType, suggestionType))
    }

    if (isConflict !== null) {
      const conflictValue = isConflict === 'true'
      conditions.push(eq(knowledgeUpdateSuggestions.isConflict, conflictValue))
    }

    // Fetch suggestions
    const suggestions = await db
      .select()
      .from(knowledgeUpdateSuggestions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        desc(knowledgeUpdateSuggestions.priority),
        desc(knowledgeUpdateSuggestions.createdAt)
      )
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(knowledgeUpdateSuggestions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    console.log(`✅ [KNOWLEDGE-SYNC] Found ${suggestions.length} suggestions (total: ${count})`)

    return NextResponse.json({
      success: true,
      suggestions,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-SYNC] Error fetching suggestions:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar sugestões',
      },
      { status: 500 }
    )
  }
}
