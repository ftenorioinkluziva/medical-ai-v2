/**
 * Apply app_settings migration directly
 */

import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'

async function applyMigration() {
  console.log('🔄 Creating app_settings table...')

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "app_settings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "key" text NOT NULL,
        "value" text NOT NULL,
        "description" text,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "app_settings_key_unique" UNIQUE("key")
      )
    `)

    console.log('✅ Table app_settings created successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating table:', error)
    process.exit(1)
  }
}

applyMigration()
