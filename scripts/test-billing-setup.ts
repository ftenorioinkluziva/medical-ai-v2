#!/usr/bin/env tsx
/**
 * Script to test billing system setup
 */

import { db } from '../lib/db/client'
import { creditPackages, userCredits } from '../lib/db/schema'

async function main() {
  console.log('🔍 Checking billing tables...\n')

  try {
    // Check if credit packages table exists
    const packages = await db.select().from(creditPackages).limit(1)
    console.log('✅ credit_packages table exists')

    // Check if user credits table exists
    const credits = await db.select().from(userCredits).limit(1)
    console.log('✅ user_credits table exists')

    // Count packages
    const allPackages = await db.select().from(creditPackages)
    console.log(`\n📦 Credit packages available: ${allPackages.length}`)

    if (allPackages.length > 0) {
      allPackages.forEach((pkg) => {
        console.log(
          `  - ${pkg.name}: ${pkg.credits} credits - R$ ${(pkg.priceInCents / 100).toFixed(2)}`
        )
      })
    }

    console.log('\n✅ Billing system is ready!')
  } catch (error) {
    console.error('❌ Error checking billing tables:', error)
    console.log('\n💡 You may need to run:')
    console.log('   1. Apply migration: psql $DATABASE_URL -f lib/db/migrations/0009_breezy_sway.sql')
    console.log('   2. Run seed: pnpm db:seed')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
