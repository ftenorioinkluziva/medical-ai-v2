/**
 * PDF Processing
 * Extracts text from PDF documents
 */

import type { ProcessedDocument, DocumentMetadata } from './types'
import pdf from 'pdf-parse'

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(
  fileBuffer: Buffer,
  metadata: DocumentMetadata
): Promise<ProcessedDocument> {
  const startTime = Date.now()

  console.log(`📄 [PDF-PROCESSOR] Processing PDF: ${metadata.fileName}`)

  try {
    // Parse PDF
    const data = await pdf(fileBuffer)

    const text = data.text.trim()

    if (!text || text.length < 50) {
      console.log('⚠️ [PDF-PROCESSOR] PDF has insufficient text, may need OCR')

      return {
        text: text || '[PDF vazio ou sem texto extraível]',
        metadata: {
          ...metadata,
          pdfPages: data.numpages,
          pdfInfo: data.info,
          needsOCR: true,
        },
        processedBy: 'pdf',
        confidence: 0.3,
      }
    }

    const processingTime = Date.now() - startTime

    console.log(`✅ [PDF-PROCESSOR] Extracted ${text.length} chars from ${data.numpages} pages in ${processingTime}ms`)

    return {
      text,
      metadata: {
        ...metadata,
        pdfPages: data.numpages,
        pdfInfo: data.info,
        textLength: text.length,
      },
      processedBy: 'pdf',
      confidence: 1.0,
    }
  } catch (error) {
    console.error('❌ [PDF-PROCESSOR] Error processing PDF:', error)

    throw new Error(
      `Erro ao processar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    )
  }
}

/**
 * Check if PDF needs OCR (has little or no text)
 */
export function checkIfNeedsOCR(text: string): boolean {
  // If text is too short or mostly whitespace, probably needs OCR
  const cleanText = text.trim().replace(/\s+/g, ' ')
  return cleanText.length < 100
}
