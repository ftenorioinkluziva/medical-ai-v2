#!/usr/bin/env tsx
/**
 * Script para adicionar créditos de teste a um usuário
 * Uso: tsx --env-file=.env.local scripts/add-test-credits.ts <email> <credits>
 * Exemplo: tsx --env-file=.env.local scripts/add-test-credits.ts user@email.com 1000
 */

import { db } from '../lib/db/client'
import { users } from '../lib/db/schema'
import { adminAdjustCredits } from '../lib/billing/credits'
import { eq } from 'drizzle-orm'

async function main() {
  const email = process.argv[2]
  const credits = parseInt(process.argv[3] || '1000')

  if (!email) {
    console.error('❌ Erro: Email não fornecido')
    console.log('\nUso: tsx --env-file=.env.local scripts/add-test-credits.ts <email> <credits>')
    console.log('Exemplo: tsx --env-file=.env.local scripts/add-test-credits.ts user@email.com 1000')
    process.exit(1)
  }

  console.log(`\n🔍 Buscando usuário: ${email}`)

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) {
    console.error(`❌ Usuário não encontrado: ${email}`)
    console.log('\n📋 Usuários disponíveis:')
    const allUsers = await db.select({ id: users.id, email: users.email, name: users.name }).from(users).limit(10)
    allUsers.forEach(u => console.log(`  - ${u.email} (${u.name})`))
    process.exit(1)
  }

  console.log(`✅ Usuário encontrado: ${user.name} (${user.id})`)
  console.log(`\n💰 Adicionando ${credits} créditos...`)

  const result = await adminAdjustCredits(
    user.id,
    credits,
    'Créditos de teste adicionados via script',
    'system'
  )

  console.log(`\n✅ Créditos adicionados com sucesso!`)
  console.log(`📊 Novo saldo: ${result.newBalance} créditos`)
  console.log(`\n🌐 Acesse: http://localhost:3000/dashboard/credits`)
}

main().catch(error => {
  console.error('❌ Erro ao adicionar créditos:', error)
  process.exit(1)
})
