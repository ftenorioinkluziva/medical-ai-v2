#!/usr/bin/env node

/**
 * Production Migration Script
 * Uses Drizzle ORM's migrate() function instead of drizzle-kit CLI
 * This works in production environments where drizzle-kit is not installed
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runMigrations() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set!')
    process.exit(1)
  }

  console.log('🔄 Running database migrations...')

  // Create PostgreSQL connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, // Only need 1 connection for migrations
    connectionTimeoutMillis: 20000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  })

  try {
    // Create Drizzle instance
    const db = drizzle(pool)

    // Get migrations folder path
    const migrationsFolder = resolve(__dirname, '..', 'lib', 'db', 'migrations')
    console.log(`📁 Migrations folder: ${migrationsFolder}`)

    // Run migrations
    await migrate(db, { migrationsFolder })

    console.log('✅ Migrations completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigrations()
