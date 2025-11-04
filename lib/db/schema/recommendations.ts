import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'
import { analyses } from './analyses'

export const recommendations = pgTable('recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  analysisId: uuid('analysis_id')
    .notNull()
    .references(() => analyses.id, { onDelete: 'cascade' }),
  examRecommendations: jsonb('exam_recommendations').notNull(),
  lifestyleRecommendations: jsonb('lifestyle_recommendations').notNull(),
  healthGoals: jsonb('health_goals').notNull(),
  alerts: jsonb('alerts').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Recommendation = typeof recommendations.$inferSelect
export type NewRecommendation = typeof recommendations.$inferInsert
