#!/usr/bin/env node

/**
 * Database Status Checker
 * Verifies database connectivity, schema, and migrations
 * Usage: node scripts/check-db-status.mjs
 */

import pg from 'pg'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config()

const { Pool } = pg

async function checkDatabaseStatus() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  console.log('🔍 Checking database status...\n')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 20000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  })

  try {
    // Test connection
    console.log('1️⃣  Testing database connection...')
    const timeStart = Date.now()
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version')
    const timeEnd = Date.now()
    console.log(`✅ Connected successfully in ${timeEnd - timeStart}ms`)
    console.log(`   Time: ${result.rows[0].current_time}`)
    console.log(`   Version: ${result.rows[0].postgres_version.split(',')[0]}\n`)

    // Check migrations table
    console.log('2️⃣  Checking applied migrations...')
    const migrations = await pool.query(`
      SELECT name, created_at
      FROM __drizzle_migrations
      ORDER BY created_at DESC
      LIMIT 10
    `)

    if (migrations.rows.length === 0) {
      console.log('⚠️  No migrations found! Run: pnpm db:migrate\n')
    } else {
      console.log(`✅ Found ${migrations.rows.length} recent migrations:`)
      migrations.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.name} (${new Date(row.created_at).toISOString()})`)
      })
      console.log()
    }

    // Check complete_analyses table structure
    console.log('3️⃣  Checking complete_analyses table structure...')
    const tableInfo = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'complete_analyses'
      ORDER BY ordinal_position
    `)

    if (tableInfo.rows.length === 0) {
      console.log('❌ Table complete_analyses does not exist!\n')
    } else {
      console.log(`✅ Table structure (${tableInfo.rows.length} columns):`)
      tableInfo.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
        console.log(`   - ${col.column_name}: ${col.data_type} (${nullable})`)
      })
      console.log()

      // Check for critical columns
      const columnNames = tableInfo.rows.map(r => r.column_name)
      const requiredColumns = ['id', 'user_id', 'document_ids', 'analysis_ids', 'synthesis']
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col))

      if (missingColumns.length > 0) {
        console.log(`⚠️  Missing required columns: ${missingColumns.join(', ')}`)
        console.log('   Run: pnpm db:migrate\n')
      } else {
        console.log('✅ All required columns present\n')
      }

      // Check for old columns (should not exist after migration 0012)
      const oldColumns = ['integrative_analysis_id', 'nutrition_analysis_id', 'exercise_analysis_id']
      const foundOldColumns = oldColumns.filter(col => columnNames.includes(col))

      if (foundOldColumns.length > 0) {
        console.log(`⚠️  Found deprecated columns: ${foundOldColumns.join(', ')}`)
        console.log('   Migration 0012_dynamic_agents.sql was not applied!')
        console.log('   Run: pnpm db:migrate\n')
      } else {
        console.log('✅ No deprecated columns found (migration 0012 applied)\n')
      }
    }

    // Check record count
    console.log('4️⃣  Checking data...')
    const countResult = await pool.query('SELECT COUNT(*) as count FROM complete_analyses')
    console.log(`✅ Total complete_analyses records: ${countResult.rows[0].count}\n`)

    console.log('✨ Database check completed successfully!')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }
    if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Troubleshooting tips:')
      console.error('   1. Check if DATABASE_URL is correct')
      console.error('   2. Verify database server is running and accessible')
      console.error('   3. Check firewall/network settings')
      console.error('   4. Verify SSL settings match database requirements')
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

checkDatabaseStatus()
