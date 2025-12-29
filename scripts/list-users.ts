#!/usr/bin/env tsx
import { db } from '../lib/db/client'
import { users } from '../lib/db/schema'

async function main() {
  const allUsers = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .limit(10)

  console.log('📋 Usuários disponíveis:')
  allUsers.forEach((u) => console.log(`  - ${u.email} (${u.name})`))
}

main().catch(console.error)
