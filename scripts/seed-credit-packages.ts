#!/usr/bin/env tsx
/**
 * Seed script for credit packages and billing configuration
 * Creates the default credit packages and system billing settings
 */

import { db } from '../lib/db/client'
import { creditPackages, billingConfig } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

const defaultPackages = [
  {
    name: 'Starter',
    credits: 100,
    priceInCents: 3000, // R$ 30.00
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Professional',
    credits: 500,
    priceInCents: 20000, // R$ 200.00
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Enterprise',
    credits: 2000,
    priceInCents: 70000, // R$ 700.00
    displayOrder: 3,
    isActive: true,
  },
]

const defaultBillingConfig = [
  {
    key: 'api_monthly_limit_tokens',
    value: '100000000', // 100M tokens/month
    description: 'Google AI API monthly token limit',
  },
  {
    key: 'alert_threshold_percent',
    value: '80',
    description: 'Alert when sold credits reach this % of API limit',
  },
  {
    key: 'auto_pause_sales',
    value: 'true',
    description: 'Automatically pause credit sales when approaching limit',
  },
  {
    key: 'tokens_per_credit',
    value: '1000',
    description: 'Conversion rate: 1 credit = X tokens',
  },
]

async function main() {
  console.log('🌱 Seeding credit packages...')

  try {
    // Seed credit packages
    for (const pkg of defaultPackages) {
      const existing = await db
        .select()
        .from(creditPackages)
        .where(eq(creditPackages.name, pkg.name))
        .limit(1)

      if (existing.length === 0) {
        await db.insert(creditPackages).values(pkg)
        console.log(`✅ Created package: ${pkg.name} (${pkg.credits} credits for R$ ${pkg.priceInCents / 100})`)
      } else {
        console.log(`⏭️  Package already exists: ${pkg.name}`)
      }
    }

    // Seed billing config
    console.log('\n🔧 Seeding billing configuration...')
    for (const config of defaultBillingConfig) {
      const existing = await db
        .select()
        .from(billingConfig)
        .where(eq(billingConfig.key, config.key))
        .limit(1)

      if (existing.length === 0) {
        await db.insert(billingConfig).values(config)
        console.log(`✅ Created config: ${config.key} = ${config.value}`)
      } else {
        console.log(`⏭️  Config already exists: ${config.key}`)
      }
    }

    console.log('\n✅ Credit packages and billing configuration seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding credit packages:', error)
    process.exit(1)
  }
}

main()
