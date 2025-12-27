/**
 * Metric Details API Endpoint
 * GET /api/medical-knowledge/metrics/[slug]
 * Get detailed information about a specific calculated metric
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { calculatedMetrics } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    console.log(`🔍 [METRIC-DETAIL-API] Fetching metric: ${slug}`)

    const [metric] = await db
      .select()
      .from(calculatedMetrics)
      .where(eq(calculatedMetrics.slug, slug))
      .limit(1)

    if (!metric) {
      console.log(`❌ [METRIC-DETAIL-API] Metric not found: ${slug}`)
      return NextResponse.json(
        {
          success: false,
          error: 'Métrica não encontrada',
        },
        { status: 404 }
      )
    }

    console.log(`✅ [METRIC-DETAIL-API] Metric found: ${metric.name}`)

    return NextResponse.json({
      success: true,
      metric,
    })
  } catch (error) {
    console.error('❌ [METRIC-DETAIL-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
