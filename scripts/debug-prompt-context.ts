import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { healthAgents, documents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { buildParametersContext } from '@/lib/ai/synthesis/parameter-extractor'

async function debug() {
  console.log('=== DEBUG: Contexto do Prompt ===\n')

  // 1. Verificar se o prompt foi atualizado
  const [agent] = await db
    .select()
    .from(healthAgents)
    .where(eq(healthAgents.agentKey, 'integrativa'))

  console.log('1. VERIFICAÇÃO DO ANALYSIS PROMPT ATUALIZADO:')
  const hasValidationRules = agent.analysisPrompt.includes('REGRAS CRÍTICAS DE VALIDAÇÃO')
  const hasExamples = agent.analysisPrompt.includes('EXEMPLOS DO QUE FAZER')

  console.log(`   ✅ Tem "REGRAS CRÍTICAS DE VALIDAÇÃO"? ${hasValidationRules}`)
  console.log(`   ✅ Tem "EXEMPLOS DO QUE FAZER"? ${hasExamples}`)

  if (!hasValidationRules || !hasExamples) {
    console.log('   ⚠️  PROMPT NÃO FOI ATUALIZADO CORRETAMENTE!')
    console.log('   Primeiros 500 chars do analysisPrompt:')
    console.log(agent.analysisPrompt.substring(0, 500))
    return
  }

  console.log('   ✅ Prompt foi atualizado corretamente\n')

  // 2. Simular o contexto que seria enviado
  const userId = 'b920cba7-947a-4c50-a2be-3001912b51a8'
  const docId = 'ab23c0d9-645b-4aa5-8d07-eba90bb59e61'

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, docId))

  if (!doc || !doc.structuredData) {
    console.log('❌ Documento ou structured data não encontrado')
    return
  }

  console.log('2. CONTEXTO DE PARÂMETROS QUE SERIA ENVIADO:')
  const parametersContext = buildParametersContext([doc.structuredData])
  console.log(parametersContext)

  // 3. Verificar se T3 Livre ou Cortisol estão na lista
  console.log('\n3. VERIFICAÇÃO DE PARÂMETROS ESPECÍFICOS:')
  const hasT3 = parametersContext.toLowerCase().includes('t3')
  const hasCortisol = parametersContext.toLowerCase().includes('cortisol')

  console.log(`   T3 mencionado nos parâmetros? ${hasT3}`)
  console.log(`   Cortisol mencionado nos parâmetros? ${hasCortisol}`)

  if (hasT3 || hasCortisol) {
    console.log('   ⚠️  PROBLEMA: T3/Cortisol estão na lista de parâmetros!')
    console.log('   Isso explica porque a IA está mencionando')
  } else {
    console.log('   ✅ T3/Cortisol NÃO estão na lista (correto)')
    console.log('\n   🤔 Se a IA ainda menciona, pode ser:')
    console.log('      1. Informação vindo do RAG (knowledge base)')
    console.log('      2. Modelo ignorando as instruções')
    console.log('      3. Contexto de documentos não estruturados')
  }

  // 4. Verificar tamanho do prompt completo
  console.log('\n4. TAMANHO DO CONTEXTO:')
  console.log(`   Analysis Prompt: ${agent.analysisPrompt.length} chars`)
  console.log(`   Parameters Context: ${parametersContext.length} chars`)
  console.log(`   Documento extractedText: ${doc.extractedText?.length || 0} chars`)

  const totalApprox = agent.analysisPrompt.length + parametersContext.length + (doc.extractedText?.length || 0)
  console.log(`   Total aproximado: ${totalApprox} chars (~${Math.round(totalApprox/4)} tokens)`)

  if (totalApprox > 100000) {
    console.log('   ⚠️  Contexto muito grande! Pode estar truncando as instruções')
  }

  console.log('\n=== FIM DO DEBUG ===')
}

debug()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
