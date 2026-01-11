/**
 * Protocol Update API
 * PATCH /api/admin/medical-knowledge/protocols/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { protocols } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if protocol exists
    const existing = await db.select().from(protocols).where(eq(protocols.id, id))

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Protocolo não encontrado' },
        { status: 404 }
      )
    }

    // Update protocol
    const [updated] = await db
      .update(protocols)
      .set({
        triggerCondition: body.triggerCondition,
        type: body.type,
        title: body.title,
        description: body.description,
        dosage: body.dosage || null,
        sourceRef: body.sourceRef || null,
      })
      .where(eq(protocols.id, id))
      .returning()

    console.log(`✅ [MEDICAL-KNOWLEDGE] Protocol updated: ${id}`)
    console.log(`   By: ${session.user.email}`)

    return NextResponse.json({
      success: true,
      protocol: updated,
      message: `Protocolo ${updated.title} atualizado com sucesso`,
    })
  } catch (error) {
    console.error('❌ [MEDICAL-KNOWLEDGE] Error updating protocol:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar protocolo',
      },
      { status: 500 }
    )
  }
}
