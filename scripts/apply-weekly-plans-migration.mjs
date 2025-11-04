/**
 * Apply weekly_plans migration
 */

import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
config({ path: join(__dirname, '..', '.env.local') })

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function runMigration() {
  const client = await pool.connect()

  try {
    console.log('🚀 Running weekly_plans migration...')

    // Read migration file
    const migrationPath = join(__dirname, '..', 'lib', 'db', 'migrations', '0002_cute_thunderbolts.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    // Split statements
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log(`📋 Found ${statements.length} statements to execute`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`\n[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 80)}...`)

      try {
        await client.query(statement)
        console.log('✅ Success')
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log('⚠️  Already exists, skipping')
        } else {
          console.log('❌ Error:', error.message)
        }
      }
    }

    console.log('\n✅ Migration completed!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
