/**
 * Document Processor
 * Simplified version - extracts text and saves to database
 * Following the pattern from doctor_v0 project
 */

import { extractTextFromPDF } from './pdf-processor'
import { analyzeImageWithVision, analyzePDFWithVision, isImageFile } from './vision-processor'
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
    forceVision?: boolean // Force Vision AI even for PDFs with native text
    preferVision?: boolean // Prefer Vision but allow pdf-parse fallback
  } = {}
): Promise<ProcessingResult> {
  const {
    documentType = 'medical_report',
    structureData = true, // Enable by default
    forceVision = false, // Don't force Vision by default
    preferVision = false, // Don't prefer Vision by default
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
      console.log('📄 [PROCESSOR] Processing PDF...')

      // 🧠 HYBRID STRATEGY: Intelligent PDF processing
      if (forceVision) {
        // User explicitly requested Vision AI
        console.log('🎯 [PROCESSOR] Force Vision mode enabled - using Vision AI')
        processedDoc = await analyzePDFWithVision(fileBuffer, metadata)
      } else if (preferVision) {
        // Try Vision first, fallback to pdf-parse if it fails
        console.log('🔄 [PROCESSOR] Prefer Vision mode - trying Vision AI first')
        try {
          processedDoc = await analyzePDFWithVision(fileBuffer, metadata)
        } catch (error) {
          console.warn('⚠️ [PROCESSOR] Vision AI failed, falling back to pdf-parse')
          console.warn(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
          processedDoc = await extractTextFromPDF(fileBuffer, metadata)
        }
      } else {
        // Default: Try pdf-parse first (fast & free), fallback to Vision if needed
        console.log('⚡ [PROCESSOR] Using hybrid strategy: pdf-parse first, Vision fallback')
        processedDoc = await extractTextFromPDF(fileBuffer, metadata)

        // Check if pdf-parse extraction was successful
        const needsVisionFallback =
          processedDoc.metadata.needsOCR || // PDF flagged as needing OCR
          processedDoc.text.length < 200 || // Very little text extracted
          processedDoc.confidence < 0.5     // Low confidence in extraction

        if (needsVisionFallback) {
          console.log('🔄 [PROCESSOR] pdf-parse extraction insufficient, switching to Vision AI')
          console.log(`   Reason: ${
            processedDoc.metadata.needsOCR ? 'PDF needs OCR' :
            processedDoc.text.length < 200 ? `Too little text (${processedDoc.text.length} chars)` :
            'Low confidence'
          }`)

          try {
            processedDoc = await analyzePDFWithVision(fileBuffer, metadata)
            console.log('✅ [PROCESSOR] Vision AI fallback successful')
          } catch (visionError) {
            console.warn('⚠️ [PROCESSOR] Vision AI fallback failed, keeping pdf-parse result')
            console.warn(`   Vision error: ${visionError instanceof Error ? visionError.message : 'Unknown error'}`)
            // Keep the pdf-parse result even if it's not great
          }
        } else {
          console.log('✅ [PROCESSOR] pdf-parse extraction successful, skipping Vision AI')
          console.log(`   Text length: ${processedDoc.text.length} chars, Confidence: ${processedDoc.confidence}`)
          console.log(`   💰 Cost saved: ~$0.0015 USD (no Vision API call)`)
        }
      }
    } else if (fileType === 'image') {
      console.log('🖼️ [PROCESSOR] Processing as image with Vision AI...')
      processedDoc = await analyzeImageWithVision(fileBuffer, metadata)
    } else {
      throw new Error(`Tipo de arquivo não suportado: ${fileName}`)
    }

    const { text, structuredData: visionStructuredData } = processedDoc

    if (!text || text.length < 50) {
      throw new Error('Documento não contém texto suficiente para processamento')
    }

    // 3. Structure the medical data with LLM (optional)
    // ✅ OPTIMIZATION: Skip if vision already returned structured data
    let structuredData = visionStructuredData || null

    if (!structuredData && structureData) {
      console.log('🧠 [PROCESSOR] Structuring medical data with LLM (fallback)...')
      try {
        const structured = await structureMedicalDocument(text, fileName)
        structuredData = structured
        console.log(`✅ [PROCESSOR] Structured data: ${structured.modules.length} modules found`)
      } catch (error) {
        console.warn('⚠️ [PROCESSOR] Structuring failed, continuing without structured data:', error)
      }
    } else if (structuredData) {
      console.log(`✅ [PROCESSOR] Using structured data from vision (${structuredData.modules?.length || 0} modules)`)
      console.log('⚡ [PROCESSOR] Skipped second LLM call - optimization successful!')
    }

    // 4. Save to database
    console.log('💾 [PROCESSOR] Saving document to database...')

    // ✅ Extract documentDate from structuredData.examDate
    let documentDate: Date | null = null
    if (structuredData?.examDate) {
      try {
        documentDate = new Date(structuredData.examDate)
        console.log(`📅 [PROCESSOR] Document date extracted: ${structuredData.examDate}`)
      } catch (error) {
        console.warn('⚠️ [PROCESSOR] Invalid examDate format in structuredData:', structuredData.examDate)
      }
    }

    const [doc] = await db
      .insert(documents)
      .values({
        userId,
        fileName,
        fileSize: metadata.fileSize,
        fileType: metadata.mimeType,
        documentType: structuredData?.documentType || documentType,
        documentDate, // ✅ Store extracted document date
        extractedText: text,
        structuredData: structuredData, // Store structured JSON
        processingStatus: 'completed', // Immediately mark as completed
      })
      .returning()

    const totalTime = Date.now() - startTime

    const visionTokens = processedDoc.metadata.visionTokens
    const visionCostUSD = processedDoc.metadata.visionCostUSD

    console.log(`\n✅ [PROCESSOR] Document processing completed in ${totalTime}ms`)
    console.log(`📊 [PROCESSOR] Stats:`)
    console.log(`   - Document ID: ${doc.id}`)
    console.log(`   - Text length: ${text.length} chars`)
    console.log(`   - Processed by: ${processedDoc.processedBy}`)
    if (visionTokens) {
      console.log(`   - Vision tokens: ${visionTokens.toLocaleString()}`)
      console.log(`   - Vision cost: ~$${visionCostUSD?.toFixed(4)} USD (~R$ ${(visionCostUSD! * 5).toFixed(4)})`)
    }
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
        visionTokens,
        visionCostUSD,
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
