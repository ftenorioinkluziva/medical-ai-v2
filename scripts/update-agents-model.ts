import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function updateAgentsModel() {
  // Modelo a usar (altere aqui para testar diferentes modelos)
  const NEW_MODEL = 'gemini-2.0-flash'  // ⭐ Recomendado: menos alucinações

  console.log(`🔄 Atualizando modelo de TODOS os agentes para: ${NEW_MODEL}\n`)

  const agents = await db.select().from(healthAgents)

  console.log(`Total de agentes: ${agents.length}\n`)

  for (const agent of agents) {
    console.log(`📝 Atualizando: ${agent.name} (${agent.agentKey})`)
    console.log(`   Modelo atual: ${agent.modelName}`)

    const [result] = await db
      .update(healthAgents)
      .set({
        modelName: NEW_MODEL,
      })
      .where(eq(healthAgents.id, agent.id))
      .returning()

    if (result) {
      console.log(`   ✅ Novo modelo: ${result.modelName}\n`)
    } else {
      console.log(`   ❌ Erro na atualização\n`)
    }
  }

  console.log('═══════════════════════════════════════')
  console.log('🎉 Atualização concluída!')
  console.log('═══════════════════════════════════════')
  console.log(`\n✅ Todos os agentes agora usam: ${NEW_MODEL}`)
  console.log('\n🧪 Teste a complete analysis novamente!')
  console.log('\n💡 Modelos alternativos para testar:')
  console.log('   - gemini-2.0-flash (recomendado)')
  console.log('   - gemini-1.5-pro (mais preciso, mais caro)')
  console.log('   - gemini-1.5-flash (antigo, estável)')
}

updateAgentsModel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
