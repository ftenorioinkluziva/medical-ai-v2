#!/usr/bin/env node

/**
 * Sync Migration State
 * Marks existing migrations as applied based on database state
 * Use this when migrations table is out of sync with actual database state
 */

import { Pool } from 'pg'
import { readdir, readFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function syncMigrationState() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set!')
    process.exit(1)
  }

  console.log('🔄 Syncing migration state...\n')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 20000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  })

  try {
    // Check if __drizzle_migrations table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = '__drizzle_migrations'
      );
    `)

    if (!tableCheck.rows[0].exists) {
      console.log('📋 Creating __drizzle_migrations table...')
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
          id SERIAL PRIMARY KEY,
          hash text NOT NULL,
          created_at bigint
        );
      `)
    }

    // Get all migration files
    const migrationsFolder = resolve(__dirname, '..', 'lib', 'db', 'migrations')
    const files = await readdir(migrationsFolder)
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort()

    console.log(`📁 Found ${sqlFiles.length} migration files\n`)

    // Check which tables exist
    const existingTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)

    const tableNames = existingTables.rows.map(r => r.table_name)
    console.log('📊 Existing tables:', tableNames.join(', '), '\n')

    // Get already applied migrations
    const appliedMigrations = await pool.query(`
      SELECT hash FROM __drizzle_migrations ORDER BY created_at;
    `)
    const appliedHashes = new Set(appliedMigrations.rows.map(r => r.hash))

    console.log(`✅ Already applied: ${appliedMigrations.rows.length} migrations\n`)

    // Mark migrations as applied if their tables exist
    let markedCount = 0
    for (const file of sqlFiles) {
      const migrationName = file.replace('.sql', '')
      
      // Skip if already marked as applied
      if (appliedHashes.has(migrationName)) {
        console.log(`⏭️  ${file} - Already marked`)
        continue
      }

      // Read migration content to check what tables it creates
      const filePath = resolve(migrationsFolder, file)
      const content = await readFile(filePath, 'utf-8')
      
      // Extract table names from CREATE TABLE statements
      const createTableRegex = /CREATE TABLE [IF NOT EXISTS ]*["']?(\w+)["']?/gi
      const matches = [...content.matchAll(createTableRegex)]
      const tablesInMigration = matches.map(m => m[1].toLowerCase())

      // Check if all tables from this migration exist
      const allTablesExist = tablesInMigration.every(t => 
        tableNames.some(existing => existing.toLowerCase() === t)
      )

      if (allTablesExist && tablesInMigration.length > 0) {
        // Mark migration as applied
        await pool.query(`
          INSERT INTO __drizzle_migrations (hash, created_at) 
          VALUES ($1, $2)
        `, [migrationName, Date.now()])
        
        console.log(`✅ ${file} - Marked as applied (tables exist)`)
        markedCount++
      } else {
        console.log(`⏭️  ${file} - Not marked (tables missing or no tables)`)
      }
    }

    console.log(`\n🎉 Sync complete! Marked ${markedCount} migrations as applied.`)
    process.exit(0)

  } catch (error) {
    console.error('❌ Sync failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

syncMigrationState()
