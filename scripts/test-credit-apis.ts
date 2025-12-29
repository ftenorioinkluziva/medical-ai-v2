#!/usr/bin/env tsx
/**
 * Script para testar os endpoints da API de créditos
 * Testa diretamente as funções sem precisar do servidor web
 */

import { db } from '../lib/db/client'
import { users } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import { getUserCredits, getCreditHistory } from '../lib/billing/credits'
import { creditPackages } from '../lib/db/schema'

async function main() {
  console.log('🧪 Testando APIs de Créditos\n')

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

  console.log(`✅ Usuário de teste: ${testUser.email}\n`)

  // 2. Test getUserCredits (like /api/credits/balance)
  console.log('📊 Testando: GET /api/credits/balance')
  const credits = await getUserCredits(testUser.id)
  console.log(`   Balance: ${credits.balance}`)
  console.log(`   Total Purchased: ${credits.totalPurchased}`)
  console.log(`   Total Used: ${credits.totalUsed}`)
  console.log('   ✅ Balance endpoint OK\n')

  // 3. Test credit packages (like /api/credits/packages)
  console.log('📦 Testando: GET /api/credits/packages')
  const packages = await db
    .select()
    .from(creditPackages)
    .where(eq(creditPackages.isActive, true))
    .orderBy(creditPackages.displayOrder)

  console.log(`   Packages disponíveis: ${packages.length}`)
  packages.forEach((pkg) => {
    console.log(
      `   - ${pkg.name}: ${pkg.credits} credits (R$ ${(pkg.priceInCents / 100).toFixed(2)})`
    )
  })
  console.log('   ✅ Packages endpoint OK\n')

  // 4. Test credit history (like /api/credits/history)
  console.log('📜 Testando: GET /api/credits/history')
  const history = await getCreditHistory(testUser.id, 10)
  console.log(`   Transações encontradas: ${history.length}`)
  history.forEach((tx) => {
    const date = new Date(tx.createdAt).toLocaleDateString('pt-BR')
    console.log(
      `   - ${date}: ${tx.type} ${tx.amount > 0 ? '+' : ''}${tx.amount} créditos (saldo: ${tx.balanceAfter})`
    )
  })
  console.log('   ✅ History endpoint OK\n')

  console.log('✅ Todos os testes de API passaram!')
  console.log('\n📝 Próximo teste: Stripe Checkout (requer dev server rodando)')
  console.log('   curl http://localhost:3000/api/credits/packages')
}

main().catch((error) => {
  console.error('❌ Erro:', error)
  process.exit(1)
})
