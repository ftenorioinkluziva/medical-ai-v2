import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'

async function verifyAllAgents() {
  console.log('=== VERIFICAÇÃO: Todos os Agentes ===\n')

  const agents = await db.select().from(healthAgents)

  let allUpdated = true

  for (const agent of agents) {
    const hasRules = agent.analysisPrompt.includes('REGRAS CRÍTICAS DE VALIDAÇÃO')
    const hasExamples = agent.analysisPrompt.includes('EXEMPLOS DO QUE FAZER')
    const hasAntiHallucination = agent.analysisPrompt.includes('NUNCA mencione parâmetros que NÃO estão na lista')

    console.log(`📋 ${agent.name} (${agent.agentKey}):`)
    console.log(`   ✅ Tem "REGRAS CRÍTICAS"? ${hasRules}`)
    console.log(`   ✅ Tem "EXEMPLOS"? ${hasExamples}`)
    console.log(`   ✅ Tem instruções anti-alucinação? ${hasAntiHallucination}`)

    if (!hasRules || !hasExamples || !hasAntiHallucination) {
      console.log(`   ❌ ATENÇÃO: Prompt incompleto!\n`)
      allUpdated = false
    } else {
      console.log(`   ✅ Prompt atualizado corretamente!\n`)
    }
  }

  console.log('═══════════════════════════════════════')
  if (allUpdated) {
    console.log('🎉 TODOS OS AGENTES ESTÃO ATUALIZADOS!')
    console.log('═══════════════════════════════════════')
    console.log('\n✅ Sistema de validação completo:')
    console.log('   1. Prevenção: Prompts com regras anti-alucinação')
    console.log('   2. Detecção: Lista de parâmetros disponíveis')
    console.log('   3. Bloqueio: Validação automática pós-geração')
    console.log('\n🧪 Sistema pronto para teste!')
  } else {
    console.log('❌ ALGUNS AGENTES PRECISAM SER ATUALIZADOS')
  }
}

verifyAllAgents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
