import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function checkSystemPrompt() {
  console.log('=== VERIFICAÇÃO: System Prompt do Agente ===\n')

  const [agent] = await db
    .select()
    .from(healthAgents)
    .where(eq(healthAgents.agentKey, 'integrativa'))

  if (!agent) {
    console.log('❌ Agente não encontrado')
    return
  }

  console.log('📋 INFORMAÇÕES DO AGENTE:')
  console.log(`   Nome: ${agent.name}`)
  console.log(`   Model: ${agent.modelName}`)
  console.log(`   Temperature: ${agent.modelConfig.temperature}`)
  console.log(`   TopP: ${agent.modelConfig.topP}`)
  console.log(`   TopK: ${agent.modelConfig.topK}`)
  console.log(`   MaxTokens: ${agent.modelConfig.maxOutputTokens}`)

  console.log('\n📝 SYSTEM PROMPT:')
  console.log('─'.repeat(80))
  console.log(agent.systemPrompt)
  console.log('─'.repeat(80))

  console.log('\n🔍 ANÁLISE DO SYSTEM PROMPT:')

  const systemLower = agent.systemPrompt.toLowerCase()

  // Check for problematic phrases
  const problematicPhrases = [
    { phrase: 'abrangente', warning: 'Pode encorajar análise completa mesmo sem dados' },
    { phrase: 'completo', warning: 'Pode encorajar análise completa mesmo sem dados' },
    { phrase: 'todos os sistemas', warning: 'Pode forçar análise de todos os sistemas' },
    { phrase: 'avalie todos', warning: 'Pode forçar avaliação sem dados' },
    { phrase: 'considere', warning: 'Pode encorajar inferências' },
    { phrase: 'infira', warning: 'Permite inferências explicitamente!' },
    { phrase: 'suponha', warning: 'Permite suposições explicitamente!' },
  ]

  let hasProblems = false
  for (const { phrase, warning } of problematicPhrases) {
    if (systemLower.includes(phrase)) {
      console.log(`   ⚠️  Encontrado "${phrase}": ${warning}`)
      hasProblems = true
    }
  }

  // Check for anti-hallucination instructions
  const antiHallucinationPhrases = [
    'apenas',
    'somente',
    'não invente',
    'não mencione',
    'não disponível',
    'dados disponíveis',
  ]

  let hasAntiHallucination = false
  for (const phrase of antiHallucinationPhrases) {
    if (systemLower.includes(phrase)) {
      console.log(`   ✅ Tem proteção: "${phrase}"`)
      hasAntiHallucination = true
    }
  }

  if (!hasAntiHallucination) {
    console.log(`   ❌ System prompt NÃO tem instruções anti-alucinação`)
    hasProblems = true
  }

  console.log('\n🎯 RECOMENDAÇÕES:')

  if (hasProblems) {
    console.log('\n⚠️  PROBLEMAS IDENTIFICADOS NO SYSTEM PROMPT!')
    console.log('\nO system prompt deve:')
    console.log('1. Instruir o agente a trabalhar APENAS com dados disponíveis')
    console.log('2. Proibir explicitamente inferências e suposições')
    console.log('3. Não exigir análise "completa" ou "abrangente"')
    console.log('4. Permitir que o agente diga "não disponível"')
    console.log('\n💡 SUGESTÃO: Atualizar o system prompt para incluir:')
    console.log('   "Você deve analisar APENAS os dados explicitamente disponíveis.')
    console.log('    NUNCA invente, infira ou suponha valores de parâmetros.')
    console.log('    Se um dado não estiver disponível, diga \'não disponível\'."')
  } else {
    console.log('✅ System prompt parece adequado')
  }

  // Check temperature
  console.log('\n🌡️  VERIFICAÇÃO DE TEMPERATURA:')
  if (agent.modelConfig.temperature > 0.3) {
    console.log(`   ⚠️  Temperature ${agent.modelConfig.temperature} pode ser alta demais`)
    console.log(`   Recomendação: Reduzir para 0.1 ou 0.2 para análises médicas`)
  } else {
    console.log(`   ✅ Temperature ${agent.modelConfig.temperature} está adequada`)
  }

  console.log('\n=== FIM DA VERIFICAÇÃO ===')
}

checkSystemPrompt()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
