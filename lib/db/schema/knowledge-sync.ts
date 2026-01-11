import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core'
import { knowledgeArticles } from './knowledge-base'
import { users } from './users'
import { protocols } from './medical-knowledge'

/**
 * Knowledge Update Suggestions
 * Armazena sugestões de atualização do Cérebro Lógico baseadas na Base de Conhecimento
 */
export const knowledgeUpdateSuggestions = pgTable('knowledge_update_suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Origem da sugestão
  articleId: uuid('article_id').references(() => knowledgeArticles.id, { onDelete: 'cascade' }),
  articleTitle: varchar('article_title', { length: 500 }),

  // Tipo de sugestão
  suggestionType: varchar('suggestion_type', { length: 50 }).notNull(),
  // 'biomarker_update' | 'biomarker_create' | 'protocol_update' | 'protocol_create'

  // Alvo da atualização
  targetType: varchar('target_type', { length: 50 }).notNull(), // 'biomarker' | 'protocol'
  targetSlug: varchar('target_slug', { length: 100 }), // slug do biomarcador/protocolo (se existir)
  targetId: uuid('target_id'), // ID do protocolo (se for update de protocolo)

  // Dados sugeridos pela IA
  suggestedData: jsonb('suggested_data').notNull(),
  /* Estrutura para biomarker:
  {
    "slug": "vitamina_d3",
    "name": "Vitamina D3",
    "optimalMin": 70,
    "optimalMax": 90,
    "labMin": 20,
    "labMax": 100,
    "unit": "ng/mL",
    "clinicalInsight": "...",
    "sourceRef": "..."
  }
  */

  // Dados atuais (para comparação)
  currentData: jsonb('current_data'),
  /* Mesma estrutura, null se for criação */

  // Metadados da IA
  aiConfidence: varchar('ai_confidence', { length: 10 }).notNull(), // 'high' | 'medium' | 'low'
  aiReasoning: text('ai_reasoning'), // Explicação da IA sobre por que sugerir
  extractionMetadata: jsonb('extraction_metadata'), // Detalhes da extração (modelo usado, etc)

  // Priorização
  priority: varchar('priority', { length: 10 }).notNull().default('medium'),
  // 'critical' | 'high' | 'medium' | 'low'
  isConflict: boolean('is_conflict').default(false), // true se há valores conflitantes

  // Status e aprovação
  status: varchar('status', { length: 20 }).default('pending'),
  // 'pending' | 'approved' | 'rejected' | 'applied' | 'modified'

  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),

  appliedBy: uuid('applied_by').references(() => users.id),
  appliedAt: timestamp('applied_at'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * Sync Audit Log
 * Registro de auditoria de todas as mudanças de sincronização
 */
export const syncAuditLog = pgTable('sync_audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Referência
  suggestionId: uuid('suggestion_id').references(() => knowledgeUpdateSuggestions.id, { onDelete: 'set null' }),

  // Ação realizada
  action: varchar('action', { length: 50 }).notNull(),
  // 'suggestion_created' | 'suggestion_approved' | 'suggestion_rejected' |
  // 'biomarker_updated' | 'biomarker_created' | 'protocol_updated' | 'protocol_created'

  // Dados da ação
  targetType: varchar('target_type', { length: 50 }), // 'biomarker' | 'protocol'
  targetSlug: varchar('target_slug', { length: 100 }),
  targetId: uuid('target_id'),

  // Mudanças realizadas
  changes: jsonb('changes'), // { before: {...}, after: {...} }

  // Quem fez
  performedBy: uuid('performed_by').references(() => users.id),

  // Contexto
  sourceArticleId: uuid('source_article_id').references(() => knowledgeArticles.id, { onDelete: 'set null' }),
  notes: text('notes'),

  // Timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Types
export type KnowledgeUpdateSuggestion = typeof knowledgeUpdateSuggestions.$inferSelect
export type NewKnowledgeUpdateSuggestion = typeof knowledgeUpdateSuggestions.$inferInsert
export type SyncAuditLog = typeof syncAuditLog.$inferSelect
export type NewSyncAuditLog = typeof syncAuditLog.$inferInsert
