import { pgTable, uuid, json, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

/**
 * Logical Analyses table
 * Stores cached results from Logical Brain (deterministic analysis)
 */
export const logicalAnalyses = pgTable('logical_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Documents that were analyzed
  documentIds: json('document_ids').$type<string[]>().notNull(),

  // Logical Brain Results
  biomarkers: json('biomarkers').notNull(), // BiomarkerEvaluation[]
  metrics: json('metrics').notNull(), // MetricCalculation[]
  protocols: json('protocols').notNull(), // TriggeredProtocol[]
  summary: json('summary').notNull(), // Analysis summary

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
