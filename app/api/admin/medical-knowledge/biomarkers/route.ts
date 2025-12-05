/**
 * API para criar novos biomarcadores
 * POST /api/admin/medical-knowledge/biomarkers
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { biomarkersReference } from '@/lib/db/schema'
import { auth } from '@/lib/auth/config'

export async function POST(request: NextRequest) {
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

    // Validar campos obrigatórios
    if (!body.slug || !body.name) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: slug, name' },
        { status: 400 }
      )
    }

    // Criar novo biomarcador
    const [newBiomarker] = await db
      .insert(biomarkersReference)
      .values({
        slug: body.slug,
        name: body.name,
        category: body.category || null,
        unit: body.unit || null,
        optimalMin: body.optimalMin || null,
        optimalMax: body.optimalMax || null,
        labMin: body.labMin || null,
        labMax: body.labMax || null,
        clinicalInsight: body.clinicalInsight || null,
        metaphor: body.metaphor || null,
        sourceRef: body.sourceRef || null,
        updatedAt: new Date(),
      })
      .returning()

    console.log(`✅ Novo biomarcador criado: ${body.slug}`)
    console.log(`   Por: ${session.user.email}`)

    return NextResponse.json({
      success: true,
      biomarker: newBiomarker,
      message: `Biomarcador ${newBiomarker.name} criado com sucesso`,
    }, { status: 201 })
  } catch (error: any) {
    console.error('❌ Erro ao criar biomarcador:', error)

    // Erro de chave duplicada
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Biomarcador com este slug já existe' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar biomarcador' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const biomarkers = await db
      .select()
      .from(biomarkersReference)
      .orderBy(biomarkersReference.category, biomarkersReference.name)

    return NextResponse.json({ biomarkers })
  } catch (error) {
    console.error('❌ Erro ao buscar biomarcadores:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar biomarcadores' },
      { status: 500 }
    )
  }
}
