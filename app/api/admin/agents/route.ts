/**
 * Admin Health Agents API
 * CRUD operations for health agents management
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

/**
 * GET /api/admin/agents
 * List all health agents
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and check admin role
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    console.log(`🔧 [ADMIN-AGENTS-API] Listing all health agents`)

    // Get all agents
    const agents = await db
      .select()
      .from(healthAgents)
      .orderBy(desc(healthAgents.createdAt))

    console.log(`✅ [ADMIN-AGENTS-API] Found ${agents.length} agents`)

    return NextResponse.json({
      success: true,
      agents,
      total: agents.length,
    })
  } catch (error) {
    console.error('❌ [ADMIN-AGENTS-API] Error:', error)

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
 * POST /api/admin/agents
 * Create a new health agent
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and check admin role
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      agentKey,
      name,
      title,
      description,
      color,
      icon,
      systemPrompt,
      analysisPrompt,
      modelName,
      modelConfig,
      useThinkingMode,
      analysisRole,
      analysisOrder,
      allowedRoles,
      displayOrder,
      isActive,
      requiresApproval,
      tags,
      knowledgeAccessType,
      allowedAuthors,
      allowedCategories,
      allowedSubcategories,
      excludedArticleIds,
      includedArticleIds,
    } = body

    // Validate required fields
    if (!agentKey || !name || !title || !description || !systemPrompt || !analysisPrompt) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Validate allowedRoles
    if (!allowedRoles || !Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'O campo "allowedRoles" é obrigatório e deve conter pelo menos uma função.' },
        { status: 400 }
      )
    }

    console.log(`🔧 [ADMIN-AGENTS-API] Creating new agent: ${agentKey}`)

    // Create agent
    const [newAgent] = await db
      .insert(healthAgents)
      .values({
        agentKey,
        name,
        title,
        description,
        color: color || 'blue',
        icon: icon || 'bot',
        systemPrompt,
        analysisPrompt,
        modelName: modelName || 'gemini-2.5-flash',
        modelConfig: modelConfig || {
          temperature: 0.7,
          maxOutputTokens: 8000,
        },
        useThinkingMode: useThinkingMode !== undefined ? useThinkingMode : false,
        analysisRole: analysisRole || 'none',
        analysisOrder: analysisOrder !== undefined ? analysisOrder : null,
        allowedRoles: allowedRoles,
        displayOrder: displayOrder !== undefined ? displayOrder : 0,
        isActive: isActive !== undefined ? isActive : true,
        requiresApproval: requiresApproval || false,
        tags: tags || [],
        knowledgeAccessType: knowledgeAccessType || 'full',
        allowedAuthors: allowedAuthors || [],
        allowedCategories: allowedCategories || [],
        allowedSubcategories: allowedSubcategories || [],
        excludedArticleIds: excludedArticleIds || [],
        includedArticleIds: includedArticleIds || [],
      })
      .returning()

    console.log(`✅ [ADMIN-AGENTS-API] Agent created: ${newAgent.id}`)

    return NextResponse.json({
      success: true,
      agent: newAgent,
      message: 'Agente criado com sucesso',
    })
  } catch (error) {
    console.error('❌ [ADMIN-AGENTS-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar agente',
      },
      { status: 500 }
    )
  }
}
