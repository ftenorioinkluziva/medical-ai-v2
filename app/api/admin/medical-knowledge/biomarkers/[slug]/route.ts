/**
 * API para atualizar biomarcadores específicos
 * PATCH /api/admin/medical-knowledge/biomarkers/[slug]
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { biomarkersReference } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Verificar autenticação e autorização
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { slug } = params

    // Validar campos
    const allowedFields = [
      'name',
      'category',
      'unit',
      'optimalMin',
      'optimalMax',
      'labMin',
      'labMax',
      'clinicalInsight',
      'metaphor',
      'sourceRef',
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // Adicionar timestamp de atualização
    updateData.updatedAt = new Date()

    // Atualizar no banco
    const [updated] = await db
      .update(biomarkersReference)
      .set(updateData)
      .where(eq(biomarkersReference.slug, slug))
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: 'Biomarcador não encontrado' },
        { status: 404 }
      )
    }

    console.log(`✅ Biomarcador atualizado: ${slug}`)
    console.log(`   Por: ${session.user.email}`)
    console.log(`   Campos: ${Object.keys(updateData).join(', ')}`)

    return NextResponse.json({
      success: true,
      biomarker: updated,
      message: `Biomarcador ${updated.name} atualizado com sucesso`,
    })
  } catch (error) {
    console.error('❌ Erro ao atualizar biomarcador:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar biomarcador' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const [biomarker] = await db
      .select()
      .from(biomarkersReference)
      .where(eq(biomarkersReference.slug, slug))
      .limit(1)

    if (!biomarker) {
      return NextResponse.json(
        { error: 'Biomarcador não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ biomarker })
  } catch (error) {
    console.error('❌ Erro ao buscar biomarcador:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar biomarcador' },
      { status: 500 }
    )
  }
}
