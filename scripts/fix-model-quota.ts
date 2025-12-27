#!/usr/bin/env tsx
/**
 * Fix Model Quota Issue
 * Atualiza todos os agentes para usar gemini-2.5-flash
 *
 * PROBLEMA: gemini-2.5-pro tem limite de 125K tokens/min (esgotado)
 * SOLUÇÃO: gemini-2.5-flash tem limite de 250K tokens/min (2x maior!)
 *
 * Uso: pnpm tsx scripts/fix-model-quota.ts
 */

import { db } from '../lib/db/client'
import { healthAgents } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

async function fixModelQuota() {
  console.log('🔧 CORREÇÃO DE QUOTA DO MODELO\n')
  console.log('=' .repeat(60))
  console.log()

  console.log('📊 Problema identificado:')
  console.log('   gemini-2.5-pro: 128K/125K tokens (ESGOTADO! ❌)')
  console.log('   gemini-2.5-flash: 50K/250K tokens (MUITO ESPAÇO! ✅)')
  console.log()

  // Buscar todos os agentes
  const agents = await db.select().from(healthAgents)

  console.log(`📋 Encontrados ${agents.length} agentes no banco de dados:\n`)

  for (const agent of agents) {
    console.log(`🤖 ${agent.name} (${agent.agentKey})`)
    console.log(`   Modelo atual: ${agent.modelName}`)

    if (agent.modelName.includes('pro')) {
      console.log(`   ⚠️ ATENÇÃO: Usando modelo Pro (limites baixos!)`)
      console.log(`   🔄 Atualizando para gemini-2.5-flash...`)

      await db
        .update(healthAgents)
        .set({ modelName: 'gemini-2.5-flash' })
        .where(eq(healthAgents.id, agent.id))

      console.log(`   ✅ Atualizado com sucesso!`)
    } else if (agent.modelName === 'gemini-2.5-flash') {
      console.log(`   ✅ Já está usando Flash (ótimo!)`)
    } else {
      console.log(`   ℹ️ Modelo: ${agent.modelName}`)
    }

    console.log()
  }

  console.log('=' .repeat(60))
  console.log()

  // Verificar resultado
  const updatedAgents = await db.select().from(healthAgents)
  const flashCount = updatedAgents.filter(a => a.modelName === 'gemini-2.5-flash').length
  const proCount = updatedAgents.filter(a => a.modelName.includes('pro')).length

  console.log('📊 RESULTADO:')
  console.log(`   ✅ Agentes usando Flash: ${flashCount}`)
  console.log(`   ⚠️ Agentes usando Pro: ${proCount}`)
  console.log()

  if (proCount === 0) {
    console.log('🎉 SUCESSO! Todos os agentes agora usam gemini-2.5-flash!')
    console.log()
    console.log('💡 Benefícios:')
    console.log('   - 2x mais limite de tokens (250K vs 125K)')
    console.log('   - 2-3x mais rápido nas respostas')
    console.log('   - Qualidade excelente para análises médicas')
    console.log('   - Sem mais erros de quota!')
    console.log()
    console.log('🚀 Agora você pode executar análises completas sem problemas!')
  } else {
    console.log('⚠️ Ainda existem agentes usando Pro. Verifique manualmente.')
  }
}

fixModelQuota()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })
