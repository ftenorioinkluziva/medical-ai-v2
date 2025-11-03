/**
 * Knowledge Base Module
 * Medical knowledge base with semantic search
 */

export * from './search'
export * from './add-article'

// Re-export main functions
export { searchKnowledgeBase, buildKnowledgeContext, getKnowledgeStats } from './search'
export { addKnowledgeArticle, addKnowledgeArticlesBatch } from './add-article'
