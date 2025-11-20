/**
 * Biomarker Details API Endpoint
 * GET /api/medical-knowledge/biomarkers/[slug]
 * Get detailed information about a specific biomarker
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { biomarkersReference } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    console.log(`🔍 [BIOMARKER-DETAIL-API] Fetching biomarker: ${slug}`)

    const [biomarker] = await db
      .select()
      .from(biomarkersReference)
      .where(eq(biomarkersReference.slug, slug))
      .limit(1)

    if (!biomarker) {
      console.log(`❌ [BIOMARKER-DETAIL-API] Biomarker not found: ${slug}`)
      return NextResponse.json(
        {
          success: false,
          error: 'Biomarcador não encontrado',
        },
        { status: 404 }
      )
    }

    console.log(`✅ [BIOMARKER-DETAIL-API] Biomarker found: ${biomarker.name}`)

    return NextResponse.json({
      success: true,
      biomarker,
    })
  } catch (error) {
    console.error('❌ [BIOMARKER-DETAIL-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
