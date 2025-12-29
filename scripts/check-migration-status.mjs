/**
 * Check Migration Status
 * Verifies if the migration 0010 columns exist
 */

import 'dotenv/config'
import pkg from 'pg'
const { Pool } = pkg

async function checkStatus() {
  console.log('🔍 Checking migration status...\n')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    // Check database connection
    console.log('📡 Testing database connection...')
    const testQuery = await pool.query('SELECT current_database(), current_user')
    console.log(`✅ Connected to database: ${testQuery.rows[0].current_database}`)
    console.log(`👤 User: ${testQuery.rows[0].current_user}\n`)

    // Check if health_agents table exists
    console.log('📊 Checking health_agents table...')
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'health_agents'
      ) as exists
    `)

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table health_agents does not exist!')
      return
    }
    console.log('✅ Table health_agents exists\n')

    // Check all columns in health_agents
    console.log('📋 Current columns in health_agents:')
    const columnsQuery = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'health_agents'
      ORDER BY ordinal_position
    `)

    columnsQuery.rows.forEach((row) => {
      const marker = ['allowed_authors', 'allowed_subcategories'].includes(row.column_name) ? '🆕' : '  '
      console.log(`${marker} ${row.column_name} (${row.data_type})`)
    })

    // Specific check for new columns
    console.log('\n🎯 Migration 0010 columns:')
    const newColumnsCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'health_agents'
        AND column_name IN ('allowed_authors', 'allowed_subcategories')
    `)

    const existingNewColumns = newColumnsCheck.rows.map(r => r.column_name)

    console.log('- allowed_authors:', existingNewColumns.includes('allowed_authors') ? '✅ EXISTS' : '❌ MISSING')
    console.log('- allowed_subcategories:', existingNewColumns.includes('allowed_subcategories') ? '✅ EXISTS' : '❌ MISSING')

    if (existingNewColumns.length === 2) {
      console.log('\n✅ Migration 0010 is already applied!')
    } else {
      console.log('\n❌ Migration 0010 needs to be applied!')
      console.log('\n📝 Run this SQL to apply the migration:')
      console.log('--------------------------------------------------')
      console.log('ALTER TABLE "health_agents" ADD COLUMN "allowed_authors" json DEFAULT \'[]\'::json;')
      console.log('ALTER TABLE "health_agents" ADD COLUMN "allowed_subcategories" json DEFAULT \'[]\'::json;')
      console.log('--------------------------------------------------')
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

checkStatus()
  .then(() => {
    console.log('\n✅ Check completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error)
    process.exit(1)
  })
