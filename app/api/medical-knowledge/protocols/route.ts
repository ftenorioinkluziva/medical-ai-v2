/**
 * Protocols API Endpoint
 * GET /api/medical-knowledge/protocols
 * List all protocols with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { protocols } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    console.log('📋 [PROTOCOLS-API] Fetching protocols', { type, id })

    let protocolsList

    if (id) {
      // Get specific protocol
      protocolsList = await db
        .select()
        .from(protocols)
        .where(eq(protocols.id, id))
        .limit(1)
    } else if (type) {
      // Filter by type
      protocolsList = await db
        .select()
        .from(protocols)
        .where(eq(protocols.type, type))
        .orderBy(protocols.title)
    } else {
      // Get all protocols
      protocolsList = await db
        .select()
        .from(protocols)
        .orderBy(protocols.type, protocols.title)
    }

    // Get unique types for filtering
    const typesResult = await db
      .selectDistinct({ type: protocols.type })
      .from(protocols)
      .where(sql`${protocols.type} IS NOT NULL`)
      .orderBy(protocols.type)

    const types = typesResult.map(r => r.type).filter(Boolean)

    console.log(`✅ [PROTOCOLS-API] Retrieved ${protocolsList.length} protocols`)

    return NextResponse.json({
      success: true,
      protocols: protocolsList,
      types,
      count: protocolsList.length,
    })
  } catch (error) {
    console.error('❌ [PROTOCOLS-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
