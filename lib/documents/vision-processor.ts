/**
 * Vision AI Processing
 * Analyzes medical images using Gemini 2.5 Flash multimodal
 * Optimized: extract text AND structure data in ONE call with native structured output
 */

import { generateObject } from 'ai'
import { googleModels } from '@/lib/ai/providers'
import type { ProcessedDocument, DocumentMetadata } from './types'
import { StructuredMedicalDocumentSchema, type StructuredMedicalDocument } from './schemas'

/**
 * Supported image formats
 */
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif']

/**
 * Check if file is an image
 */
export function isImageFile(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return IMAGE_EXTENSIONS.includes(ext)
}

/**
 * Get MIME type from filename
 */
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.gif': 'image/gif',
  }
  return mimeTypes[ext] || 'image/jpeg'
}

/**
 * Analyze medical image using Gemini 2.5 Flash multimodal
 * Optimized: Extracts text AND structures data in a SINGLE call
 */
export async function analyzeImageWithVision(
  fileBuffer: Buffer,
  metadata: DocumentMetadata
): Promise<ProcessedDocument> {
  const startTime = Date.now()

  console.log(`🖼️ [VISION-AI] Processing image with Gemini 2.5 Flash: ${metadata.fileName}`)

  try {
    // Convert buffer to base64
    const base64Image = fileBuffer.toString('base64')
    const mimeType = getMimeType(metadata.fileName)

    // System prompt for medical document analysis
    const systemPrompt = `Você é um especialista em análise de documentos médicos. Analise esta imagem médica e extraia TODOS os dados estruturados visíveis.

INSTRUÇÕES CRÍTICAS:
1. Extraia TODOS os dados visíveis do documento médico
2. Organize em módulos por categoria (Hemograma, Lipidograma, Hormônios, Bioimpedância, etc.)
3. Para cada parâmetro, inclua: nome, valor, unidade, faixa de referência
4. Classifique status como: normal, high, low, abnormal, borderline, n/a
5. Seja extremamente preciso com valores numéricos
6. Mantenha nomes originais dos exames em português
7. Se informações não estiverem disponíveis, omita o campo opcional`

    const userPrompt = `Analise esta imagem médica (${metadata.fileName}) e extraia todos os dados estruturados visíveis.

Seja extremamente detalhado e preciso com todos os valores, unidades e faixas de referência.`

    console.log('🤖 [VISION-AI] Calling Gemini 2.5 Flash multimodal with native structured output...')

    // ✅ Use generateObject with Zod schema - guaranteed valid JSON!
    const result = await generateObject({
      model: googleModels.flash, // Gemini 2.5 Flash
      schema: StructuredMedicalDocumentSchema,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            {
              type: 'image',
              image: `data:${mimeType};base64,${base64Image}`,
            },
          ],
        },
      ],
      temperature: 0.1, // Low temperature for accuracy
    })

    const structuredData = result.object

    // Create readable text representation for extractedText field
    const text = JSON.stringify(structuredData, null, 2)

    const processingTime = Date.now() - startTime

    console.log(`✅ [VISION-AI] Processed in ${processingTime}ms`)
    console.log(`📊 [VISION-AI] Tokens: ${result.usage.totalTokens}`)
    console.log(`📊 [VISION-AI] Model: gemini-2.5-flash (multimodal)`)
    console.log(`📊 [VISION-AI] Modules extracted: ${structuredData.modules.length}`)
    console.log(`🎯 [VISION-AI] Schema validation: PASSED (native structured output)`)

    return {
      text,
      metadata: {
        ...metadata,
        textLength: text.length,
        visionModel: 'gemini-2.5-flash',
        visionTokens: result.usage.totalTokens,
      },
      processedBy: 'vision',
      confidence: 0.95, // High confidence with structured output
      structuredData, // ✅ Return validated structured data
    }
  } catch (error) {
    console.error('❌ [VISION-AI] Error processing image:', error)

    // Fallback: return placeholder text
    const fallbackText = `[IMAGEM MÉDICA - ${metadata.fileName}]

Esta é uma imagem médica que foi processada automaticamente pelo sistema.

Informações do arquivo:
- Nome: ${metadata.fileName}
- Tamanho: ${(metadata.fileSize / 1024).toFixed(2)} KB
- Data de upload: ${metadata.uploadedAt.toLocaleString('pt-BR')}

AVISO: Não foi possível extrair automaticamente os dados desta imagem.
Por favor, digite manualmente os dados relevantes ou tente fazer upload novamente.

Erro técnico: ${error instanceof Error ? error.message : 'Erro desconhecido'}`

    return {
      text: fallbackText,
      metadata: {
        ...metadata,
        visionError: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      processedBy: 'vision',
      confidence: 0.1,
    }
  }
}

/**
 * Analyze PDF with images (scanned documents) using Vision AI
 * This is useful for PDFs that are actually scanned images
 */
export async function analyzePDFWithVision(
  fileBuffer: Buffer,
  metadata: DocumentMetadata
): Promise<ProcessedDocument> {
  console.log(`📄🖼️ [VISION-AI] Processing scanned PDF with Vision: ${metadata.fileName}`)

  // For PDFs, we'll need to convert pages to images first
  // For now, return a placeholder that indicates Vision processing is needed
  // In production, you'd use a library like pdf2pic to convert PDF pages to images

  return {
    text: '[PDF ESCANEADO - Requer processamento OCR avançado]',
    metadata: {
      ...metadata,
      needsAdvancedOCR: true,
    },
    processedBy: 'vision',
    confidence: 0.2,
  }
}
