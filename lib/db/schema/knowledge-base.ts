import { pgTable, uuid, varchar, text, timestamp, vector, integer, json } from 'drizzle-orm/pg-core'

/**
 * Knowledge Base Articles
 * Medical knowledge, research papers, guidelines, etc.
 */
export const knowledgeArticles = pgTable('knowledge_articles', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Article Info
  title: varchar('title', { length: 500 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(), // hematology, endocrinology, nutrition, etc.
  subcategory: varchar('subcategory', { length: 100 }),

  // Content
  content: text('content').notNull(),
  summary: text('summary'),

  // Source
  source: varchar('source', { length: 500 }), // Journal name, website, etc.
  sourceUrl: varchar('source_url', { length: 1000 }),
  author: varchar('author', { length: 500 }),
  publishedDate: timestamp('published_date'),

  // Metadata
  tags: json('tags').$type<string[]>(), // Array of tags
  language: varchar('language', { length: 10 }).notNull().default('pt-BR'),

  // Quality/Relevance
  relevanceScore: integer('relevance_score'), // 1-10, manually curated
  isVerified: varchar('is_verified', { length: 10 }).notNull().default('pending'), // verified, pending, rejected

  // Stats
  usageCount: integer('usage_count').notNull().default(0), // How many times used in analyses

  // Sync tracking
  lastAnalyzedAt: timestamp('last_analyzed_at'), // Última análise para sincronização
  analysisVersion: varchar('analysis_version', { length: 50 }), // Versão do analyzer usado

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * Knowledge Base Embeddings
 * Vector embeddings for semantic search
 */
export const knowledgeEmbeddings = pgTable('knowledge_embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id')
    .notNull()
    .references(() => knowledgeArticles.id, { onDelete: 'cascade' }),

  // Chunk info
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),

  // Vector embedding (768 for Google text-embedding-004)
  // Changed from 1536 (OpenAI) to 768 (Google) for cost savings
  embedding: vector('embedding', { dimensions: 768 }).notNull(),

  // Metadata
  embeddingModel: varchar('embedding_model', { length: 100 }).notNull(),
  embeddingProvider: varchar('embedding_provider', { length: 50 }).notNull(),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Types
export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect
export type NewKnowledgeArticle = typeof knowledgeArticles.$inferInsert
export type KnowledgeEmbedding = typeof knowledgeEmbeddings.$inferSelect
