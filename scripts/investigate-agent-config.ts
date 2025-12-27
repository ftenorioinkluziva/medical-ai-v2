import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function investigate() {
  console.log('=== INVESTIGAÇÃO: Configuração do Agente Medicina Integrativa ===\n')

  const [agent] = await db
    .select()
    .from(healthAgents)
    .where(eq(healthAgents.agentKey, 'integrativa'))

  if (!agent) {
    console.log('❌ Agente não encontrado!')
    return
  }

  console.log('📋 INFORMAÇÕES BÁSICAS:')
  console.log(`- Nome: ${agent.name}`)
  console.log(`- Agent Key: ${agent.agentKey}`)
  console.log(`- Model: ${agent.modelName}`)
  console.log(`- Título: ${agent.title}`)

  console.log('\n⚙️  CONFIGURAÇÕES DO MODELO:')
  console.log(JSON.stringify(agent.modelConfig, null, 2))

  console.log('\n📝 SYSTEM PROMPT:')
  console.log('─'.repeat(80))
  console.log(agent.systemPrompt)
  console.log('─'.repeat(80))

  console.log('\n📋 ANALYSIS PROMPT:')
  console.log('─'.repeat(80))
  console.log(agent.analysisPrompt)
  console.log('─'.repeat(80))

  console.log('\n🔍 ANÁLISE DE POSSÍVEIS CAUSAS:')

  // Check temperature
  const temp = agent.modelConfig.temperature
  if (temp > 0.5) {
    console.log(`⚠️  Temperature alta (${temp}) pode aumentar criatividade e alucinações`)
    console.log(`   Recomendação: Reduzir para 0.3-0.4 para análises médicas`)
  } else {
    console.log(`✅ Temperature (${temp}) está adequada`)
  }

  // Check for instructions about being comprehensive
  const systemLower = agent.systemPrompt.toLowerCase()
  const analysisLower = agent.analysisPrompt.toLowerCase()

  if (systemLower.includes('abrangente') || systemLower.includes('completo')) {
    console.log(`⚠️  System prompt encoraja análise "abrangente" - pode levar a inferências`)
  }

  if (analysisLower.includes('considere') || analysisLower.includes('avalie')) {
    console.log(`⚠️  Analysis prompt tem linguagem que pode encorajar inferências`)
  }

  // Check for anti-hallucination instructions
  const hasAntiHallucination =
    systemLower.includes('apenas') && systemLower.includes('disponível') ||
    systemLower.includes('não invente') ||
    systemLower.includes('não mencione')

  if (!hasAntiHallucination) {
    console.log(`⚠️  Prompt NÃO tem instruções explícitas contra alucinação`)
    console.log(`   Recomendação: Adicionar instruções como:`)
    console.log(`   - "Mencione APENAS parâmetros presentes nos documentos"`)
    console.log(`   - "Se um parâmetro não foi testado, diga 'não disponível'"`)
  } else {
    console.log(`✅ Prompt tem instruções anti-alucinação`)
  }

  console.log('\n=== FIM DA INVESTIGAÇÃO ===')
}

investigate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
