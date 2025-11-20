/**
 * Protocol Details API Endpoint
 * GET /api/medical-knowledge/protocols/[id]
 * Get detailed information about a specific protocol
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { protocols } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log(`🔍 [PROTOCOL-DETAIL-API] Fetching protocol: ${id}`)

    const [protocol] = await db
      .select()
      .from(protocols)
      .where(eq(protocols.id, id))
      .limit(1)

    if (!protocol) {
      console.log(`❌ [PROTOCOL-DETAIL-API] Protocol not found: ${id}`)
      return NextResponse.json(
        {
          success: false,
          error: 'Protocolo não encontrado',
        },
        { status: 404 }
      )
    }

    console.log(`✅ [PROTOCOL-DETAIL-API] Protocol found: ${protocol.title}`)

    return NextResponse.json({
      success: true,
      protocol,
    })
  } catch (error) {
    console.error('❌ [PROTOCOL-DETAIL-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
