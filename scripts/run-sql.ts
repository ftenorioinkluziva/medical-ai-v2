#!/usr/bin/env tsx
/**
 * Utility script to run SQL files against the database
 * Usage: pnpm tsx scripts/run-sql.ts <sql-file-path>
 */

import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sqlFilePath = process.argv[2]

if (!sqlFilePath) {
  console.error('❌ Please provide a SQL file path')
  console.error('Usage: pnpm tsx scripts/run-sql.ts <sql-file-path>')
  process.exit(1)
}

async function runSql() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  })

  try {
    console.log('🔌 Connecting to database...')
    const client = await pool.connect()

    console.log(`📄 Reading SQL file: ${sqlFilePath}`)
    const sqlPath = resolve(process.cwd(), sqlFilePath)
    const sql = readFileSync(sqlPath, 'utf-8')

    console.log('🚀 Executing SQL...')
    const result = await client.query(sql)

    console.log('✅ SQL executed successfully')
    if (result.rows.length > 0) {
      console.log('\nResults:')
      console.table(result.rows)
    }

    client.release()
  } catch (error) {
    console.error('❌ Error executing SQL:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runSql()
