/**
 * API Key Management - Individual Key
 * Revoke or delete specific API keys
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { revokeApiKey, deleteApiKey } from '@/lib/api-keys/generate'

/**
 * PATCH /api/admin/api-keys/[id]
 * Revoke (deactivate) an API key
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const success = await revokeApiKey(id, session.user.id)

    if (!success) {
      return NextResponse.json(
        { error: 'API key não encontrada ou não pertence a você' },
        { status: 404 }
      )
    }

    console.log(`✅ [API-KEYS] API key revoked: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'API key revogada com sucesso',
    })
  } catch (error) {
    console.error('[API-KEYS] Revoke error:', error)
    return NextResponse.json(
      { error: 'Erro ao revogar API key' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/api-keys/[id]
 * Permanently delete an API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const success = await deleteApiKey(id, session.user.id)

    if (!success) {
      return NextResponse.json(
        { error: 'API key não encontrada ou não pertence a você' },
        { status: 404 }
      )
    }

    console.log(`✅ [API-KEYS] API key deleted: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'API key deletada com sucesso',
    })
  } catch (error) {
    console.error('[API-KEYS] Delete error:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar API key' },
      { status: 500 }
    )
  }
}
