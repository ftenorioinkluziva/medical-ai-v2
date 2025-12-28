import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createCheckoutSession } from '@/lib/billing/checkout'
import { checkSystemApiLimit } from '@/lib/billing/system-monitoring'
import { z } from 'zod'

const purchaseSchema = z.object({
  packageId: z.string().uuid(),
})

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { packageId } = purchaseSchema.parse(body)

    // Check system limits before allowing purchase
    const systemCheck = await checkSystemApiLimit()
    if (systemCheck.shouldPauseSales) {
      return NextResponse.json(
        {
          error: 'Vendas de créditos temporariamente pausadas devido a alta demanda. Tente novamente mais tarde.',
          details: {
            usagePercent: systemCheck.usagePercent,
          }
        },
        { status: 503 }
      )
    }

    const checkoutSession = await createCheckoutSession(session.user.id, packageId)

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
