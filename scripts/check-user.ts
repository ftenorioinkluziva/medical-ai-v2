/**
 * Script to check user credentials in database
 * Run with: npx tsx scripts/check-user.ts
 */

import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { compare, hash } from 'bcryptjs'

async function checkUser() {
  const email = 'f.tenorio.email@gmail.com'
  const password = 'Chemical99!'

  console.log('🔍 Procurando usuário:', email)

  // Find user
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user || user.length === 0) {
    console.log('❌ Usuário não encontrado no banco de dados')
    console.log('\n💡 Sugestão: Cadastre o usuário primeiro em /register')
    return
  }

  const foundUser = user[0]
  console.log('✅ Usuário encontrado:')
  console.log('  ID:', foundUser.id)
  console.log('  Nome:', foundUser.name)
  console.log('  Email:', foundUser.email)
  console.log('  Role:', foundUser.role)
  console.log('  Tem passwordHash:', !!foundUser.passwordHash)

  if (!foundUser.passwordHash) {
    console.log('❌ Usuário não possui senha configurada (passwordHash é null)')
    return
  }

  console.log('\n🔐 Testando senha...')
  console.log('  Senha fornecida:', password)
  console.log('  Hash no banco:', foundUser.passwordHash.substring(0, 20) + '...')

  // Test password
  const isValid = await compare(password, foundUser.passwordHash)

  if (isValid) {
    console.log('✅ Senha VÁLIDA - Login deveria funcionar!')
  } else {
    console.log('❌ Senha INVÁLIDA - Hash não corresponde')

    // Generate correct hash
    console.log('\n🔧 Gerando hash correto para a senha fornecida...')
    const correctHash = await hash(password, 10)
    console.log('  Hash gerado:', correctHash.substring(0, 20) + '...')

    console.log('\n💡 Para atualizar a senha, execute:')
    console.log(`  UPDATE users SET password_hash = '${correctHash}' WHERE email = '${email}';`)
  }
}

checkUser()
  .then(() => {
    console.log('\n✨ Verificação concluída')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })
