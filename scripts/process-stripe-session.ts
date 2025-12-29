#!/usr/bin/env tsx
/**
 * Script para processar manualmente uma sessão Stripe
 * Útil quando o webhook não processou um pagamento
 */

import { stripe } from '../lib/billing/stripe-client'
import { handlePaymentSuccess } from '../lib/billing/webhook-handlers'

async function main() {
  const sessionId = process.argv[2]

  if (!sessionId) {
    console.error('❌ Erro: Session ID não fornecido')
    console.log('\nUso: tsx --env-file=.env.local scripts/process-stripe-session.ts <session_id>')
    console.log('Exemplo: tsx --env-file=.env.local scripts/process-stripe-session.ts cs_test_xxx')
    console.log('\n💡 Encontre o Session ID em:')
    console.log('   https://dashboard.stripe.com/test/payments')
    process.exit(1)
  }

  console.log(`\n🔍 Buscando sessão: ${sessionId}\n`)

  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    console.log('✅ Sessão encontrada:')
    console.log(`   Status: ${session.status}`)
    console.log(`   Payment Status: ${session.payment_status}`)
    console.log(`   Amount: ${session.amount_total ? session.amount_total / 100 : 0} ${session.currency?.toUpperCase()}`)
    console.log(`   Customer Email: ${session.customer_details?.email}`)
    console.log(`   User ID: ${session.client_reference_id}`)
    console.log(`   Credits: ${session.metadata?.credits}\n`)

    if (session.payment_status !== 'paid') {
      console.error('❌ Pagamento não foi completado')
      console.log(`   Status atual: ${session.payment_status}`)
      process.exit(1)
    }

    if (!session.client_reference_id || !session.metadata?.credits) {
      console.error('❌ Sessão não possui metadata necessário')
      console.log('   Isso pode ser uma sessão criada sem os metadados corretos')
      process.exit(1)
    }

    console.log('🔄 Processando pagamento manualmente...\n')

    // Create a fake event to pass to the handler
    const fakeEvent = {
      id: 'evt_manual_' + Date.now(),
      object: 'event',
      api_version: '2024-12-18.acacia',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: session,
      },
      livemode: false,
      pending_webhooks: 0,
      request: {
        id: null,
        idempotency_key: null,
      },
      type: 'checkout.session.completed',
    } as any

    // Process the payment
    await handlePaymentSuccess(fakeEvent)

    console.log('\n✅ Pagamento processado com sucesso!')
    console.log('\n💡 Verifique os créditos com:')
    console.log('   pnpm tsx --env-file=.env.local scripts/debug-payment.ts')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Erro ao processar sessão:', error.message)

      if (error.message.includes('No such checkout session')) {
        console.log('\n💡 Session ID inválido ou não existe')
        console.log('   Verifique em: https://dashboard.stripe.com/test/payments')
      }
    } else {
      console.error('❌ Erro desconhecido:', error)
    }
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Erro:', error)
  process.exit(1)
})
