import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

function getStripeClient(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }

    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }

  return stripeInstance
}

// Export a Proxy that lazily initializes the Stripe client
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    const client = getStripeClient()
    const value = client[prop as keyof Stripe]
    return typeof value === 'function' ? value.bind(client) : value
  },
})
