/**
 * Metric Update API
 * PATCH /api/admin/medical-knowledge/metrics/[slug]
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { calculatedMetrics } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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

    const { slug } = await params
    const body = await request.json()

    // Check if metric exists
    const existing = await db
      .select()
      .from(calculatedMetrics)
      .where(eq(calculatedMetrics.slug, slug))

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Métrica não encontrada' },
        { status: 404 }
      )
    }

    // Update metric
    const [updated] = await db
      .update(calculatedMetrics)
      .set({
        name: body.name,
        formula: body.formula,
        targetMin: body.targetMin || null,
        targetMax: body.targetMax || null,
        riskInsight: body.riskInsight || null,
        sourceRef: body.sourceRef || null,
      })
      .where(eq(calculatedMetrics.slug, slug))
      .returning()

    console.log(`✅ [MEDICAL-KNOWLEDGE] Metric updated: ${slug}`)
    console.log(`   By: ${session.user.email}`)

    return NextResponse.json({
      success: true,
      metric: updated,
      message: `Métrica ${updated.name} atualizada com sucesso`,
    })
  } catch (error) {
    console.error('❌ [MEDICAL-KNOWLEDGE] Error updating metric:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar métrica',
      },
      { status: 500 }
    )
  }
}
