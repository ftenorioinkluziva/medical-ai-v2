/**
 * Analyses API
 * List all analyses for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { analyses, healthAgents } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

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

    console.log(`📋 [ANALYSES-API] Fetching analyses for user: ${session.user.id}`)

    // Get all analyses with agent info
    const userAnalyses = await db
      .select({
        id: analyses.id,
        agentId: analyses.agentId,
        analysis: analyses.analysis,
        prompt: analyses.prompt,
        createdAt: analyses.createdAt,
        modelUsed: analyses.modelUsed,
        tokensUsed: analyses.tokensUsed,
        processingTimeMs: analyses.processingTimeMs,
        ragUsed: analyses.ragUsed,
        documentIds: analyses.documentIds,
        agentName: healthAgents.name,
        agentTitle: healthAgents.title,
        agentColor: healthAgents.color,
        agentKey: healthAgents.agentKey,
      })
      .from(analyses)
      .leftJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
      .where(eq(analyses.userId, session.user.id))
      .orderBy(desc(analyses.createdAt))

    console.log(`✅ [ANALYSES-API] Found ${userAnalyses.length} analyses`)

    return NextResponse.json({
      success: true,
      analyses: userAnalyses,
      total: userAnalyses.length,
    })
  } catch (error) {
    console.error('❌ [ANALYSES-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
