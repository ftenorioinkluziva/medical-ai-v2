/**
 * Create API Key Script
 * Helper to create API keys quickly from command line
 *
 * Usage:
 *   node scripts/create-api-key.mjs <email> <password> [name] [description] [expiresInDays]
 *
 * Example:
 *   node scripts/create-api-key.mjs admin@example.com senha123 "N8N Automation"
 *   node scripts/create-api-key.mjs admin@example.com senha123 "N8N Key" "For automated uploads" 365
 */

const email = process.argv[2]
const password = process.argv[3]
const name = process.argv[4] || 'Unnamed API Key'
const description = process.argv[5] || ''
const expiresInDays = process.argv[6] ? parseInt(process.argv[6]) : undefined
const baseUrl = process.argv[7] || 'http://localhost:3000'

if (!email || !password) {
  console.error('❌ Usage: node scripts/create-api-key.mjs <email> <password> [name] [description] [expiresInDays]')
  console.error('')
  console.error('Examples:')
  console.error('  node scripts/create-api-key.mjs admin@example.com senha123')
  console.error('  node scripts/create-api-key.mjs admin@example.com senha123 "N8N Automation"')
  console.error('  node scripts/create-api-key.mjs admin@example.com senha123 "N8N Key" "For uploads" 365')
  process.exit(1)
}

console.log('🔐 Criando API Key...\n')
console.log(`📧 Email: ${email}`)
console.log(`📝 Name: ${name}`)
if (description) console.log(`📄 Description: ${description}`)
if (expiresInDays) console.log(`⏰ Expires: ${expiresInDays} days`)
console.log('')

try {
  // Step 1: Login to get session token
  console.log('🔑 Fazendo login...')

  const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      redirect: false,
    }),
    credentials: 'include',
  })

  const cookies = loginResponse.headers.getSetCookie()

  if (!cookies || cookies.length === 0) {
    console.error('❌ Login falhou - credenciais inválidas')
    process.exit(1)
  }

  // Extract session token
  let sessionToken = null
  for (const cookie of cookies) {
    if (cookie.includes('authjs.session-token=')) {
      const match = cookie.match(/authjs\.session-token=([^;]+)/)
      if (match) {
        sessionToken = match[1]
        break
      }
    }
  }

  if (!sessionToken) {
    console.error('❌ Token de sessão não encontrado')
    process.exit(1)
  }

  console.log('✅ Login realizado\n')

  // Step 2: Create API key
  console.log('🔑 Criando API Key...')

  const createResponse = await fetch(`${baseUrl}/api/admin/api-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `authjs.session-token=${sessionToken}`
    },
    body: JSON.stringify({
      name,
      description,
      expiresInDays,
    }),
  })

  if (!createResponse.ok) {
    const error = await createResponse.json()
    console.error(`❌ Erro ao criar API key: ${error.error}`)
    process.exit(1)
  }

  const result = await createResponse.json()

  console.log('✅ API Key criada com sucesso!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 SALVE ESTA API KEY AGORA! ELA NÃO SERÁ MOSTRADA NOVAMENTE')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`🔑 API Key: ${result.apiKey}`)
  console.log(`\n📊 Detalhes:`)
  console.log(`   ID: ${result.id}`)
  console.log(`   Prefix: ${result.keyPrefix}`)
  console.log(`   Name: ${result.name}`)
  if (result.description) console.log(`   Description: ${result.description}`)
  if (result.expiresAt) console.log(`   Expires: ${new Date(result.expiresAt).toLocaleDateString()}`)
  console.log(`   Created: ${new Date(result.createdAt).toLocaleString()}`)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('🎯 Como usar no N8N:\n')
  console.log('1. No nó HTTP Request, vá em "Headers"')
  console.log('2. Adicione um header:')
  console.log('   - Name: Authorization')
  console.log(`   - Value: Bearer ${result.apiKey}`)
  console.log('\n💡 Muito mais simples que cookie de sessão!\n')

  // Step 3: Test the API key
  console.log('🧪 Testando a API Key...\n')

  const testResponse = await fetch(`${baseUrl}/api/admin/agents`, {
    headers: {
      'Authorization': `Bearer ${result.apiKey}`
    }
  })

  if (testResponse.ok) {
    console.log('✅ API Key válida e funcionando!')

    const data = await testResponse.json()
    if (data.user) {
      console.log(`\n👤 Autenticado como: ${data.user.name || data.user.email}`)
      console.log(`🔑 Role: ${data.user.role}`)
    }
  } else {
    console.log('⚠️  API Key criada, mas teste falhou')
    console.log(`   Status: ${testResponse.status}`)
  }

  console.log('\n✨ Tudo pronto! Você já pode usar esta API Key no N8N.')

} catch (error) {
  console.error('❌ Erro:', error.message)

  if (error.code === 'ECONNREFUSED') {
    console.error('\n💡 Dica: Certifique-se que o servidor está rodando (pnpm dev)')
  }

  process.exit(1)
}
