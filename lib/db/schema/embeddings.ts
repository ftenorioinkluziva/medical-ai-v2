import { pgTable, uuid, text, integer, varchar, timestamp, vector } from 'drizzle-orm/pg-core'
import { users } from './users'
import { documents } from './documents'

// Document Embeddings table (for RAG with pgvector)
export const documentEmbeddings = pgTable('document_embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Content chunk
  content: text('content').notNull(),

  // Embedding vector (pgvector)
  // text-embedding-3-small (OpenAI) = 1536 dimensions
  // text-embedding-ada-002 (OpenAI) = 1536 dimensions
  // textembedding-gecko (Google) = 768 dimensions
  embedding: vector('embedding', { dimensions: 1536 }),

  // Metadata for filtering
  chunkIndex: integer('chunk_index').notNull(),
  documentType: varchar('document_type', { length: 100 }),
  category: varchar('category', { length: 100 }), // e.g., Hematology, Lipids, Hormones, etc

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Note: After creating the table, you need to create the HNSW index for vector similarity search:
// CREATE INDEX ON document_embeddings USING hnsw (embedding vector_cosine_ops);
