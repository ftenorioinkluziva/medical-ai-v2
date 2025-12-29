import { NextResponse } from 'next/server'
import { stripe } from '@/lib/billing/stripe-client'

export async function GET() {
  try {
    // Test creating a checkout session with the actual price ID
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1SjKmo9WEAc8PReOlOQnIguo', // Starter price
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?canceled=true`,
      client_reference_id: 'test-user-id',
      metadata: {
        userId: 'test-user-id',
        packageId: 'test-package-id',
        credits: '100',
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: 'Checkout session created successfully! The account can create sessions.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        code: (error as any).code,
        param: (error as any).param,
        statusCode: (error as any).statusCode,
        rawError: error,
      },
      { status: 500 }
    )
  }
}
