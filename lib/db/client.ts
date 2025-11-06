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
  connectionTimeoutMillis: 10000, // 10 seconds for remote databases like Neon
  statement_timeout: 30000, // 30 seconds for query execution
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
})

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema })

// Export pool for raw queries if needed
export { pool }
