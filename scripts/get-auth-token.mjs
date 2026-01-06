/**
 * Get Authentication Token for N8N
 * This script logs in and returns the session token
 *
 * Usage:
 *   node scripts/get-auth-token.mjs <email> <password>
 *
 * Example:
 *   node scripts/get-auth-token.mjs admin@example.com senha123
 */

// Parse command line arguments
const email = process.argv[2]
const password = process.argv[3]
const baseUrl = process.argv[4] || 'http://localhost:3000'

if (!email || !password) {
  console.error('❌ Usage: node scripts/get-auth-token.mjs <email> <password> [url]')
  console.error('')
  console.error('Example:')
  console.error('  node scripts/get-auth-token.mjs admin@example.com senha123')
  console.error('  node scripts/get-auth-token.mjs admin@example.com senha123 http://localhost:3000')
  process.exit(1)
}

console.log('🔐 Obtendo token de autenticação...\n')
console.log(`📧 Email: ${email}`)
console.log(`🌐 URL: ${baseUrl}\n`)

try {
  // Login request
  const response = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
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

  // Get cookies from response
  const cookies = response.headers.getSetCookie()

  if (!cookies || cookies.length === 0) {
    console.error('❌ Login falhou - nenhum cookie retornado')
    console.error('')
    console.error('Possíveis causas:')
    console.error('  - Email ou senha incorretos')
    console.error('  - Servidor não está rodando')
    console.error('  - URL incorreta')
    process.exit(1)
  }

  // Extract session token from cookies
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
    console.error('❌ Token de sessão não encontrado nos cookies')
    console.error('')
    console.error('Cookies retornados:')
    cookies.forEach(c => console.error(`  - ${c.substring(0, 100)}...`))
    process.exit(1)
  }

  console.log('✅ Login realizado com sucesso!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 COPIE ESTE VALOR PARA O N8N:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`authjs.session-token=${sessionToken}`)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('🎯 Como usar no N8N:\n')
  console.log('1. No nó HTTP Request, vá em "Headers"')
  console.log('2. Adicione um header:')
  console.log('   - Name: Cookie')
  console.log(`   - Value: authjs.session-token=${sessionToken}`)
  console.log('\n💡 Este token é válido por 30 dias.\n')

  // Test the token
  console.log('🧪 Testando o token...\n')

  const testResponse = await fetch(`${baseUrl}/api/admin/agents`, {
    headers: {
      'Cookie': `authjs.session-token=${sessionToken}`
    }
  })

  if (testResponse.ok) {
    console.log('✅ Token válido e funcionando!')

    const data = await testResponse.json()
    if (data.user) {
      console.log(`\n👤 Logado como: ${data.user.name || data.user.email}`)
      console.log(`🔑 Role: ${data.user.role}`)

      if (data.user.role !== 'admin') {
        console.log('\n⚠️  ATENÇÃO: Este usuário não é admin!')
        console.log('   O endpoint de upload requer role "admin".')
      }
    }
  } else {
    console.log('⚠️  Token gerado, mas validação falhou')
    console.log(`   Status: ${testResponse.status}`)
  }

} catch (error) {
  console.error('❌ Erro:', error.message)

  if (error.code === 'ECONNREFUSED') {
    console.error('\n💡 Dica: Certifique-se que o servidor está rodando (pnpm dev)')
  }

  process.exit(1)
}
