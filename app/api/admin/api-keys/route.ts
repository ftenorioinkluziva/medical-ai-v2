/**
 * API Keys Management Endpoint
 * Create and list API keys for authenticated users
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createApiKey, listApiKeys } from '@/lib/api-keys/generate'

/**
 * GET /api/admin/api-keys
 * List all API keys for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Only admins can manage API keys
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem gerenciar API keys' }, { status: 403 })
    }

    const keys = await listApiKeys(session.user.id)

    return NextResponse.json({
      success: true,
      keys,
    })
  } catch (error) {
    console.error('[API-KEYS] List error:', error)
    return NextResponse.json(
      { error: 'Erro ao listar API keys' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/api-keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Only admins can create API keys
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem criar API keys' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, expiresInDays } = body

    // Calculate expiration date if provided
    let expiresAt: Date | undefined
    if (expiresInDays && typeof expiresInDays === 'number') {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    }

    console.log('🔑 [API-KEYS] Creating new API key...')
    console.log(`   User: ${session.user.email}`)
    console.log(`   Name: ${name || 'Unnamed'}`)

    const result = await createApiKey({
      userId: session.user.id,
      name,
      description,
      expiresAt,
    })

    console.log('✅ [API-KEYS] API key created successfully')
    console.log(`   ID: ${result.id}`)
    console.log(`   Prefix: ${result.keyPrefix}`)

    return NextResponse.json({
      success: true,
      apiKey: result.apiKey, // Only returned on creation!
      id: result.id,
      keyPrefix: result.keyPrefix,
      name: result.name,
      description: result.description,
      expiresAt: result.expiresAt,
      createdAt: result.createdAt,
      warning: 'Salve esta API key agora! Ela não será mostrada novamente.',
    })
  } catch (error) {
    console.error('[API-KEYS] Create error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar API key' },
      { status: 500 }
    )
  }
}
