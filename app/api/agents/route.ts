/**
 * Health Agents API
 * List available health agents
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

/**
 * GET /api/agents
 * List all available health agents for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userRole = session.user.role || 'patient'

    // Get all active agents that the user has permission to access
    const agents = await db
      .select({
        id: healthAgents.id,
        agentKey: healthAgents.agentKey,
        name: healthAgents.name,
        title: healthAgents.title,
        description: healthAgents.description,
        color: healthAgents.color,
        icon: healthAgents.icon,
        modelName: healthAgents.modelName,
        allowedRoles: healthAgents.allowedRoles,
        isActive: healthAgents.isActive,
        createdAt: healthAgents.createdAt,
      })
      .from(healthAgents)
      .where(eq(healthAgents.isActive, true))

    // Filter agents based on user role
    const availableAgents = agents.filter(agent =>
      agent.allowedRoles.includes(userRole)
    )

    console.log(`✅ [AGENTS-API] Listed ${availableAgents.length} agents for role: ${userRole}`)

    return NextResponse.json({
      success: true,
      agents: availableAgents,
      userRole,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ [AGENTS-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
