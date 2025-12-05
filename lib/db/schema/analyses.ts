import { pgTable, uuid, text, json, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { healthAgents } from './agents'

// Analyses table - stores complete agent analyses
export const analyses = pgTable('analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => healthAgents.id),

  // Input context
  documentIds: json('document_ids').$type<string[]>(),
  prompt: text('prompt'),
  medicalProfileSnapshot: json('medical_profile_snapshot'), // snapshot of profile at analysis time

  // Output
  analysis: text('analysis').notNull(),
  insights: json('insights').$type<string[]>(), // Structured key insights
  actionItems: json('action_items').$type<string[]>(), // Actionable recommendations

  // Metadata
  modelUsed: varchar('model_used', { length: 100 }),
  tokensUsed: integer('tokens_used'),
  processingTimeMs: integer('processing_time_ms'),
  ragUsed: boolean('rag_used').default(false),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Chat Messages table - stores chat conversation with agents
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => healthAgents.id),

  // Message content
  role: varchar('role', { length: 50 }).notNull(), // user, assistant, system
  content: text('content').notNull(),

  // Context - optional link to analysis
  analysisId: uuid('analysis_id').references(() => analyses.id),

  // Metadata
  modelUsed: varchar('model_used', { length: 100 }),
  tokensUsed: integer('tokens_used'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
