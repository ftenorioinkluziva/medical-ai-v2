/**
 * Run database migrations with environment variables loaded
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { execSync } from 'child_process'
import { existsSync } from 'fs'

// Load environment variables from .env.local (if exists - for local development)
// In Docker, environment variables are already set via docker-compose
const envPath = resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  config({ path: envPath })
  console.log('📁 Loaded environment variables from .env.local')
} else {
  console.log('🐳 Using environment variables from Docker/system')
}

console.log('🔄 Running database migrations...')

try {
  execSync('drizzle-kit migrate', {
    stdio: 'inherit',
    env: { ...process.env },
  })
  console.log('✅ Migrations completed successfully!')
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
}
