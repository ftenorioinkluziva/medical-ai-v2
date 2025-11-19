/**
 * Analysis History API
 * Fetch user's analysis history
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { analyses, healthAgents } from '@/lib/db/schema'
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm'

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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const agentId = searchParams.get('agentId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Support patientId for doctors
    const userId = patientId && session.user.role === 'doctor' ? patientId : session.user.id

    console.log(`📜 [HISTORY-API] Fetching analyses for user: ${userId}${patientId ? ' (doctor view)' : ''}`)

    // Build query conditions
    const conditions: any[] = [eq(analyses.userId, userId)]

    if (agentId) {
      conditions.push(eq(analyses.agentId, agentId))
    }

    if (startDate) {
      conditions.push(gte(analyses.createdAt, new Date(startDate)))
    }

    if (endDate) {
      conditions.push(lte(analyses.createdAt, new Date(endDate)))
    }

    // Fetch analyses with agent info
    const userAnalyses = await db
      .select({
        id: analyses.id,
        agentId: analyses.agentId,
        agentName: healthAgents.name,
        agentKey: healthAgents.agentKey,
        prompt: analyses.prompt,
        analysis: analyses.analysis,
        modelUsed: analyses.modelUsed,
        tokensUsed: analyses.tokensUsed,
        processingTimeMs: analyses.processingTimeMs,
        ragUsed: analyses.ragUsed,
        documentIds: analyses.documentIds,
        createdAt: analyses.createdAt,
      })
      .from(analyses)
      .leftJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
      .where(and(...conditions))
      .orderBy(desc(analyses.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analyses)
      .where(and(...conditions))

    console.log(`✅ [HISTORY-API] Found ${userAnalyses.length} analyses (total: ${count})`)

    return NextResponse.json({
      success: true,
      analyses: userAnalyses,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('❌ [HISTORY-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
