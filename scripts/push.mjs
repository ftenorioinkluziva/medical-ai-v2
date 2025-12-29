/**
 * Push database schema with environment variables loaded
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { execSync } from 'child_process'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

console.log('🔄 Pushing schema to database...')

try {
  execSync('pnpm exec drizzle-kit push --force', {
    stdio: 'inherit',
    env: { ...process.env },
  })
  console.log('✅ Schema pushed successfully!')
} catch (error) {
  console.error('❌ Push failed:', error.message)
  process.exit(1)
}
