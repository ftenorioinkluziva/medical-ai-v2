/**
 * Apply Migration 0010 - Add allowed_authors and allowed_subcategories
 * This script safely adds the new columns to health_agents table
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
const { Pool } = pkg

async function applyMigration() {
  console.log('🔄 Applying migration 0010...')
  console.log('📝 Adding allowed_authors and allowed_subcategories to health_agents table\n')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const db = drizzle(pool)

  try {
    // Check if columns already exist
    const checkColumnsQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'health_agents'
        AND column_name IN ('allowed_authors', 'allowed_subcategories')
    `

    const existingColumns = await pool.query(checkColumnsQuery)
    const existingColumnNames = existingColumns.rows.map((row) => row.column_name)

    console.log('Checking existing columns...')
    console.log('- allowed_authors:', existingColumnNames.includes('allowed_authors') ? '✅ exists' : '❌ missing')
    console.log('- allowed_subcategories:', existingColumnNames.includes('allowed_subcategories') ? '✅ exists' : '❌ missing')
    console.log('')

    let changesApplied = false

    // Add allowed_authors if it doesn't exist
    if (!existingColumnNames.includes('allowed_authors')) {
      console.log('Adding allowed_authors column...')
      await pool.query(`
        ALTER TABLE "health_agents"
        ADD COLUMN "allowed_authors" json DEFAULT '[]'::json
      `)
      console.log('✅ allowed_authors column added successfully\n')
      changesApplied = true
    } else {
      console.log('⏭️  allowed_authors already exists, skipping\n')
    }

    // Add allowed_subcategories if it doesn't exist
    if (!existingColumnNames.includes('allowed_subcategories')) {
      console.log('Adding allowed_subcategories column...')
      await pool.query(`
        ALTER TABLE "health_agents"
        ADD COLUMN "allowed_subcategories" json DEFAULT '[]'::json
      `)
      console.log('✅ allowed_subcategories column added successfully\n')
      changesApplied = true
    } else {
      console.log('⏭️  allowed_subcategories already exists, skipping\n')
    }

    if (changesApplied) {
      console.log('✅ Migration 0010 applied successfully!')
      console.log('📊 New columns have been added to the health_agents table')
    } else {
      console.log('✅ Migration 0010 already applied!')
      console.log('📊 All columns are already present')
    }

    // Verify final state
    console.log('\n🔍 Final verification:')
    const finalCheck = await pool.query(`
      SELECT
        column_name,
        data_type,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'health_agents'
        AND column_name IN ('allowed_authors', 'allowed_subcategories')
      ORDER BY column_name
    `)

    finalCheck.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type} (default: ${row.column_default})`)
    })

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

applyMigration()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
