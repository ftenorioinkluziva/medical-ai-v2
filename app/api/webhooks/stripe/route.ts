import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/billing/stripe-client'
import { handlePaymentSuccess, handlePaymentFailed } from '@/lib/billing/webhook-handlers'

export async function POST(request: Request) {
  console.log('🔔 [WEBHOOK] Received request')

  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  console.log('🔔 [WEBHOOK] Signature present:', !!signature)

  if (!signature) {
    console.error('❌ [WEBHOOK] No signature provided')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('✅ [WEBHOOK] Signature verified, event type:', event.type)
  } catch (error) {
    console.error('❌ [WEBHOOK] Signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    console.log('🔔 [WEBHOOK] Processing event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 [WEBHOOK] Handling checkout.session.completed')
        await handlePaymentSuccess(event)
        console.log('✅ [WEBHOOK] Payment success handled')
        break

      case 'checkout.session.async_payment_succeeded':
        console.log('💳 [WEBHOOK] Handling async payment succeeded')
        await handlePaymentSuccess(event)
        console.log('✅ [WEBHOOK] Async payment success handled')
        break

      case 'checkout.session.async_payment_failed':
        console.log('⚠️ [WEBHOOK] Handling async payment failed')
        await handlePaymentFailed(event)
        console.log('✅ [WEBHOOK] Payment failed handled')
        break

      default:
        console.log(`ℹ️ [WEBHOOK] Unhandled event type: ${event.type}`)
    }

    console.log('✅ [WEBHOOK] Event processed successfully')
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ [WEBHOOK] Handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
