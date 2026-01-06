import { pgTable, uuid, varchar, timestamp, text, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'

/**
 * API Keys Table
 * For programmatic access to the API (N8N, automation, etc.)
 */
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),

  // User who owns this API key
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // The actual API key (hashed)
  keyHash: varchar('key_hash', { length: 255 }).notNull().unique(),

  // Prefix for identification (first 8 chars of original key)
  keyPrefix: varchar('key_prefix', { length: 16 }).notNull(),

  // Optional name/description
  name: varchar('name', { length: 255 }),

  // Optional description
  description: text('description'),

  // Is this key active?
  isActive: boolean('is_active').notNull().default(true),

  // Last time this key was used
  lastUsedAt: timestamp('last_used_at'),

  // Optional expiration date
  expiresAt: timestamp('expires_at'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
