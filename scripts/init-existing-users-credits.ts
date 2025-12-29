#!/usr/bin/env tsx
/**
 * Script para inicializar contas de créditos para usuários existentes
 */

import { db } from '../lib/db/client'
import { users, userCredits } from '../lib/db/schema'
import { initializeUserCredits } from '../lib/billing/credits'
import { eq } from 'drizzle-orm'

async function main() {
  console.log('🔍 Buscando usuários sem conta de créditos...\n')

  // Get all users
  const allUsers = await db.select().from(users)

  console.log(`📊 Total de usuários: ${allUsers.length}`)

  let initialized = 0
  let skipped = 0

  for (const user of allUsers) {
    // Check if user already has credits account
    const existing = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, user.id))
      .limit(1)

    if (existing.length > 0) {
      console.log(`⏭️  ${user.email} - já possui conta de créditos`)
      skipped++
    } else {
      await initializeUserCredits(user.id)
      console.log(`✅ ${user.email} - conta de créditos criada`)
      initialized++
    }
  }

  console.log(`\n📊 Resumo:`)
  console.log(`   ✅ Inicializadas: ${initialized}`)
  console.log(`   ⏭️  Ignoradas: ${skipped}`)
  console.log(`   📊 Total: ${allUsers.length}`)
}

main().catch((error) => {
  console.error('❌ Erro:', error)
  process.exit(1)
})
