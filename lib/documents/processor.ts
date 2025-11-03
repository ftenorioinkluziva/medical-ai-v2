/**
 * Document Processor
 * Simplified version - extracts text and saves to database
 * Following the pattern from doctor_v0 project
 */

import { extractTextFromPDF } from './pdf-processor'
import { analyzeImageWithVision, isImageFile } from './vision-processor'
import { structureMedicalDocument } from './structuring'
import { db } from '@/lib/db/client'
import { documents } from '@/lib/db/schema'
import type {
  ProcessingResult,
  DocumentMetadata,
  FileType,
} from './types'

/**
 * Determine file type from filename
 */
function getFileType(filename: string): FileType {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))

  if (ext === '.pdf') {
    return 'pdf'
  } else if (isImageFile(filename)) {
    return 'image'
  } else {
    return 'unknown'
  }
}

/**
 * Get MIME type from filename and file type
 */
function getMimeType(filename: string, fileType: FileType): string {
  if (fileType === 'pdf') {
    return 'application/pdf'
  }

  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.gif': 'image/gif',
  }

  return mimeTypes[ext] || 'application/octet-stream'
}

/**
 * Process uploaded document
 * 1. Extract text (PDF or Vision AI)
 * 2. Store in database with extracted text
 *
 * NO chunking, NO embeddings, NO RAG
 * Just like doctor_v0 project
 */
export async function processDocument(
  fileBuffer: Buffer,
  fileName: string,
  userId: string,
  options: {
    documentType?: string
    structureData?: boolean
  } = {}
): Promise<ProcessingResult> {
  const {
    documentType = 'medical_report',
    structureData = true, // Enable by default
  } = options

  const startTime = Date.now()

  console.log(`\n🚀 [PROCESSOR] Starting document processing: ${fileName}`)
  console.log(`👤 [PROCESSOR] User ID: ${userId}`)
  console.log(`📦 [PROCESSOR] File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`)

  try {
    // 1. Create metadata
    const fileType = getFileType(fileName)
    const metadata: DocumentMetadata = {
      fileName,
      fileSize: fileBuffer.length,
      fileType,
      mimeType: getMimeType(fileName, fileType),
      uploadedAt: new Date(),
      documentType,
    }

    // 2. Extract text based on file type
    let processedDoc

    if (fileType === 'pdf') {
      console.log('📄 [PROCESSOR] Processing as PDF...')
      processedDoc = await extractTextFromPDF(fileBuffer, metadata)
    } else if (fileType === 'image') {
      console.log('🖼️ [PROCESSOR] Processing as image with Vision AI...')
      processedDoc = await analyzeImageWithVision(fileBuffer, metadata)
    } else {
      throw new Error(`Tipo de arquivo não suportado: ${fileName}`)
    }

    const { text } = processedDoc

    if (!text || text.length < 50) {
      throw new Error('Documento não contém texto suficiente para processamento')
    }

    // 3. Structure the medical data with LLM (optional)
    let structuredData = null
    if (structureData) {
      console.log('🧠 [PROCESSOR] Structuring medical data with LLM...')
      try {
        const structured = await structureMedicalDocument(text, fileName)
        structuredData = structured
        console.log(`✅ [PROCESSOR] Structured data: ${structured.modules.length} modules found`)
      } catch (error) {
        console.warn('⚠️ [PROCESSOR] Structuring failed, continuing without structured data:', error)
      }
    }

    // 4. Save to database
    console.log('💾 [PROCESSOR] Saving document to database...')

    const [doc] = await db
      .insert(documents)
      .values({
        userId,
        fileName,
        fileSize: metadata.fileSize,
        fileType: metadata.mimeType,
        documentType: structuredData?.documentType || documentType,
        extractedText: text,
        structuredData: structuredData, // Store structured JSON
        processingStatus: 'completed', // Immediately mark as completed
      })
      .returning()

    const totalTime = Date.now() - startTime

    console.log(`\n✅ [PROCESSOR] Document processing completed in ${totalTime}ms`)
    console.log(`📊 [PROCESSOR] Stats:`)
    console.log(`   - Document ID: ${doc.id}`)
    console.log(`   - Text length: ${text.length} chars`)
    console.log(`   - Processed by: ${processedDoc.processedBy}`)
    if (structuredData) {
      console.log(`   - Structured: ${structuredData.modules.length} modules`)
      console.log(`   - Document type: ${structuredData.documentType}`)
    }

    return {
      success: true,
      documentId: doc.id,
      text,
      chunks: [], // No chunking
      chunksWithEmbeddings: [], // No embeddings
      metadata,
      modulesCount: structuredData?.modules.length || 0,
      stats: {
        textLength: text.length,
        chunksCount: 0,
        processingTimeMs: totalTime,
        embeddingTimeMs: 0,
      },
    }
  } catch (error) {
    console.error('❌ [PROCESSOR] Error processing document:', error)

    return {
      success: false,
      text: '',
      chunks: [],
      chunksWithEmbeddings: [],
      metadata: {
        fileName,
        fileSize: fileBuffer.length,
        fileType: getFileType(fileName),
        mimeType: '',
        uploadedAt: new Date(),
      },
      stats: {
        textLength: 0,
        chunksCount: 0,
        processingTimeMs: Date.now() - startTime,
        embeddingTimeMs: 0,
      },
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
