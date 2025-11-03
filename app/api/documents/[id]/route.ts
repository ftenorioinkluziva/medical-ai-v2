/**
 * Single Document API
 * Get a specific document by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { documents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    console.log(`📄 [DOCUMENT-API] Fetching document: ${id}`)

    // Get document (ensure it belongs to the user)
    const [document] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, id),
          eq(documents.userId, session.user.id)
        )
      )
      .limit(1)

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Documento não encontrado' },
        { status: 404 }
      )
    }

    console.log(`✅ [DOCUMENT-API] Document found: ${document.fileName}`)

    return NextResponse.json({
      success: true,
      document,
    })
  } catch (error) {
    console.error('❌ [DOCUMENT-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
