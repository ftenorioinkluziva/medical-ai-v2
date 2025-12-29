#!/usr/bin/env tsx
/**
 * Script para testar a criação de sessão Stripe Checkout
 */

import { db } from '../lib/db/client'
import { users, creditPackages } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import { createCheckoutSession } from '../lib/billing/checkout'

async function main() {
  console.log('🧪 Testando Stripe Checkout\n')

  // 1. Get test user
  const [testUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@medical.com'))
    .limit(1)

  if (!testUser) {
    console.error('❌ Usuário de teste não encontrado')
    process.exit(1)
  }

  console.log(`✅ Usuário de teste: ${testUser.email}`)
  console.log(`   ID: ${testUser.id}\n`)

  // 2. Get first package
  const [pkg] = await db
    .select()
    .from(creditPackages)
    .where(eq(creditPackages.isActive, true))
    .orderBy(creditPackages.displayOrder)
    .limit(1)

  if (!pkg) {
    console.error('❌ Nenhum pacote encontrado')
    process.exit(1)
  }

  console.log(`📦 Pacote selecionado: ${pkg.name}`)
  console.log(`   Créditos: ${pkg.credits}`)
  console.log(`   Preço: R$ ${(pkg.priceInCents / 100).toFixed(2)}`)
  console.log(`   Stripe Price ID: ${pkg.stripePriceId || 'NÃO CONFIGURADO'}\n`)

  if (!pkg.stripePriceId) {
    console.log('⚠️  Pacote não possui Stripe Price ID configurado')
    console.log('💡 Para configurar:')
    console.log('   1. Criar produtos no Stripe Dashboard')
    console.log('   2. Atualizar stripePriceId na tabela credit_packages')
    console.log('\n✅ Estrutura de checkout está OK, mas precisa configurar Stripe')
    return
  }

  // 3. Test checkout session creation
  console.log('🔄 Criando sessão Stripe Checkout...')

  try {
    const session = await createCheckoutSession(testUser.id, pkg.id)

    console.log('✅ Sessão criada com sucesso!')
    console.log(`   Session ID: ${session.id}`)
    console.log(`   URL: ${session.url}`)
    console.log(`   Status: ${session.status}`)
    console.log(`   Amount: ${session.amount_total ? session.amount_total / 100 : 0} ${session.currency?.toUpperCase()}`)

    console.log('\n✅ Stripe Checkout está funcionando!')
    console.log('💡 Para testar o fluxo completo:')
    console.log('   1. Acesse a URL acima')
    console.log('   2. Use o cartão de teste: 4242 4242 4242 4242')
    console.log('   3. Verifique o webhook receber o evento')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Erro ao criar sessão:', error.message)

      if (error.message.includes('No such price')) {
        console.log('\n💡 O Stripe Price ID está incorreto ou não existe')
        console.log('   Verifique no Stripe Dashboard: https://dashboard.stripe.com/test/prices')
      } else if (error.message.includes('API key')) {
        console.log('\n💡 Verifique se STRIPE_SECRET_KEY está configurado em .env.local')
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
