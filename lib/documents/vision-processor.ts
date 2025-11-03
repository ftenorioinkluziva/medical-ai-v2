/**
 * Vision AI Processing
 * Analyzes medical images using GPT-4o Vision
 */

import { generateText } from 'ai'
import { openaiModels } from '@/lib/ai/providers'
import type { ProcessedDocument, DocumentMetadata } from './types'

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
 * Analyze medical image using GPT-4o Vision
 */
export async function analyzeImageWithVision(
  fileBuffer: Buffer,
  metadata: DocumentMetadata
): Promise<ProcessedDocument> {
  const startTime = Date.now()

  console.log(`🖼️ [VISION-AI] Processing image: ${metadata.fileName}`)

  try {
    // Convert buffer to base64
    const base64Image = fileBuffer.toString('base64')
    const mimeType = getMimeType(metadata.fileName)

    // Create data URL
    const imageUrl = `data:${mimeType};base64,${base64Image}`

    // System prompt for medical document analysis
    const systemPrompt = `Você é um especialista em análise de documentos médicos. Analise esta imagem médica e extraia TODOS os dados estruturados visíveis.

IMPORTANTE: Seja extremamente detalhado e preciso. Inclua:

1. **Informações do Paciente**: Nome completo, idade, sexo, data de nascimento, CPF, RG
2. **Informações do Laboratório/Clínica**: Nome, endereço, médico solicitante
3. **Data do Exame**: Data de coleta e/ou resultado
4. **Todos os Parâmetros Médicos**: Nome do exame, valor medido, unidade de medida, valores de referência
5. **Observações e Comentários**: Qualquer nota ou comentário médico
6. **Interpretação**: Status (normal, alterado, alto, baixo)

Retorne um texto estruturado e detalhado com TODOS os dados encontrados na imagem.`

    const userPrompt = `Analise esta imagem médica (${metadata.fileName}) e extraia todos os dados estruturados visíveis.

Organize as informações de forma clara e estruturada, incluindo:
- Todos os valores numéricos com suas unidades
- Nomes completos de todos os parâmetros/exames
- Valores de referência quando disponíveis
- Qualquer texto relevante da imagem

Seja extremamente detalhado!`

    console.log('🤖 [VISION-AI] Calling GPT-4o Vision...')

    // Use AI SDK with vision
    const result = await generateText({
      model: openaiModels.gpt4o,
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
              image: imageUrl,
            },
          ],
        },
      ],
      maxTokens: 4096,
      temperature: 0.1, // Low temperature for accuracy
    })

    const text = result.text.trim()

    if (!text || text.length < 50) {
      throw new Error('Vision AI retornou dados insuficientes')
    }

    const processingTime = Date.now() - startTime

    console.log(`✅ [VISION-AI] Extracted ${text.length} chars in ${processingTime}ms`)
    console.log(`📊 [VISION-AI] Usage: ${result.usage.totalTokens} tokens`)

    return {
      text,
      metadata: {
        ...metadata,
        textLength: text.length,
        visionModel: 'gpt-4o',
        visionTokens: result.usage.totalTokens,
      },
      processedBy: 'vision',
      confidence: 0.9,
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
