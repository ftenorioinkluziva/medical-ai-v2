import { stripe } from './stripe-client'
import { db } from '@/lib/db/client'
import { stripePayments } from '@/lib/db/schema'
import { addCredits } from './credits'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'

export async function handlePaymentSuccess(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session

  const userId = session.client_reference_id
  const packageId = session.metadata?.packageId
  const credits = parseInt(session.metadata?.credits || '0')

  if (!userId || !credits) {
    console.error('Missing metadata in checkout session', session.id)
    return
  }

  // Check if already processed
  const existing = await db.query.stripePayments.findFirst({
    where: eq(stripePayments.stripeCheckoutSessionId, session.id),
  })

  if (existing) {
    console.log('Payment already processed:', session.id)
    return
  }

  // Retrieve payment intent for complete data
  const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string)

  // Add credits to user account
  const { transaction } = await addCredits(userId, credits, {
    stripePaymentId: paymentIntent.id,
    description: `Purchase: ${credits} credits`,
  })

  // Record payment
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

  console.log(`Credits added: ${credits} credits to user ${userId}`)
}

export async function handlePaymentFailed(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session

  // Log failure for monitoring
  console.error('Payment failed:', session.id, session.metadata)

  // Optionally notify user via email/notification system
}
