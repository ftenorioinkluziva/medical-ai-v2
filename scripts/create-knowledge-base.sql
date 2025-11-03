-- Create Knowledge Base Tables
-- Medical knowledge articles with vector embeddings for RAG

BEGIN;

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge Articles Table
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Article Info
  title VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),

  -- Content
  content TEXT NOT NULL,
  summary TEXT,

  -- Source
  source VARCHAR(500),
  source_url VARCHAR(1000),
  author VARCHAR(500),
  published_date TIMESTAMP,

  -- Metadata
  tags JSONB DEFAULT '[]',
  language VARCHAR(10) NOT NULL DEFAULT 'pt-BR',

  -- Quality/Relevance
  relevance_score INTEGER,
  is_verified VARCHAR(10) NOT NULL DEFAULT 'pending',

  -- Stats
  usage_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Embeddings Table
CREATE TABLE IF NOT EXISTS knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,

  -- Chunk info
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,

  -- Vector embedding (1536 dimensions for OpenAI text-embedding-3-small)
  embedding vector(1536) NOT NULL,

  -- Metadata
  embedding_model VARCHAR(100) NOT NULL,
  embedding_provider VARCHAR(50) NOT NULL,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_verified ON knowledge_articles(is_verified);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_tags ON knowledge_articles USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_article ON knowledge_embeddings(article_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_vector ON knowledge_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_knowledge_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_knowledge_articles_updated_at
  BEFORE UPDATE ON knowledge_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_articles_updated_at();

-- Verification
SELECT
  'Knowledge base tables created successfully!' as message,
  COUNT(*) as total_articles
FROM knowledge_articles;

COMMIT;

-- Usage example:
-- To add a knowledge article:
/*
INSERT INTO knowledge_articles (title, category, content, summary, source, tags, relevance_score, is_verified)
VALUES (
  'Interpretação de Hemograma Completo',
  'hematology',
  'O hemograma completo é um exame fundamental... [conteúdo completo]',
  'Guia para interpretação de valores do hemograma',
  'Sociedade Brasileira de Hematologia',
  '["hemograma", "hematologia", "interpretação"]',
  10,
  'verified'
);
*/
