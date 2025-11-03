/**
 * Document Upload API
 * Handles file upload and processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { processDocument } from '@/lib/documents'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * POST /api/documents/upload
 * Upload and process a medical document
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    console.log(`📤 [UPLOAD-API] Upload request from user: ${session.user.id}`)

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const documentType = formData.get('documentType') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Tipo de arquivo não suportado. Use PDF ou imagens (JPG, PNG, WEBP)',
        },
        { status: 400 }
      )
    }

    console.log(`📄 [UPLOAD-API] Processing file: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)} KB)`)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process document (simplified - no embeddings)
    const result = await processDocument(buffer, file.name, session.user.id, {
      documentType: documentType || undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Erro ao processar documento',
        },
        { status: 500 }
      )
    }

    console.log(`✅ [UPLOAD-API] Document processed successfully: ${result.documentId}`)

    return NextResponse.json({
      success: true,
      documentId: result.documentId,
      fileName: file.name,
      stats: {
        ...result.stats,
        modulesCount: result.modulesCount || 0,
      },
      metadata: {
        textLength: result.stats.textLength,
        chunksCount: result.stats.chunksCount,
        processingTimeMs: result.stats.processingTimeMs,
        modulesCount: result.modulesCount || 0,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ [UPLOAD-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/documents/upload
 * Get upload configuration
 */
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
    allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
    supportedDocumentTypes: [
      'lab_report',
      'bioimpedance',
      'medical_report',
      'prescription',
      'imaging',
      'other',
    ],
  })
}
