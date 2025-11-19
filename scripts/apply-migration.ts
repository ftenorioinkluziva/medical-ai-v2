/**
 * Apply migration script
 * Applies the medical knowledge migration to the database
 */

import { db } from '../lib/db/client'
import { sql } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

async function applyMigration() {
  console.log('📦 Applying Medical Knowledge migration...\n')

  try {
    const migrationPath = path.join(__dirname, '..', 'lib', 'db', 'migrations', '0003_grey_captain_marvel.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log(`Found ${statements.length} SQL statements to execute\n`)

    for (let i = 0; i < statements.length; i++) {
      console.log(`Executing statement ${i + 1}/${statements.length}...`)
      await db.execute(sql.raw(statements[i]))
      console.log(`✅ Statement ${i + 1} executed successfully`)
    }

    console.log('\n✅ Migration applied successfully!')
  } catch (error: any) {
    if (error?.message?.includes('already exists')) {
      console.log('ℹ️  Tables already exist, skipping migration')
    } else {
      console.error('❌ Error applying migration:', error)
      process.exit(1)
    }
  }
}

applyMigration()
  .then(() => {
    console.log('\n🎉 Migration process finished!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
