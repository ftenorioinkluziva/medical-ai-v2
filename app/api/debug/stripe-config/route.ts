import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { creditPackages, billingConfig } from '@/lib/db/schema'

export async function GET() {
  try {
    // Check environment variables (without exposing secrets)
    const config = {
      stripeSecretKey: !!process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing',
      stripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing',
      stripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || '❌ Missing',
      databaseUrl: !!process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
    }

    // Check credit packages
    const packages = await db.select().from(creditPackages)
    const packagesWithPriceIds = packages.filter(pkg => pkg.stripePriceId)

    // Check billing config
    const billingConfigs = await db.select().from(billingConfig)

    return NextResponse.json({
      environment: config,
      packages: {
        total: packages.length,
        withPriceIds: packagesWithPriceIds.length,
        list: packages.map(pkg => ({
          name: pkg.name,
          credits: pkg.credits,
          price: pkg.priceInCents / 100,
          hasPriceId: !!pkg.stripePriceId,
          isActive: pkg.isActive,
        })),
      },
      billingConfig: billingConfigs.map(cfg => ({
        key: cfg.key,
        value: cfg.value,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
