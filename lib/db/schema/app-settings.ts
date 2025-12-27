/**
 * App Settings Schema
 * Stores application-wide configuration settings
 */

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const appSettings = pgTable('app_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
