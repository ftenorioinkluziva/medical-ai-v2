/**
 * Admin Health Agent Individual API
 * GET, UPDATE, DELETE operations for specific agent
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/admin/agents/[id]
 * Get specific health agent
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    const [agent] = await db
      .select()
      .from(healthAgents)
      .where(eq(healthAgents.id, id))
      .limit(1)

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      agent,
    })
  } catch (error) {
    console.error('❌ [ADMIN-AGENT-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/agents/[id]
 * Update health agent
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const body = await request.json()

    console.log(`🔧 [ADMIN-AGENT-API] Updating agent: ${id}`)

    // Update only provided fields
    const updateData: any = {}

    if (body.agentKey !== undefined) updateData.agentKey = body.agentKey
    if (body.name !== undefined) updateData.name = body.name
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.color !== undefined) updateData.color = body.color
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.systemPrompt !== undefined) updateData.systemPrompt = body.systemPrompt
    if (body.analysisPrompt !== undefined) updateData.analysisPrompt = body.analysisPrompt
    if (body.modelName !== undefined) updateData.modelName = body.modelName
    if (body.modelConfig !== undefined) updateData.modelConfig = body.modelConfig
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.requiresApproval !== undefined) updateData.requiresApproval = body.requiresApproval
    if (body.tags !== undefined) updateData.tags = body.tags

    updateData.updatedAt = new Date()

    const [updatedAgent] = await db
      .update(healthAgents)
      .set(updateData)
      .where(eq(healthAgents.id, id))
      .returning()

    if (!updatedAgent) {
      return NextResponse.json(
        { success: false, error: 'Agente não encontrado' },
        { status: 404 }
      )
    }

    console.log(`✅ [ADMIN-AGENT-API] Agent updated: ${id}`)

    return NextResponse.json({
      success: true,
      agent: updatedAgent,
      message: 'Agente atualizado com sucesso',
    })
  } catch (error) {
    console.error('❌ [ADMIN-AGENT-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar agente',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/agents/[id]
 * Delete health agent
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    console.log(`🔧 [ADMIN-AGENT-API] Deleting agent: ${id}`)

    const [deletedAgent] = await db
      .delete(healthAgents)
      .where(eq(healthAgents.id, id))
      .returning()

    if (!deletedAgent) {
      return NextResponse.json(
        { success: false, error: 'Agente não encontrado' },
        { status: 404 }
      )
    }

    console.log(`✅ [ADMIN-AGENT-API] Agent deleted: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Agente deletado com sucesso',
    })
  } catch (error) {
    console.error('❌ [ADMIN-AGENT-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao deletar agente',
      },
      { status: 500 }
    )
  }
}
