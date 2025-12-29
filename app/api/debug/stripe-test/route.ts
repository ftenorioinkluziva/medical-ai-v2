import { NextResponse } from 'next/server'
import { stripe } from '@/lib/billing/stripe-client'

export async function GET() {
  try {
    // Test 1: Verify Stripe client initialization
    if (!stripe) {
      return NextResponse.json({
        success: false,
        error: 'Stripe client not initialized',
      })
    }

    // Test 2: Try to retrieve account information
    const account = await stripe.accounts.retrieve()

    // Test 3: List products
    const products = await stripe.products.list({ limit: 5 })

    // Test 4: List prices
    const prices = await stripe.prices.list({ limit: 5 })

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        type: account.type,
        country: account.country,
        email: account.email,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
      },
      products: {
        count: products.data.length,
        list: products.data.map(p => ({
          id: p.id,
          name: p.name,
          active: p.active,
        })),
      },
      prices: {
        count: prices.data.length,
        list: prices.data.map(p => ({
          id: p.id,
          product: p.product,
          unit_amount: p.unit_amount,
          currency: p.currency,
          active: p.active,
        })),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
