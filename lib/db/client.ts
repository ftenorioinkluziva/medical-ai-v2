import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Next.js automatically loads .env.local - no need for dotenv in Edge Runtime

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000, // 20 seconds for remote databases (increased for production stability)
  statement_timeout: 60000, // 60 seconds for query execution (increased for complex queries)
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // Additional production settings
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
})

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema })

// Export pool for raw queries if needed
export { pool }
