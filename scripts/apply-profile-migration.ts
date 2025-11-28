import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'

async function applyMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('🔌 Connected to database')

    // Apply migration 0007
    await client.query(`
      ALTER TABLE medical_profiles
      ADD COLUMN IF NOT EXISTS handgrip_strength real
    `)
    console.log('✅ Added handgrip_strength column')

    await client.query(`
      ALTER TABLE medical_profiles
      ADD COLUMN IF NOT EXISTS sit_to_stand_time real
    `)
    console.log('✅ Added sit_to_stand_time column')

    console.log('✅ Migration applied successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

applyMigration()
