/**
 * Admin Pricing Configuration API
 * Manage model costs and credit package pricing
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { billingConfig, creditPackages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Default model pricing (USD per 1M tokens) based on Google AI documentation
const DEFAULT_MODEL_COSTS = {
  'gemini-2.5-flash': {
    inputPer1M: 0.075,
    outputPer1M: 0.30,
    cachedInputPer1M: 0.01875,
  },
  'gemini-2.5-pro': {
    inputPer1M: 1.25,
    outputPer1M: 5.00,
    cachedInputPer1M: 0.3125,
  },
  'gemini-1.5-flash': {
    inputPer1M: 0.075,
    outputPer1M: 0.30,
    cachedInputPer1M: 0.01875,
  },
  'gemini-1.5-pro': {
    inputPer1M: 1.25,
    outputPer1M: 5.00,
    cachedInputPer1M: 0.3125,
  },
}

/**
 * GET - Retrieve current pricing configuration
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get model costs from billing_config
    const modelCostsConfig = await db
      .select()
      .from(billingConfig)
      .where(eq(billingConfig.key, 'model_costs'))
      .limit(1)

    const modelCosts = modelCostsConfig[0]
      ? JSON.parse(modelCostsConfig[0].value)
      : DEFAULT_MODEL_COSTS

    // Get USD to BRL exchange rate
    const exchangeRateConfig = await db
      .select()
      .from(billingConfig)
      .where(eq(billingConfig.key, 'usd_to_brl_rate'))
      .limit(1)

    const usdToBrlRate = exchangeRateConfig[0]
      ? parseFloat(exchangeRateConfig[0].value)
      : 5.0 // Default fallback

    // Get credit price (BRL per credit)
    const creditPriceConfig = await db
      .select()
      .from(billingConfig)
      .where(eq(billingConfig.key, 'credit_price_brl'))
      .limit(1)

    const creditPriceBrl = creditPriceConfig[0]
      ? parseFloat(creditPriceConfig[0].value)
      : 0.50 // Default: R$ 0.50 per credit

    // Get credit packages
    const packages = await db
      .select()
      .from(creditPackages)
      .orderBy(creditPackages.displayOrder)

    return Response.json({
      success: true,
      modelCosts,
      usdToBrlRate,
      creditPriceBrl,
      packages,
    })
  } catch (error) {
    console.error('[PRICING-API] GET Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update pricing configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { modelCosts, usdToBrlRate, creditPriceBrl } = body

    // Update model costs
    if (modelCosts) {
      const existing = await db
        .select()
        .from(billingConfig)
        .where(eq(billingConfig.key, 'model_costs'))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(billingConfig)
          .set({
            value: JSON.stringify(modelCosts),
            updatedAt: new Date(),
          })
          .where(eq(billingConfig.key, 'model_costs'))
      } else {
        await db.insert(billingConfig).values({
          key: 'model_costs',
          value: JSON.stringify(modelCosts),
          description: 'AI model costs in USD per 1M tokens',
        })
      }
    }

    // Update USD to BRL exchange rate
    if (usdToBrlRate !== undefined) {
      const existing = await db
        .select()
        .from(billingConfig)
        .where(eq(billingConfig.key, 'usd_to_brl_rate'))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(billingConfig)
          .set({
            value: usdToBrlRate.toString(),
            updatedAt: new Date(),
          })
          .where(eq(billingConfig.key, 'usd_to_brl_rate'))
      } else {
        await db.insert(billingConfig).values({
          key: 'usd_to_brl_rate',
          value: usdToBrlRate.toString(),
          description: 'USD to BRL exchange rate for cost calculation',
        })
      }
    }

    // Update credit price
    if (creditPriceBrl !== undefined) {
      const existing = await db
        .select()
        .from(billingConfig)
        .where(eq(billingConfig.key, 'credit_price_brl'))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(billingConfig)
          .set({
            value: creditPriceBrl.toString(),
            updatedAt: new Date(),
          })
          .where(eq(billingConfig.key, 'credit_price_brl'))
      } else {
        await db.insert(billingConfig).values({
          key: 'credit_price_brl',
          value: creditPriceBrl.toString(),
          description: 'Price in BRL per credit (1 credit = 1000 tokens)',
        })
      }
    }

    return Response.json({
      success: true,
      message: 'Pricing configuration updated successfully',
    })
  } catch (error) {
    console.error('[PRICING-API] PUT Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
