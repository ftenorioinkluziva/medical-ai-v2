/**
 * Script to update user password
 * Run with: node --env-file=.env.local -r tsx/cjs scripts/update-password.ts
 */

import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'

async function updatePassword() {
  const email = 'f.tenorio.email@gmail.com'
  const newPassword = 'Chemical99!'

  console.log('🔐 Atualizando senha para:', email)

  // Generate new hash
  const passwordHash = await hash(newPassword, 10)
  console.log('✅ Hash gerado:', passwordHash.substring(0, 30) + '...')

  // Update user
  const result = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.email, email))
    .returning({ id: users.id, email: users.email })

  if (result.length === 0) {
    console.log('❌ Usuário não encontrado')
    return
  }

  console.log('✅ Senha atualizada com sucesso para:', result[0].email)
  console.log('💡 Agora você pode fazer login com a senha:', newPassword)
}

updatePassword()
  .then(() => {
    console.log('\n✨ Atualização concluída')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })
