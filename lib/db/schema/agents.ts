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
  modelName: varchar('model_name', { length: 100 }).notNull(), // e.g., gemini-2.5-flash, gemini-3-pro-preview
  modelConfig: json('model_config').notNull().$type<{
    // Core parameters
    temperature: number
    topP?: number
    topK?: number
    maxOutputTokens: number

    // Repetition control (NEW - Gemini API)
    presencePenalty?: number    // -2.0 to 2.0, penalizes tokens that have appeared
    frequencyPenalty?: number   // -2.0 to 2.0, penalizes tokens based on frequency

    // Advanced control (NEW - Gemini API)
    stopSequences?: string[]    // Up to 5 sequences that stop generation
    seed?: number              // For reproducibility in testing
  }>(),

  // Extended Reasoning
  useThinkingMode: boolean('use_thinking_mode').notNull().default(false),

  // Complete Analysis Workflow
  analysisRole: varchar('analysis_role', { length: 50 })
    .$type<'foundation' | 'specialized' | 'none'>()
    .notNull()
    .default('none'),
  analysisOrder: integer('analysis_order').default(null),

  // Access Control
  allowedRoles: json('allowed_roles').$type<string[]>().notNull(), // ['patient', 'doctor', 'admin']

  // Knowledge Base Configuration
  knowledgeAccessType: varchar('knowledge_access_type', { length: 20 }).notNull().default('full'), // 'full' | 'restricted'
  allowedAuthors: json('allowed_authors').$type<string[]>().default([]), // Authors the agent can access
  allowedCategories: json('allowed_categories').$type<string[]>().default([]), // Categories the agent can access
  allowedSubcategories: json('allowed_subcategories').$type<string[]>().default([]), // Subcategories the agent can access
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
