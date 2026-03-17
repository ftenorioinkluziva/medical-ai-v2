/**
 * Auto Upload API - Complete automation for N8N
 * Combines metadata generation + upload in a single request
 * Perfect for automation workflows
 *
 * Authentication: Supports both session cookies and API keys
 * - Session: Cookie header with authjs.session-token
 * - API Key: Authorization header with Bearer token
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, isAdmin } from '@/lib/api-keys/auth-middleware'
import { addKnowledgeArticle } from '@/lib/ai/knowledge'
import { generateText } from 'ai'
import { googleModels } from '@/lib/ai/providers'
import pdf from 'pdf-parse/lib/pdf-parse'

export async function POST(request: NextRequest) {
  try {
    // Authenticate - supports both session and API key
    const authResult = await authenticateRequest(request)

    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Não autenticado' },
        { status: 401 }
      )
    }

    // Check admin role
    if (!isAdmin(authResult)) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores podem adicionar artigos.' },
        { status: 403 }
      )
    }

    console.log('🤖 [AUTO-UPLOAD] Starting automated upload process...')
    console.log(`   User: ${authResult.user?.email}`)
    console.log(`   Auth method: ${authResult.authMethod}`)

    // Parse form data
    const formData = await request.formData()

    // Debug: log all form data keys
    const formKeys = Array.from(formData.keys())
    console.log(`📋 [AUTO-UPLOAD] FormData keys: ${formKeys.join(', ') || 'NONE'}`)

    const file = formData.get('file') as File | null

    // Validate file
    if (!file) {
      console.error('❌ [AUTO-UPLOAD] No file found in formData')
      console.error(`   Available keys: ${formKeys.join(', ') || 'NONE'}`)
      console.error(`   Expected key: "file"`)

      return NextResponse.json(
        {
          success: false,
          error: 'Arquivo é obrigatório',
          debug: {
            receivedKeys: formKeys,
            expectedKey: 'file',
            hint: 'Verifique se o campo no N8N está configurado como "file" em Parameter Name'
          }
        },
        { status: 400 }
      )
    }

    console.log(`📄 [AUTO-UPLOAD] File: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`)

    // STEP 1: Extract text from file
    let extractedText = ''
    const startTime = Date.now()

    try {
      if (file.type === 'application/pdf') {
        console.log('📄 [AUTO-UPLOAD] Extracting PDF...')
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const pdfData = await pdf(buffer)
        extractedText = pdfData.text
        console.log(`✅ [AUTO-UPLOAD] PDF extracted: ${extractedText.length} chars, ${pdfData.numpages} pages`)
      } else if (
        file.type === 'text/plain' ||
        file.type === 'text/markdown' ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md')
      ) {
        console.log('📄 [AUTO-UPLOAD] Reading text file...')
        extractedText = await file.text()
        console.log(`✅ [AUTO-UPLOAD] Text extracted: ${extractedText.length} chars`)
      } else {
        return NextResponse.json(
          { success: false, error: 'Tipo de arquivo não suportado. Use PDF, TXT ou MD.' },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('❌ [AUTO-UPLOAD] Text extraction failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao extrair texto do arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        },
        { status: 500 }
      )
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Texto extraído muito curto. O arquivo deve conter pelo menos 100 caracteres.'
        },
        { status: 400 }
      )
    }

    extractedText = extractedText.trim()

    // STEP 2: Generate metadata using AI
    console.log('🤖 [AUTO-UPLOAD] Generating metadata with AI...')
    const textSample = extractedText.substring(0, 10000)

    const systemPrompt = `Você é um especialista em análise de documentos médicos e científicos. Sua tarefa é analisar o conteúdo fornecido e gerar metadados estruturados.

INSTRUÇÕES:
1. Analise o conteúdo do documento
2. Gere um título conciso e descritivo (máximo 100 caracteres)
3. Identifique a categoria médica mais adequada (ex: Hematologia, Endocrinologia, Nutrição, Cardiologia, etc.)
4. Identifique uma subcategoria específica se aplicável (ex: para Endocrinologia pode ser "Diabetes", "Tireoide", etc.)
5. Identifique a fonte (journal, organização, website, etc.) se mencionada
6. Identifique a URL da fonte se mencionada no texto
7. Identifique o(s) autor(es) se mencionado(s) no texto
8. Crie um resumo objetivo de 2-4 frases
9. Extraia 3-6 tags relevantes (palavras-chave médicas)

IMPORTANTE:
- Seja preciso e objetivo
- Use terminologia médica apropriada
- O título deve ser claro e informativo
- A subcategoria deve ser específica e relacionada à categoria principal
- Se não encontrar autor, fonte ou URL no texto, deixe vazio
- As tags devem ser palavras-chave únicas e relevantes
- O resumo deve destacar os pontos principais do documento

FORMATO DE SAÍDA (JSON):
{
  "title": "Título do documento",
  "category": "categoria",
  "subcategory": "Subcategoria específica (ou vazio se não aplicável)",
  "source": "Nome da fonte (ou vazio se não identificado)",
  "sourceUrl": "URL da fonte (ou vazio se não identificado)",
  "author": "Nome do(s) autor(es) (ou vazio se não identificado)",
  "summary": "Resumo objetivo do conteúdo...",
  "tags": "tag1, tag2, tag3, tag4"
}

Retorne APENAS o JSON válido, sem texto adicional.`

    const userPrompt = `Analise este documento médico e gere os metadados estruturados:

DOCUMENTO:
${textSample}

NOME DO ARQUIVO: ${file.name}

Retorne APENAS o JSON com os metadados.`

    let metadata
    try {
      const result = await generateText({
        model: googleModels.flash,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        temperature: 0.3,
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

      metadata = JSON.parse(jsonText)

      // Clean up tags
      if (metadata.tags) {
        const tagsArray = metadata.tags
          .split(',')
          .map((t: string) => t.trim().toLowerCase())
          .filter((t: string, i: number, arr: string[]) => arr.indexOf(t) === i)
          .slice(0, 8)
        metadata.tags = tagsArray.join(', ')
      }

      console.log(`✅ [AUTO-UPLOAD] Metadata generated:`)
      console.log(`   - Title: ${metadata.title}`)
      console.log(`   - Category: ${metadata.category}`)
      console.log(`   - Subcategory: ${metadata.subcategory || 'N/A'}`)
      console.log(`   - Tags: ${metadata.tags}`)
    } catch (error) {
      console.error('❌ [AUTO-UPLOAD] Metadata generation failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao gerar metadados automaticamente. Tente novamente.'
        },
        { status: 500 }
      )
    }

    // STEP 3: Add to knowledge base
    console.log('🧠 [AUTO-UPLOAD] Adding article to knowledge base...')

    // Parse tags for storage
    const parsedTags = metadata.tags
      ? metadata.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
      : undefined

    const result = await addKnowledgeArticle(
      {
        title: metadata.title || file.name,
        category: metadata.category || 'Geral',
        subcategory: metadata.subcategory || undefined,
        content: extractedText,
        source: metadata.source || undefined,
        sourceUrl: metadata.sourceUrl || undefined,
        author: metadata.author || undefined,
        publishedDate: undefined,
        summary: metadata.summary || undefined,
        tags: parsedTags,
        isVerified: 'verified', // Auto-verified for admin uploads
      },
      {
        generateEmbeddings: true,
      }
    )

    if (!result.success) {
      throw new Error(result.error || 'Erro ao adicionar artigo')
    }

    const processingTime = Date.now() - startTime

    console.log('✅ [AUTO-UPLOAD] Process completed successfully!')
    console.log(`📊 [AUTO-UPLOAD] Article ID: ${result.articleId}`)
    console.log(`📊 [AUTO-UPLOAD] Chunks: ${result.stats?.chunksCount || 0}`)
    console.log(`⏱️ [AUTO-UPLOAD] Total processing time: ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      articleId: result.articleId,
      metadata: {
        title: metadata.title,
        category: metadata.category,
        subcategory: metadata.subcategory,
        source: metadata.source,
        author: metadata.author,
        summary: metadata.summary,
        tags: metadata.tags,
      },
      stats: {
        textLength: extractedText.length,
        chunksCount: result.stats?.chunksCount || 0,
        processingTimeMs: processingTime,
      },
    })
  } catch (error) {
    console.error('❌ [AUTO-UPLOAD] Upload failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao processar upload automático',
      },
      { status: 500 }
    )
  }
}
