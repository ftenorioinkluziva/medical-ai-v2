#!/usr/bin/env tsx
/**
 * Script para debugar pagamento e verificar se os créditos foram adicionados
 */

import { db } from '../lib/db/client'
import { users, userCredits, creditTransactions, stripePayments } from '../lib/db/schema'
import { eq, desc } from 'drizzle-orm'

async function main() {
  const userId = '2b2f1392-c098-49cb-be90-676dfa4c49ce'

  console.log('🔍 Debugando pagamento...\n')

  // 1. Get user info
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    console.error('❌ Usuário não encontrado')
    process.exit(1)
  }

  console.log(`👤 Usuário: ${user.email}`)
  console.log(`   ID: ${user.id}\n`)

  // 2. Get current credits
  const [credits] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1)

  if (credits) {
    console.log('💰 Saldo de Créditos:')
    console.log(`   Balance: ${credits.balance}`)
    console.log(`   Total Purchased: ${credits.totalPurchased}`)
    console.log(`   Total Used: ${credits.totalUsed}\n`)
  } else {
    console.log('⚠️  Conta de créditos não encontrada\n')
  }

  // 3. Get all transactions
  const transactions = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(10)

  console.log(`📜 Transações (${transactions.length}):`)
  if (transactions.length === 0) {
    console.log('   Nenhuma transação encontrada\n')
  } else {
    transactions.forEach((tx) => {
      const date = new Date(tx.createdAt).toLocaleString('pt-BR')
      console.log(
        `   ${date} | ${tx.type} | ${tx.amount > 0 ? '+' : ''}${tx.amount} | Saldo: ${tx.balanceAfter}`
      )
      console.log(`   Descrição: ${tx.description}`)
      if (tx.metadata) {
        console.log(`   Metadata: ${JSON.stringify(tx.metadata)}`)
      }
      console.log()
    })
  }

  // 4. Get Stripe payments
  const payments = await db
    .select()
    .from(stripePayments)
    .where(eq(stripePayments.userId, userId))
    .orderBy(desc(stripePayments.createdAt))
    .limit(10)

  console.log(`💳 Pagamentos Stripe (${payments.length}):`)
  if (payments.length === 0) {
    console.log('   ⚠️  NENHUM PAGAMENTO REGISTRADO - Webhook não processou!\n')
  } else {
    payments.forEach((payment) => {
      const date = new Date(payment.createdAt).toLocaleString('pt-BR')
      console.log(`   ${date}`)
      console.log(`   Payment Intent: ${payment.stripePaymentIntentId}`)
      console.log(`   Checkout Session: ${payment.stripeCheckoutSessionId}`)
      console.log(`   Créditos: ${payment.creditsGranted}`)
      console.log(`   Valor: R$ ${(payment.amountInCents / 100).toFixed(2)}`)
      console.log(`   Status: ${payment.status}`)
      console.log()
    })
  }

  // 5. Diagnosis
  console.log('🔍 Diagnóstico:')
  if (payments.length === 0) {
    console.log('   ❌ Webhook do Stripe NÃO processou o pagamento')
    console.log('\n💡 Possíveis causas:')
    console.log('   1. Stripe CLI não está rodando')
    console.log('   2. Webhook endpoint não está recebendo eventos')
    console.log('   3. Erro no processamento do webhook')
    console.log('\n🔧 Soluções:')
    console.log('   1. Verifique se Stripe CLI está rodando: stripe listen')
    console.log('   2. Verifique logs do servidor Next.js')
    console.log('   3. Teste webhook manualmente com: stripe trigger checkout.session.completed')
  } else if (credits && credits.balance === 0) {
    console.log('   ⚠️  Pagamento registrado mas créditos não foram adicionados')
    console.log('\n💡 Possível causa: Erro ao adicionar créditos')
  } else {
    console.log('   ✅ Tudo parece estar OK')
  }
}

main().catch((error) => {
  console.error('❌ Erro:', error)
  process.exit(1)
})
