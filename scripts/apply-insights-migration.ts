/**
 * Apply insights and actionItems migration
 */

import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'

async function applyMigration() {
  try {
    console.log('🔄 Applying insights and actionItems migration...\n')

    // Add insights column
    console.log('Adding insights column...')
    await db.execute(sql`
      ALTER TABLE "analyses" ADD COLUMN IF NOT EXISTS "insights" json;
    `)
    console.log('✅ insights column added')

    // Add action_items column
    console.log('Adding action_items column...')
    await db.execute(sql`
      ALTER TABLE "analyses" ADD COLUMN IF NOT EXISTS "action_items" json;
    `)
    console.log('✅ action_items column added')

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

applyMigration()
