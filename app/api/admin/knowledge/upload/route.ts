/**
 * Knowledge Base Upload API
 * Handle file upload and processing for knowledge articles
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { addKnowledgeArticle } from '@/lib/ai/knowledge'
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    // Authenticate and check admin role
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores podem adicionar artigos.' },
        { status: 403 }
      )
    }

    console.log('📚 [KNOWLEDGE-UPLOAD] Starting upload process...')

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const source = formData.get('source') as string | null
    const summary = formData.get('summary') as string | null
    const tags = formData.get('tags') as string | null

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Arquivo é obrigatório' },
        { status: 400 }
      )
    }

    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: 'Título e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    console.log(`📄 [KNOWLEDGE-UPLOAD] File: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`)

    // Extract text based on file type
    let extractedText = ''
    const startTime = Date.now()

    try {
      if (file.type === 'application/pdf') {
        console.log('📄 [KNOWLEDGE-UPLOAD] Extracting PDF...')
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const pdfData = await pdf(buffer)
        extractedText = pdfData.text
        console.log(`✅ [KNOWLEDGE-UPLOAD] PDF extracted: ${extractedText.length} chars, ${pdfData.numpages} pages`)
      } else if (
        file.type === 'text/plain' ||
        file.type === 'text/markdown' ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md')
      ) {
        console.log('📄 [KNOWLEDGE-UPLOAD] Reading text file...')
        extractedText = await file.text()
        console.log(`✅ [KNOWLEDGE-UPLOAD] Text extracted: ${extractedText.length} chars`)
      } else if (
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Arquivos Word (.doc/.docx) não são suportados no momento. Use PDF ou TXT.'
          },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { success: false, error: 'Tipo de arquivo não suportado. Use PDF, TXT ou MD.' },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('❌ [KNOWLEDGE-UPLOAD] Text extraction failed:', error)
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

    // Clean and prepare text
    extractedText = extractedText.trim()

    // Parse tags
    const parsedTags = tags
      ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : undefined

    console.log('🧠 [KNOWLEDGE-UPLOAD] Adding article to knowledge base...')
    console.log(`📊 [KNOWLEDGE-UPLOAD] Title: ${title}`)
    console.log(`📊 [KNOWLEDGE-UPLOAD] Category: ${category}`)
    console.log(`📊 [KNOWLEDGE-UPLOAD] Content length: ${extractedText.length} chars`)
    console.log(`📊 [KNOWLEDGE-UPLOAD] Tags: ${parsedTags?.join(', ') || 'none'}`)

    // Add to knowledge base with embeddings
    const result = await addKnowledgeArticle(
      {
        title,
        category,
        content: extractedText,
        source: source || undefined,
        summary: summary || undefined,
        tags: parsedTags,
        isVerified: 'verified', // Admin uploads are auto-verified
      },
      {
        generateEmbeddings: true,
      }
    )

    if (!result.success) {
      throw new Error(result.error || 'Erro ao adicionar artigo')
    }

    const processingTime = Date.now() - startTime

    console.log('✅ [KNOWLEDGE-UPLOAD] Article added successfully!')
    console.log(`📊 [KNOWLEDGE-UPLOAD] Article ID: ${result.articleId}`)
    console.log(`📊 [KNOWLEDGE-UPLOAD] Chunks: ${result.stats?.chunksCount || 0}`)
    console.log(`⏱️ [KNOWLEDGE-UPLOAD] Processing time: ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      articleId: result.articleId,
      stats: {
        textLength: extractedText.length,
        chunksCount: result.stats?.chunksCount || 0,
        processingTimeMs: processingTime,
      },
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-UPLOAD] Upload failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao processar upload',
      },
      { status: 500 }
    )
  }
}
