/**
 * Calculated Metrics API Endpoint
 * GET /api/medical-knowledge/metrics
 * List all calculated metrics with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { calculatedMetrics } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    console.log('🧮 [METRICS-API] Fetching metrics', { slug })

    let metrics

    if (slug) {
      // Get specific metric
      metrics = await db
        .select()
        .from(calculatedMetrics)
        .where(eq(calculatedMetrics.slug, slug))
        .limit(1)
    } else {
      // Get all metrics
      metrics = await db
        .select()
        .from(calculatedMetrics)
        .orderBy(calculatedMetrics.name)
    }

    console.log(`✅ [METRICS-API] Retrieved ${metrics.length} metrics`)

    return NextResponse.json({
      success: true,
      metrics,
      count: metrics.length,
    })
  } catch (error) {
    console.error('❌ [METRICS-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
