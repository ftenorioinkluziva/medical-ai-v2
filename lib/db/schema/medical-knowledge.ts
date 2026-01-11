import { pgTable, uuid, varchar, text, decimal, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { knowledgeArticles } from './knowledge-base'

/**
 * Tabela de Referência de Biomarcadores
 * Armazena as faixas ideais (funcionais) vs laboratoriais.
 */
export const biomarkersReference = pgTable('biomarkers_reference', {
  slug: varchar('slug', { length: 100 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  category: varchar('category', { length: 100 }),
  unit: varchar('unit', { length: 50 }),
  optimalMin: decimal('optimal_min', { precision: 10, scale: 2 }),
  optimalMax: decimal('optimal_max', { precision: 10, scale: 2 }),
  labMin: decimal('lab_min', { precision: 10, scale: 2 }),
  labMax: decimal('lab_max', { precision: 10, scale: 2 }),
  clinicalInsight: text('clinical_insight'),
  metaphor: text('metaphor'),
  sourceRef: varchar('source_ref', { length: 200 }),
  updatedAt: timestamp('updated_at').defaultNow(),

  // Sync metadata
  lastSyncedFrom: uuid('last_synced_from').references(() => knowledgeArticles.id), // Artigo que originou última atualização
  syncMetadata: jsonb('sync_metadata'), // { suggestedBy, approvedBy, confidence, etc }
})

/**
 * Métricas Calculadas
 * Fórmulas matemáticas que o sistema deve processar.
 */
export const calculatedMetrics = pgTable('calculated_metrics', {
  slug: varchar('slug', { length: 100 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  formula: varchar('formula', { length: 500 }).notNull(),
  targetMax: decimal('target_max', { precision: 10, scale: 2 }),
  targetMin: decimal('target_min', { precision: 10, scale: 2 }),
  riskInsight: text('risk_insight'),
  sourceRef: varchar('source_ref', { length: 200 }),
})

/**
 * Protocolos e Ações
 * O "O que fazer" baseado em gatilhos.
 */
export const protocols = pgTable('protocols', {
  id: uuid('id').defaultRandom().primaryKey(),
  triggerCondition: varchar('trigger_condition', { length: 500 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  dosage: varchar('dosage', { length: 200 }),
  sourceRef: varchar('source_ref', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // Sync metadata
  lastSyncedFrom: uuid('last_synced_from').references(() => knowledgeArticles.id), // Artigo que originou última atualização
  syncMetadata: jsonb('sync_metadata'), // { suggestedBy, approvedBy, confidence, etc }
})
