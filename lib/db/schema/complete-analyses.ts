/**
 * Complete Analyses Schema
 * Stores comprehensive multi-agent analysis workflows
 */

import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'
import { analyses } from './analyses'
import { recommendations } from './recommendations'
import { weeklyPlans } from './weekly-plans'

export const completeAnalyses = pgTable('complete_analyses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Documentos analisados
  documentIds: jsonb('document_ids').notNull().$type<string[]>(),

  // IDs das análises individuais dos agentes
  integrativeAnalysisId: uuid('integrative_analysis_id')
    .references(() => analyses.id, { onDelete: 'cascade' }),
  nutritionAnalysisId: uuid('nutrition_analysis_id')
    .references(() => analyses.id, { onDelete: 'cascade' }),
  exerciseAnalysisId: uuid('exercise_analysis_id')
    .references(() => analyses.id, { onDelete: 'cascade' }),

  // Síntese consolidada (gerada por IA)
  synthesis: jsonb('synthesis').$type<{
    executiveSummary: string
    keyFindings: string[]
    criticalAlerts: string[]
    mainRecommendations: string[]
  }>(),

  // IDs dos produtos gerados
  recommendationsId: uuid('recommendations_id')
    .references(() => recommendations.id, { onDelete: 'cascade' }),
  weeklyPlanId: uuid('weekly_plan_id')
    .references(() => weeklyPlans.id, { onDelete: 'cascade' }),

  // Status do workflow
  status: text('status')
    .$type<'pending' | 'analyzing_integrative' | 'analyzing_specialized' | 'generating_synthesis' | 'generating_products' | 'completed' | 'failed'>()
    .notNull()
    .default('pending'),

  // Mensagem de erro (se falhar)
  errorMessage: text('error_message'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
})

export type CompleteAnalysis = typeof completeAnalyses.$inferSelect
export type NewCompleteAnalysis = typeof completeAnalyses.$inferInsert
