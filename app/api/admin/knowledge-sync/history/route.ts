/**
 * Knowledge Sync - History API
 * View audit log of all synchronization changes
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { syncAuditLog } from '@/lib/db/schema'
import { desc, eq, and, or, sql } from 'drizzle-orm'

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
    const action = searchParams.get('action')
    const targetType = searchParams.get('targetType')
    const targetSlug = searchParams.get('targetSlug')
    const performedBy = searchParams.get('performedBy')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('📜 [KNOWLEDGE-SYNC] Fetching audit history with filters:', {
      action,
      targetType,
      targetSlug,
      performedBy,
      limit,
      offset,
    })

    // Build where conditions
    const conditions = []

    if (action) {
      conditions.push(eq(syncAuditLog.action, action))
    }

    if (targetType) {
      conditions.push(eq(syncAuditLog.targetType, targetType))
    }

    if (targetSlug) {
      conditions.push(eq(syncAuditLog.targetSlug, targetSlug))
    }

    if (performedBy) {
      conditions.push(eq(syncAuditLog.performedBy, performedBy))
    }

    // Fetch audit logs
    const logs = await db
      .select()
      .from(syncAuditLog)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(syncAuditLog.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(syncAuditLog)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    console.log(`✅ [KNOWLEDGE-SYNC] Found ${logs.length} audit entries (total: ${count})`)

    return NextResponse.json({
      success: true,
      logs,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-SYNC] Error fetching audit history:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar histórico',
      },
      { status: 500 }
    )
  }
}
