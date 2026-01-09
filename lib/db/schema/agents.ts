import { pgTable, uuid, varchar, text, json, jsonb, boolean, integer, timestamp } from 'drizzle-orm/pg-core'

// Health Agents configuration table
export const healthAgents = pgTable('health_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentKey: varchar('agent_key', { length: 100 }).notNull().unique(), // e.g., integrativa, endocrinologia

  // Agent Type (analysis agents vs product generators)
  agentType: varchar('agent_type', { length: 50 })
    .$type<'analysis' | 'product_generator'>()
    .notNull()
    .default('analysis'),

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

  // Complete Analysis Workflow (for analysis agents)
  analysisRole: varchar('analysis_role', { length: 50 })
    .$type<'foundation' | 'specialized' | 'none'>()
    .notNull()
    .default('none'),
  analysisOrder: integer('analysis_order'),

  // Product Generator Configuration (for product_generator agents)
  productType: varchar('product_type', { length: 50 })
    .$type<'weekly_plan' | 'recommendations' | null>(), // null for analysis agents
  generatorKey: varchar('generator_key', { length: 100 }).unique(), // supplementation, shopping, meals, workout, recommendations
  outputSchema: jsonb('output_schema').$type<Record<string, any> | null>(), // JSON Schema for validation
  displayConfig: jsonb('display_config').$type<DisplayConfig | null>(), // UI rendering configuration
  ragConfig: jsonb('rag_config').$type<{
    enabled: boolean
    keywords: string[]
    maxChunks: number
    maxCharsPerChunk: number
  } | null>(),
  executionOrder: integer('execution_order'), // Order of execution for product generators

  // Context Configuration (Grandular input control)
  contextConfig: jsonb('context_config').$type<{
    includeMedicalProfile: boolean
    includeDocuments: boolean // Raw document text
    includeStructuredData: boolean // JSON structured data from 'Logical Brain'
    includeRagContext: boolean // RAG search results
    includePreviousAnalysis: boolean // For specialized agents, include Foundation analysis
  }>().default({
    includeMedicalProfile: true,
    includeDocuments: true,
    includeStructuredData: true,
    includeRagContext: true,
    includePreviousAnalysis: true // Default true for specialized
  }),

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

// Type aliases for specific configurations
export type AgentType = 'analysis' | 'product_generator'
export type ProductType = 'weekly_plan' | 'recommendations'
export type AnalysisRole = 'foundation' | 'specialized' | 'none'

export type RAGConfig = {
  enabled: boolean
  keywords: string[]
  maxChunks: number
  maxCharsPerChunk: number
}

export type JSONSchemaDefinition = Record<string, any>

// Display Configuration Types for Schema-Driven UI
export type FieldDisplayType =
  | 'text'
  | 'list'
  | 'card'
  | 'table'
  | 'timeline'
  | 'pills'
  | 'badge'
  | 'grid'
  | 'accordion'
  | 'checklist'

export type FieldLayout = 'grid' | 'list' | 'tabs' | 'accordion' | 'timeline'

export type FieldConfig = {
  label?: string
  icon?: string // Lucide icon name
  color?: string // Tailwind color name
  displayType?: FieldDisplayType
  order?: number
  visible?: boolean
  collapsible?: boolean
  columns?: number // for grid layouts
  layout?: FieldLayout
  nested?: Record<string, FieldConfig>
}

export type DisplayConfig = {
  title?: string
  description?: string
  layout?: FieldLayout
  fields: Record<string, FieldConfig>
}
