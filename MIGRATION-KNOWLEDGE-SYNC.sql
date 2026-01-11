-- ============================================================================
-- MIGRATION: Sistema de Sincronização de Conhecimento
-- Data: 09/01/2026
-- Descrição: Adiciona tabelas e índices para sincronização automática
--            entre Base de Conhecimento e Cérebro Lógico
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELAS NOVAS
-- ============================================================================

-- Tabela: knowledge_update_suggestions
-- Armazena sugestões de atualização do Cérebro Lógico
CREATE TABLE IF NOT EXISTS "knowledge_update_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid,
	"article_title" varchar(500),
	"suggestion_type" varchar(50) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_slug" varchar(100),
	"target_id" uuid,
	"suggested_data" jsonb NOT NULL,
	"current_data" jsonb,
	"ai_confidence" varchar(10) NOT NULL,
	"ai_reasoning" text,
	"extraction_metadata" jsonb,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"is_conflict" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'pending',
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_notes" text,
	"applied_by" uuid,
	"applied_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Tabela: sync_audit_log
-- Log de auditoria de todas as mudanças de sincronização
CREATE TABLE IF NOT EXISTS "sync_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"suggestion_id" uuid,
	"action" varchar(50) NOT NULL,
	"target_type" varchar(50),
	"target_slug" varchar(100),
	"target_id" uuid,
	"changes" jsonb,
	"performed_by" uuid,
	"source_article_id" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================================================
-- 2. ADICIONAR CAMPOS EM TABELAS EXISTENTES
-- ============================================================================

-- Adicionar campos de tracking em knowledge_articles
ALTER TABLE "knowledge_articles"
ADD COLUMN IF NOT EXISTS "last_analyzed_at" timestamp,
ADD COLUMN IF NOT EXISTS "analysis_version" varchar(50);

-- Adicionar campos de sync metadata em biomarkers_reference
ALTER TABLE "biomarkers_reference"
ADD COLUMN IF NOT EXISTS "last_synced_from" uuid,
ADD COLUMN IF NOT EXISTS "sync_metadata" jsonb;

-- Adicionar campos de sync metadata em protocols
ALTER TABLE "protocols"
ADD COLUMN IF NOT EXISTS "last_synced_from" uuid,
ADD COLUMN IF NOT EXISTS "sync_metadata" jsonb;

-- ============================================================================
-- 3. CRIAR FOREIGN KEYS
-- ============================================================================

-- Foreign keys para knowledge_update_suggestions
ALTER TABLE "knowledge_update_suggestions"
ADD CONSTRAINT "knowledge_update_suggestions_article_id_knowledge_articles_id_fk"
FOREIGN KEY ("article_id") REFERENCES "public"."knowledge_articles"("id")
ON DELETE cascade ON UPDATE no action;

ALTER TABLE "knowledge_update_suggestions"
ADD CONSTRAINT "knowledge_update_suggestions_reviewed_by_users_id_fk"
FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id")
ON DELETE no action ON UPDATE no action;

ALTER TABLE "knowledge_update_suggestions"
ADD CONSTRAINT "knowledge_update_suggestions_applied_by_users_id_fk"
FOREIGN KEY ("applied_by") REFERENCES "public"."users"("id")
ON DELETE no action ON UPDATE no action;

-- Foreign keys para sync_audit_log
ALTER TABLE "sync_audit_log"
ADD CONSTRAINT "sync_audit_log_suggestion_id_knowledge_update_suggestions_id_fk"
FOREIGN KEY ("suggestion_id") REFERENCES "public"."knowledge_update_suggestions"("id")
ON DELETE set null ON UPDATE no action;

ALTER TABLE "sync_audit_log"
ADD CONSTRAINT "sync_audit_log_performed_by_users_id_fk"
FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id")
ON DELETE no action ON UPDATE no action;

ALTER TABLE "sync_audit_log"
ADD CONSTRAINT "sync_audit_log_source_article_id_knowledge_articles_id_fk"
FOREIGN KEY ("source_article_id") REFERENCES "public"."knowledge_articles"("id")
ON DELETE set null ON UPDATE no action;

-- Foreign keys para biomarkers_reference
ALTER TABLE "biomarkers_reference"
ADD CONSTRAINT "biomarkers_reference_last_synced_from_knowledge_articles_id_fk"
FOREIGN KEY ("last_synced_from") REFERENCES "public"."knowledge_articles"("id")
ON DELETE no action ON UPDATE no action;

-- Foreign keys para protocols
ALTER TABLE "protocols"
ADD CONSTRAINT "protocols_last_synced_from_knowledge_articles_id_fk"
FOREIGN KEY ("last_synced_from") REFERENCES "public"."knowledge_articles"("id")
ON DELETE no action ON UPDATE no action;

-- ============================================================================
-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para knowledge_update_suggestions
CREATE INDEX IF NOT EXISTS "idx_suggestions_status"
ON "knowledge_update_suggestions"("status");

CREATE INDEX IF NOT EXISTS "idx_suggestions_priority"
ON "knowledge_update_suggestions"("priority");

CREATE INDEX IF NOT EXISTS "idx_suggestions_article"
ON "knowledge_update_suggestions"("article_id");

CREATE INDEX IF NOT EXISTS "idx_suggestions_target"
ON "knowledge_update_suggestions"("target_slug");

CREATE INDEX IF NOT EXISTS "idx_suggestions_type"
ON "knowledge_update_suggestions"("suggestion_type");

CREATE INDEX IF NOT EXISTS "idx_suggestions_created"
ON "knowledge_update_suggestions"("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_suggestions_reviewed_by"
ON "knowledge_update_suggestions"("reviewed_by");

-- Índices para sync_audit_log
CREATE INDEX IF NOT EXISTS "idx_audit_action"
ON "sync_audit_log"("action");

CREATE INDEX IF NOT EXISTS "idx_audit_target"
ON "sync_audit_log"("target_slug");

CREATE INDEX IF NOT EXISTS "idx_audit_user"
ON "sync_audit_log"("performed_by");

CREATE INDEX IF NOT EXISTS "idx_audit_date"
ON "sync_audit_log"("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_audit_suggestion"
ON "sync_audit_log"("suggestion_id");

-- Índices para knowledge_articles (tracking)
CREATE INDEX IF NOT EXISTS "idx_articles_last_analyzed"
ON "knowledge_articles"("last_analyzed_at");

-- ============================================================================
-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE "knowledge_update_suggestions" IS
'Armazena sugestões de atualização do Cérebro Lógico baseadas na análise automática da Base de Conhecimento';

COMMENT ON TABLE "sync_audit_log" IS
'Log de auditoria de todas as mudanças aplicadas ao Cérebro Lógico via sincronização';

COMMENT ON COLUMN "knowledge_update_suggestions"."suggestion_type" IS
'Tipo: biomarker_update, biomarker_create, protocol_update, protocol_create';

COMMENT ON COLUMN "knowledge_update_suggestions"."priority" IS
'Prioridade: critical, high, medium, low';

COMMENT ON COLUMN "knowledge_update_suggestions"."status" IS
'Status: pending, approved, rejected, applied, modified';

COMMENT ON COLUMN "knowledge_update_suggestions"."ai_confidence" IS
'Nível de confiança da IA: high, medium, low';

-- ============================================================================
-- 6. VERIFICAÇÃO
-- ============================================================================

-- Verificar se tabelas foram criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('knowledge_update_suggestions', 'sync_audit_log');

-- Verificar se colunas foram adicionadas
SELECT column_name, table_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('knowledge_articles', 'biomarkers_reference', 'protocols')
AND column_name IN ('last_analyzed_at', 'analysis_version', 'last_synced_from', 'sync_metadata');

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Para executar esta migration manualmente:
-- psql $DATABASE_URL -f MIGRATION-KNOWLEDGE-SYNC.sql
