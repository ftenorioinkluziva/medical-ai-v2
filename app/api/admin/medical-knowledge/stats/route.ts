/**
 * Medical Knowledge Stats API
 * Get statistics about Cérebro Lógico content
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { biomarkersReference, calculatedMetrics, protocols } from '@/lib/db/schema'
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

    // Get counts
    const [{ biomarkersCount }] = await db
      .select({ biomarkersCount: sql<number>`count(*)::int` })
      .from(biomarkersReference)

    const [{ metricsCount }] = await db
      .select({ metricsCount: sql<number>`count(*)::int` })
      .from(calculatedMetrics)

    const [{ protocolsCount }] = await db
      .select({ protocolsCount: sql<number>`count(*)::int` })
      .from(protocols)

    // Get synced biomarkers count
    const [{ syncedCount }] = await db
      .select({ syncedCount: sql<number>`count(*)::int` })
      .from(biomarkersReference)
      .where(sql`${biomarkersReference.lastSyncedFrom} IS NOT NULL`)

    return NextResponse.json({
      success: true,
      stats: {
        biomarkers: biomarkersCount,
        metrics: metricsCount,
        protocols: protocolsCount,
        syncedBiomarkers: syncedCount,
        syncCoverage: biomarkersCount > 0
          ? Math.round((syncedCount / biomarkersCount) * 100)
          : 0,
      },
    })
  } catch (error) {
    console.error('❌ [MEDICAL-KNOWLEDGE] Error fetching stats:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas',
      },
      { status: 500 }
    )
  }
}
