/**
 * Biomarkers API Endpoint
 * GET /api/medical-knowledge/biomarkers
 * List all biomarkers with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { biomarkersReference } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const slug = searchParams.get('slug')

    console.log('📊 [BIOMARKERS-API] Fetching biomarkers', { category, slug })

    let biomarkers

    if (slug) {
      // Get specific biomarker
      biomarkers = await db
        .select()
        .from(biomarkersReference)
        .where(eq(biomarkersReference.slug, slug))
        .limit(1)
    } else if (category) {
      // Filter by category
      biomarkers = await db
        .select()
        .from(biomarkersReference)
        .where(eq(biomarkersReference.category, category))
        .orderBy(biomarkersReference.name)
    } else {
      // Get all biomarkers
      biomarkers = await db
        .select()
        .from(biomarkersReference)
        .orderBy(biomarkersReference.category, biomarkersReference.name)
    }

    // Get unique categories for filtering
    const categoriesResult = await db
      .selectDistinct({ category: biomarkersReference.category })
      .from(biomarkersReference)
      .where(sql`${biomarkersReference.category} IS NOT NULL`)
      .orderBy(biomarkersReference.category)

    const categories = categoriesResult.map(r => r.category).filter(Boolean)

    console.log(`✅ [BIOMARKERS-API] Retrieved ${biomarkers.length} biomarkers`)

    return NextResponse.json({
      success: true,
      biomarkers,
      categories,
      count: biomarkers.length,
    })
  } catch (error) {
    console.error('❌ [BIOMARKERS-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
