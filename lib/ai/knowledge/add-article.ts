/**
 * Add Articles to Knowledge Base
 * Functions to add and process knowledge articles
 */

import { db } from '@/lib/db/client'
import { knowledgeArticles, knowledgeEmbeddings } from '@/lib/db/schema'
import { chunkDocument } from '@/lib/documents/chunking'
import { generateBatchEmbeddings } from '../core/embeddings'

export interface AddArticleInput {
  title: string
  category: string
  subcategory?: string
  content: string
  summary?: string
  source?: string
  sourceUrl?: string
  author?: string
  publishedDate?: Date
  tags?: string[]
  relevanceScore?: number
  isVerified?: 'verified' | 'pending' | 'rejected'
}

/**
 * Add article to knowledge base with vector embeddings
 */
export async function addKnowledgeArticle(
  input: AddArticleInput,
  options: {
    generateEmbeddings?: boolean
    embeddingProvider?: 'google' | 'openai'
  } = {}
): Promise<{ success: boolean; articleId?: string; error?: string }> {
  const {
    generateEmbeddings = true,
    embeddingProvider = 'google',  // ✅ Changed from 'openai' to 'google'
  } = options

  console.log(`📚 [KNOWLEDGE] Adding article: ${input.title}`)

  try {
    // 1. Insert article
    const [article] = await db
      .insert(knowledgeArticles)
      .values({
        title: input.title,
        category: input.category,
        subcategory: input.subcategory,
        content: input.content,
        summary: input.summary,
        source: input.source,
        sourceUrl: input.sourceUrl,
        author: input.author,
        publishedDate: input.publishedDate,
        tags: input.tags || [],
        relevanceScore: input.relevanceScore,
        isVerified: input.isVerified || 'pending',
      })
      .returning()

    console.log(`✅ [KNOWLEDGE] Article created: ${article.id}`)

    // 2. Generate embeddings if enabled
    let chunks: any[] = []
    if (generateEmbeddings) {
      console.log(`🧠 [KNOWLEDGE] Generating embeddings for article...`)

      // Chunk the content
      chunks = chunkDocument(input.content, {
        maxChunkSize: 1000,
        minChunkSize: 200,
        overlap: 100,
      })

      console.log(`✂️ [KNOWLEDGE] Created ${chunks.length} chunks`)

      // Generate embeddings in batch
      const chunkTexts = chunks.map(c => c.content)
      const { embeddings, model } = await generateBatchEmbeddings(chunkTexts, {
        provider: embeddingProvider,
      })

      console.log(`✅ [KNOWLEDGE] Generated ${embeddings.length} embeddings`)

      // Store embeddings
      for (const [index, chunk] of chunks.entries()) {
        await db.insert(knowledgeEmbeddings).values({
          articleId: article.id,
          chunkIndex: index,
          content: chunk.content,
          embedding: embeddings[index],
          embeddingModel: model,
          embeddingProvider,
        })
      }

      console.log(`✅ [KNOWLEDGE] Stored ${chunks.length} chunk embeddings`)
    }

    return {
      success: true,
      articleId: article.id,
      stats: generateEmbeddings ? {
        chunksCount: chunks.length,
      } : undefined,
    }
  } catch (error) {
    console.error('❌ [KNOWLEDGE] Error adding article:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Add multiple articles in batch
 */
export async function addKnowledgeArticlesBatch(
  articles: AddArticleInput[],
  options: {
    generateEmbeddings?: boolean
    embeddingProvider?: 'google' | 'openai'
  } = {}
): Promise<{ success: boolean; count: number; errors: string[] }> {
  console.log(`📚 [KNOWLEDGE] Adding ${articles.length} articles in batch...`)

  const errors: string[] = []
  let successCount = 0

  for (const article of articles) {
    const result = await addKnowledgeArticle(article, options)

    if (result.success) {
      successCount++
    } else {
      errors.push(`${article.title}: ${result.error}`)
    }
  }

  console.log(`✅ [KNOWLEDGE] Batch complete: ${successCount}/${articles.length} succeeded`)

  return {
    success: errors.length === 0,
    count: successCount,
    errors,
  }
}
