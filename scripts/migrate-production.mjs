#!/usr/bin/env node

/**
 * Production Migration Script
 *
 * Run database migrations against production database
 *
 * Usage:
 *   node scripts/migrate-production.mjs
 *
 * Make sure .env.local has the production DATABASE_URL
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { execSync } from 'child_process'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

console.log('🚀 Running migrations against production database...')
console.log(`📍 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'unknown'}`)

try {
  execSync('pnpm exec drizzle-kit migrate', {
    stdio: 'inherit',
    env: process.env,
  })

  console.log('✅ Migrations completed successfully!')
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
}
