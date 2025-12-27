/**
 * Run database migrations with environment variables loaded
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { execSync } from 'child_process'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

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
