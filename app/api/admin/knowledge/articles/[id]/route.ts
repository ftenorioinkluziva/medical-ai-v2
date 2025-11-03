/**
 * Individual Article API
 * Get, update, or delete a specific knowledge article
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { knowledgeArticles, knowledgeEmbeddings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
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
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    console.log(`📚 [KNOWLEDGE-API] Fetching article: ${id}`)

    // Get article with full content
    const [article] = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id))
      .limit(1)

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artigo não encontrado' },
        { status: 404 }
      )
    }

    console.log(`✅ [KNOWLEDGE-API] Article found: ${article.title}`)

    return NextResponse.json({
      success: true,
      article,
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-API] Error fetching article:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar artigo',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
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
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    console.log(`🗑️ [KNOWLEDGE-API] Deleting article: ${id}`)

    // Check if article exists
    const [article] = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id))
      .limit(1)

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artigo não encontrado' },
        { status: 404 }
      )
    }

    // Delete embeddings first (CASCADE should handle this, but let's be explicit)
    await db
      .delete(knowledgeEmbeddings)
      .where(eq(knowledgeEmbeddings.articleId, id))

    // Delete article
    await db
      .delete(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id))

    console.log(`✅ [KNOWLEDGE-API] Article deleted: ${article.title}`)

    return NextResponse.json({
      success: true,
      message: 'Artigo deletado com sucesso',
    })
  } catch (error) {
    console.error('❌ [KNOWLEDGE-API] Error deleting article:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao deletar artigo',
      },
      { status: 500 }
    )
  }
}
