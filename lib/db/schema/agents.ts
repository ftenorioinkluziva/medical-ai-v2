import { pgTable, uuid, varchar, text, json, boolean, integer, timestamp } from 'drizzle-orm/pg-core'

// Health Agents configuration table
export const healthAgents = pgTable('health_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentKey: varchar('agent_key', { length: 100 }).notNull().unique(), // e.g., integrativa, endocrinologia

  // Display Info
  name: varchar('name', { length: 255 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),

  // UI
  color: varchar('color', { length: 50 }).notNull(), // green, purple, blue, orange
  icon: varchar('icon', { length: 100 }).notNull(), // lucide icon name

  // AI Configuration
  systemPrompt: text('system_prompt').notNull(),
  analysisPrompt: text('analysis_prompt').notNull(),

  // Model Config
  modelName: varchar('model_name', { length: 100 }).notNull(), // e.g., gemini-2.5-flash, gpt-4o
  modelConfig: json('model_config').notNull().$type<{
    temperature: number
    topP?: number
    topK?: number
    maxOutputTokens: number
  }>(),

  // Access Control
  allowedRoles: json('allowed_roles').$type<string[]>().notNull(), // ['patient', 'doctor', 'admin']

  // Knowledge Base Configuration
  knowledgeAccessType: varchar('knowledge_access_type', { length: 20 }).notNull().default('full'), // 'full' | 'restricted'
  allowedCategories: json('allowed_categories').$type<string[]>().default([]), // Categories the agent can access
  excludedArticleIds: json('excluded_article_ids').$type<string[]>().default([]), // Specific articles to exclude
  includedArticleIds: json('included_article_ids').$type<string[]>().default([]), // Specific articles to include

  // Status
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Type for health agent
export type HealthAgent = typeof healthAgents.$inferSelect
