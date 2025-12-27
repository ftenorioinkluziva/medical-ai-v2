/**
 * Generate Metadata API Endpoint
 * Uses LLM to automatically generate metadata from document content
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { generateText } from 'ai'
import { googleModels } from '@/lib/ai/providers'
import pdf from 'pdf-parse/lib/pdf-parse'

const CATEGORIES = [
  'hematology',
  'endocrinology',
  'nutrition',
  'metabolism',
  'cardiology',
  'immunology',
  'integrative',
  'general',
]

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    console.log('🤖 [METADATA-GEN] Generating metadata from document...')

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Extract text from file
    let extractedText = ''
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    if (file.type === 'application/pdf') {
      console.log('📄 [METADATA-GEN] Extracting text from PDF...')
      const pdfData = await pdf(fileBuffer)
      extractedText = pdfData.text
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      extractedText = fileBuffer.toString('utf-8')
    } else {
      return NextResponse.json(
        { success: false, error: 'Tipo de arquivo não suportado para geração automática' },
        { status: 400 }
      )
    }

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        { success: false, error: 'Não foi possível extrair texto suficiente do documento' },
        { status: 400 }
      )
    }

    console.log(`📝 [METADATA-GEN] Extracted ${extractedText.length} characters`)

    // Truncate text if too long (use first 10,000 chars for metadata generation)
    const textSample = extractedText.substring(0, 10000)

    // Generate metadata using LLM
    console.log('🤖 [METADATA-GEN] Calling LLM to generate metadata...')

    const systemPrompt = `Você é um especialista em análise de documentos médicos e científicos. Sua tarefa é analisar o conteúdo fornecido e gerar metadados estruturados.

CATEGORIAS DISPONÍVEIS:
- hematology: Hematologia
- endocrinology: Endocrinologia
- nutrition: Nutrição
- metabolism: Metabolismo
- cardiology: Cardiologia
- immunology: Imunologia
- integrative: Medicina Integrativa
- general: Geral

INSTRUÇÕES:
1. Analise o conteúdo do documento
2. Gere um título conciso e descritivo (máximo 100 caracteres)
3. Escolha a categoria mais adequada (apenas UMA das listadas acima)
4. Identifique a fonte/autor (se mencionado no texto)
5. Crie um resumo objetivo de 2-4 frases
6. Extraia 3-6 tags relevantes (palavras-chave médicas)

IMPORTANTE:
- Seja preciso e objetivo
- Use terminologia médica apropriada
- O título deve ser claro e informativo
- As tags devem ser palavras-chave únicas e relevantes
- O resumo deve destacar os pontos principais do documento

FORMATO DE SAÍDA (JSON):
{
  "title": "Título do documento",
  "category": "categoria",
  "source": "Fonte/Autor (ou vazio se não identificado)",
  "summary": "Resumo objetivo do conteúdo...",
  "tags": "tag1, tag2, tag3, tag4"
}

Retorne APENAS o JSON válido, sem texto adicional.`

    const userPrompt = `Analise este documento médico e gere os metadados estruturados:

DOCUMENTO:
${textSample}

NOME DO ARQUIVO: ${file.name}

Retorne APENAS o JSON com os metadados.`

    const startTime = Date.now()

    const result = await generateText({
      model: googleModels.flash,
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      temperature: 0.3, // Low for consistency
    })

    const responseText = result.text.trim()

    // Extract JSON from response
    let jsonText = responseText
    if (responseText.includes('```json')) {
      const match = responseText.match(/```json\n([\s\S]*?)\n```/)
      if (match) {
        jsonText = match[1]
      }
    } else if (responseText.includes('```')) {
      const match = responseText.match(/```\n([\s\S]*?)\n```/)
      if (match) {
        jsonText = match[1]
      }
    }

    // Parse JSON
    let metadata
    try {
      metadata = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('❌ [METADATA-GEN] JSON parse error:', parseError)
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao processar resposta da IA. Tente novamente.',
          debug: responseText.substring(0, 200)
        },
        { status: 500 }
      )
    }

    // Validate category
    if (!CATEGORIES.includes(metadata.category)) {
      metadata.category = 'general'
    }

    // Clean up tags (remove duplicates, trim)
    if (metadata.tags) {
      const tagsArray = metadata.tags
        .split(',')
        .map((t: string) => t.trim().toLowerCase())
        .filter((t: string, i: number, arr: string[]) => arr.indexOf(t) === i) // Remove duplicates
        .slice(0, 8) // Limit to 8 tags
      metadata.tags = tagsArray.join(', ')
    }

    const processingTime = Date.now() - startTime

    console.log(`✅ [METADATA-GEN] Metadata generated in ${processingTime}ms`)
    console.log(`   - Title: ${metadata.title}`)
    console.log(`   - Category: ${metadata.category}`)
    console.log(`   - Tags: ${metadata.tags}`)
    console.log(`   - Tokens: ${result.usage?.totalTokens || 'N/A'}`)

    return NextResponse.json({
      success: true,
      metadata: {
        title: metadata.title || '',
        category: metadata.category || 'general',
        source: metadata.source || '',
        summary: metadata.summary || '',
        tags: metadata.tags || '',
      },
      stats: {
        processingTimeMs: processingTime,
        tokensUsed: result.usage?.totalTokens || 0,
        textLength: extractedText.length,
      },
    })
  } catch (error) {
    console.error('❌ [METADATA-GEN] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao gerar metadados',
      },
      { status: 500 }
    )
  }
}
