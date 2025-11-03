/**
 * RAG (Retrieval-Augmented Generation) - Central Export
 */

export * from './vector-search'
export * from './context-builder'

// Re-export main functions
export {
  searchSimilarDocuments,
  searchWithinDocument,
  getUserDocumentCount,
} from './vector-search'

export {
  buildRAGContext,
  buildDocumentContext,
} from './context-builder'
