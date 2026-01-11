/**
 * Calculated Metrics API
 * List and search calculated metrics from Cérebro Lógico
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { calculatedMetrics } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

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
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build conditions
    const conditions = []

    if (search) {
      const searchPattern = `%${search}%`
      conditions.push(
        sql`(${calculatedMetrics.name} ILIKE ${searchPattern} OR ${calculatedMetrics.slug} ILIKE ${searchPattern})`
      )
    }

    // Fetch metrics
    const metrics = await db
      .select()
      .from(calculatedMetrics)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
      .orderBy(calculatedMetrics.name)
      .limit(limit)
      .offset(offset)

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(calculatedMetrics)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)

    return NextResponse.json({
      success: true,
      metrics,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('❌ [MEDICAL-KNOWLEDGE] Error fetching metrics:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar métricas',
      },
      { status: 500 }
    )
  }
}
