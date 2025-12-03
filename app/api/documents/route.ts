/**
 * Documents API
 * List and manage user documents
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { documents } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

/**
 * GET /api/documents
 * List all documents for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const documentType = searchParams.get('documentType')

    // Support patientId for doctors
    const userId = patientId && session.user.role === 'doctor' ? patientId : session.user.id

    console.log(`📚 [DOCUMENTS-API] Listing documents for user: ${userId}${patientId ? ' (doctor view)' : ''}`)

    // Build query
    let query = db
      .select({
        id: documents.id,
        fileName: documents.fileName,
        fileSize: documents.fileSize,
        mimeType: documents.fileType, // fileType column stores the MIME type
        documentType: documents.documentType,
        documentDate: documents.documentDate, // ✅ Include document date (real exam date)
        processingStatus: documents.processingStatus,
        extractedText: documents.extractedText,
        structuredData: documents.structuredData, // Include structured data
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.documentDate), desc(documents.createdAt)) // ✅ Order by exam date first, then upload date
      .limit(limit)

    const userDocuments = await query

    console.log(`✅ [DOCUMENTS-API] Found ${userDocuments.length} documents`)

    return NextResponse.json({
      success: true,
      documents: userDocuments,
      count: userDocuments.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ [DOCUMENTS-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
