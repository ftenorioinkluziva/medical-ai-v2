/**
 * API para gerenciar protocolos
 * POST /api/admin/medical-knowledge/protocols
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { protocols } from '@/lib/db/schema'
import { auth } from '@/lib/auth/config'
import { sql } from 'drizzle-orm'

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
    if (!body.triggerCondition || !body.type || !body.title || !body.description) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: triggerCondition, type, title, description' },
        { status: 400 }
      )
    }

    // Criar novo protocolo
    const [newProtocol] = await db
      .insert(protocols)
      .values({
        triggerCondition: body.triggerCondition,
        type: body.type,
        title: body.title,
        description: body.description,
        dosage: body.dosage || null,
        sourceRef: body.sourceRef || null,
      })
      .returning()

    console.log(`✅ Novo protocolo criado: ${body.title}`)
    console.log(`   Por: ${session.user.email}`)
    console.log(`   Condição: ${body.triggerCondition}`)

    return NextResponse.json({
      success: true,
      protocol: newProtocol,
      message: `Protocolo ${newProtocol.title} criado com sucesso`,
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Erro ao criar protocolo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar protocolo' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build conditions
    const conditions = []

    if (search) {
      const searchPattern = `%${search}%`
      conditions.push(
        sql`(${protocols.title} ILIKE ${searchPattern} OR ${protocols.description} ILIKE ${searchPattern})`
      )
    }

    if (type) {
      conditions.push(sql`${protocols.type} = ${type}`)
    }

    // Fetch protocols
    const protocolsList = await db
      .select()
      .from(protocols)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
      .orderBy(protocols.type, protocols.title)
      .limit(limit)
      .offset(offset)

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(protocols)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)

    // Get unique types for filters
    const types = await db
      .selectDistinct({ type: protocols.type })
      .from(protocols)
      .where(sql`${protocols.type} IS NOT NULL`)
      .orderBy(protocols.type)

    return NextResponse.json({
      success: true,
      protocols: protocolsList,
      total: count,
      types: types.map(t => t.type).filter(Boolean),
      limit,
      offset,
    })
  } catch (error) {
    console.error('❌ Erro ao buscar protocolos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar protocolos' },
      { status: 500 }
    )
  }
}
