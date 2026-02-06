import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Next.js automatically loads .env.local - no need for dotenv in Edge Runtime

// Lazy initialization to avoid throwing during Next.js build page data collection
let _pool: Pool | null = null
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

function getPool() {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000,
      statement_timeout: 60000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    })
  }
  return _pool
}

function getDb() {
  if (!_db) {
    _db = drizzle(getPool(), { schema })
  }
  return _db
}

// Export proxied instances that initialize lazily
export const pool = new Proxy({} as Pool, {
  get(target, prop) {
    return (getPool() as any)[prop]
  },
})

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(target, prop) {
    return (getDb() as any)[prop]
  },
})
