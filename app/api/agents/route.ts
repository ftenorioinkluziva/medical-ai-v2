/**
 * Public Health Agents API
 * Returns agents that participate in complete analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { and, eq, ne } from 'drizzle-orm'

/**
 * GET /api/agents
 * List active health agents that participate in complete analysis
 * Public endpoint - no admin required
 */
export async function GET(request: NextRequest) {
  try {
    console.log(`🔧 [AGENTS-API] Fetching active agents for complete analysis`)

    // Get all active agents that participate in complete analysis
    const allAgents = await db
      .select({
        id: healthAgents.id,
        agentKey: healthAgents.agentKey,
        name: healthAgents.name,
        title: healthAgents.title,
        description: healthAgents.description,
        color: healthAgents.color,
        icon: healthAgents.icon,
        analysisRole: healthAgents.analysisRole,
        analysisOrder: healthAgents.analysisOrder,
        displayOrder: healthAgents.displayOrder,
        isActive: healthAgents.isActive,
        modelName: healthAgents.modelName,
      })
      .from(healthAgents)
      .where(eq(healthAgents.isActive, true))

    // Sort agents: foundation first, then specialized, then others.
    // Within each role group, sort by analysisOrder.
    const roleOrderValue = (role: string) => {
      if (role === 'foundation') return 1
      if (role === 'specialized') return 2
      return 99 // Other roles (like 'none') go to the end
    }

    const agents = allAgents.sort((a, b) => {
      const roleCompare =
        roleOrderValue(a.analysisRole) - roleOrderValue(b.analysisRole)
      if (roleCompare !== 0) {
        return roleCompare
      }
      // Within the same role, sort by analysisOrder
      return (a.analysisOrder || 0) - (b.analysisOrder || 0)
    })

    console.log(`✅ [AGENTS-API] Found ${agents.length} active agents`)

    return NextResponse.json({
      success: true,
      agents,
      total: agents.length,
    })
  } catch (error) {
    console.error('❌ [AGENTS-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar agentes',
      },
      { status: 500 }
    )
  }
}
