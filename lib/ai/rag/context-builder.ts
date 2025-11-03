/**
 * RAG Context Builder
 * Builds context from retrieved documents for AI analysis
 */

import { searchSimilarDocuments } from './vector-search'
import { db } from '@/lib/db/client'
import { documents } from '@/lib/db/schema'
import { eq, inArray, sql } from 'drizzle-orm'

export interface RAGContext {
  contextText: string
  sources: Array<{
    documentId: string
    documentName: string
    similarity: number
    excerpt: string
  }>
  stats: {
    documentsUsed: number
    chunksUsed: number
    totalChars: number
  }
}

/**
 * Build RAG context from user's documents based on query
 */
export async function buildRAGContext(
  query: string,
  userId: string,
  options: {
    maxChunks?: number
    similarityThreshold?: number
    maxContextLength?: number
    provider?: 'google' | 'openai'
  } = {}
): Promise<RAGContext> {
  const {
    maxChunks = 10,
    similarityThreshold = 0.7,
    maxContextLength = 8000, // Characters
    provider = 'openai',
  } = options

  console.log(`🔨 [RAG-CONTEXT] Building context for query: "${query.substring(0, 50)}..."`)

  // Search for similar document chunks
  const searchResults = await searchSimilarDocuments(query, {
    userId,
    limit: maxChunks,
    threshold: similarityThreshold,
    provider,
  })

  if (searchResults.length === 0) {
    console.log('⚠️ [RAG-CONTEXT] No relevant documents found')
    return {
      contextText: '',
      sources: [],
      stats: {
        documentsUsed: 0,
        chunksUsed: 0,
        totalChars: 0,
      },
    }
  }

  // Get document metadata
  const documentIds = [...new Set(searchResults.map(r => r.documentId))]
  const docsMetadata = await db
    .select()
    .from(documents)
    .where(inArray(documents.id, documentIds))

  const docMap = new Map(docsMetadata.map(d => [d.id, d]))

  // Build context text with sources
  const contextParts: string[] = []
  const sources: RAGContext['sources'] = []
  let totalChars = 0

  for (const result of searchResults) {
    const doc = docMap.get(result.documentId)
    if (!doc) continue

    // Add chunk with source reference
    const chunkText = result.content.trim()
    const chunkLength = chunkText.length

    // Check if adding this chunk would exceed max length
    if (totalChars + chunkLength > maxContextLength) {
      console.log(`⚠️ [RAG-CONTEXT] Reached max context length (${maxContextLength} chars)`)
      break
    }

    contextParts.push(`
### Documento: ${doc.fileName} (Relevância: ${(result.similarity * 100).toFixed(0)}%)
${chunkText}
`)

    totalChars += chunkLength

    // Add to sources (avoid duplicates)
    if (!sources.find(s => s.documentId === result.documentId)) {
      sources.push({
        documentId: result.documentId,
        documentName: doc.fileName,
        similarity: result.similarity,
        excerpt: chunkText.substring(0, 200) + (chunkText.length > 200 ? '...' : ''),
      })
    }
  }

  const contextText = contextParts.join('\n---\n')

  console.log(`✅ [RAG-CONTEXT] Built context with ${sources.length} documents, ${contextParts.length} chunks, ${totalChars} chars`)

  return {
    contextText,
    sources,
    stats: {
      documentsUsed: sources.length,
      chunksUsed: contextParts.length,
      totalChars,
    },
  }
}

/**
 * Build context from specific documents (for document-specific analysis)
 */
export async function buildDocumentContext(
  documentIds: string[],
  userId: string,
  options: {
    maxChunks?: number
    maxContextLength?: number
  } = {}
): Promise<RAGContext> {
  const {
    maxChunks = 20,
    maxContextLength = 12000,
  } = options

  console.log(`🔨 [RAG-CONTEXT] Building context from ${documentIds.length} specific documents`)

  // Get documents metadata
  const docsMetadata = await db
    .select()
    .from(documents)
    .where(inArray(documents.id, documentIds))

  if (docsMetadata.length === 0) {
    return {
      contextText: '',
      sources: [],
      stats: {
        documentsUsed: 0,
        chunksUsed: 0,
        totalChars: 0,
      },
    }
  }

  // Get all chunks for these documents
  const chunks = await db.execute(sql`
    SELECT
      id,
      document_id,
      content,
      chunk_index,
      metadata
    FROM document_embeddings
    WHERE
      document_id = ANY(${documentIds})
      AND user_id = ${userId}
    ORDER BY document_id, chunk_index
    LIMIT ${maxChunks}
  `)

  const docMap = new Map(docsMetadata.map(d => [d.id, d]))

  // Build context
  const contextParts: string[] = []
  const sources: RAGContext['sources'] = []
  let totalChars = 0

  for (const row of chunks.rows as any[]) {
    const doc = docMap.get(row.document_id)
    if (!doc) continue

    const chunkText = row.content.trim()
    const chunkLength = chunkText.length

    if (totalChars + chunkLength > maxContextLength) {
      break
    }

    contextParts.push(`
### Documento: ${doc.fileName}
${chunkText}
`)

    totalChars += chunkLength

    if (!sources.find(s => s.documentId === row.document_id)) {
      sources.push({
        documentId: row.document_id,
        documentName: doc.fileName,
        similarity: 1.0, // Direct inclusion, not similarity-based
        excerpt: chunkText.substring(0, 200) + (chunkText.length > 200 ? '...' : ''),
      })
    }
  }

  const contextText = contextParts.join('\n---\n')

  console.log(`✅ [RAG-CONTEXT] Built context with ${sources.length} documents, ${contextParts.length} chunks`)

  return {
    contextText,
    sources,
    stats: {
      documentsUsed: sources.length,
      chunksUsed: contextParts.length,
      totalChars,
    },
  }
}
