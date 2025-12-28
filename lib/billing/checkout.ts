import { stripe } from './stripe-client'
import { db } from '@/lib/db/client'
import { creditPackages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function createCheckoutSession(userId: string, packageId: string) {
  const pkg = await db.query.creditPackages.findFirst({
    where: eq(creditPackages.id, packageId),
  })

  if (!pkg || !pkg.isActive) {
    throw new Error('Invalid package')
  }

  if (!pkg.stripePriceId) {
    throw new Error('Package not synced with Stripe')
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: pkg.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/credits?canceled=true`,
    client_reference_id: userId,
    metadata: {
      userId,
      packageId: pkg.id,
      credits: pkg.credits.toString(),
    },
  })

  return session
}
