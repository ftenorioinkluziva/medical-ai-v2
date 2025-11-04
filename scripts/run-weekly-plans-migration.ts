/**
 * Execute weekly_plans migration
 */

import { config } from 'dotenv'
import { join } from 'path'

// Load .env.local
config({ path: join(process.cwd(), '.env.local') })

import { db } from '../lib/db/client'
import { sql } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

async function runMigration() {
  try {
    console.log('🚀 Running weekly_plans migration...')

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'lib', 'db', 'migrations', '0002_cute_thunderbolts.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Split into statements
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log(`📋 Executing ${statements.length} statements...`)

    for (const statement of statements) {
      console.log(`\n▶ ${statement.substring(0, 100)}...`)
      await db.execute(sql.raw(statement))
      console.log('✅ Done')
    }

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
