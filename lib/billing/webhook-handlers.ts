import { stripe } from './stripe-client'
import { db } from '@/lib/db/client'
import { stripePayments } from '@/lib/db/schema'
import { addCredits } from './credits'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'

export async function handlePaymentSuccess(event: Stripe.Event) {
  console.log('💳 [WEBHOOK-HANDLER] Starting payment success handler')
  const session = event.data.object as Stripe.Checkout.Session

  console.log('💳 [WEBHOOK-HANDLER] Session ID:', session.id)
  console.log('💳 [WEBHOOK-HANDLER] Payment status:', session.payment_status)

  const userId = session.client_reference_id
  const packageId = session.metadata?.packageId
  const credits = parseInt(session.metadata?.credits || '0')

  console.log('💳 [WEBHOOK-HANDLER] User ID:', userId)
  console.log('💳 [WEBHOOK-HANDLER] Package ID:', packageId)
  console.log('💳 [WEBHOOK-HANDLER] Credits:', credits)

  if (!userId || !credits) {
    console.error('❌ [WEBHOOK-HANDLER] Missing metadata in checkout session', session.id)
    console.error('❌ [WEBHOOK-HANDLER] Metadata:', session.metadata)
    return
  }

  // Check if already processed
  console.log('🔍 [WEBHOOK-HANDLER] Checking for duplicate payment...')
  const existing = await db.query.stripePayments.findFirst({
    where: eq(stripePayments.stripeCheckoutSessionId, session.id),
  })

  if (existing) {
    console.log('⏭️ [WEBHOOK-HANDLER] Payment already processed:', session.id)
    return
  }

  console.log('✅ [WEBHOOK-HANDLER] Payment is new, processing...')

  // Retrieve payment intent for complete data
  console.log('🔍 [WEBHOOK-HANDLER] Retrieving payment intent:', session.payment_intent)
  const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string)
  console.log('✅ [WEBHOOK-HANDLER] Payment intent retrieved:', paymentIntent.id)

  // Add credits to user account
  console.log('💰 [WEBHOOK-HANDLER] Adding credits to user account...')
  const { transaction } = await addCredits(userId, credits, {
    stripePaymentId: paymentIntent.id,
    description: `Purchase: ${credits} credits`,
  })
  console.log('✅ [WEBHOOK-HANDLER] Credits added, transaction ID:', transaction.id)

  // Record payment
  console.log('💾 [WEBHOOK-HANDLER] Recording payment in database...')
  await db.insert(stripePayments).values({
    userId,
    stripePaymentIntentId: paymentIntent.id,
    stripeCheckoutSessionId: session.id,
    packageId: packageId || null,
    creditsGranted: credits,
    amountInCents: session.amount_total || 0,
    currency: session.currency?.toUpperCase() || 'BRL',
    status: 'succeeded',
    transactionId: transaction.id,
    metadata: JSON.stringify({ event: event.type, session }),
  })

  console.log(`✅ [WEBHOOK-HANDLER] Credits added successfully: ${credits} credits to user ${userId}`)
}

export async function handlePaymentFailed(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session

  // Log failure for monitoring
  console.error('Payment failed:', session.id, session.metadata)

  // Optionally notify user via email/notification system
}
