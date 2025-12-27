import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { healthAgents, documents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { buildParametersContext } from '@/lib/ai/synthesis/parameter-extractor'

async function debugActualPrompt() {
  console.log('=== DEBUG: Prompt Real Enviado ao AI ===\n')

  // 1. Get agent
  const [agent] = await db
    .select()
    .from(healthAgents)
    .where(eq(healthAgents.agentKey, 'integrativa'))

  if (!agent) {
    console.log('❌ Agente não encontrado')
    return
  }

  // 2. Get document
  const userId = 'b920cba7-947a-4c50-a2be-3001912b51a8'
  const docId = 'ab23c0d9-645b-4aa5-8d07-eba90bb59e61'

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, docId))

  if (!doc || !doc.structuredData) {
    console.log('❌ Documento não encontrado')
    return
  }

  // 3. Build parameters context (as the code does)
  const parametersContext = buildParametersContext([doc.structuredData])

  // 4. Build prompt parts (same order as analyze.ts)
  const parts = [agent.analysisPrompt]

  // Parameters list comes FIRST (validation layer)
  if (parametersContext) {
    parts.push('\n\n' + parametersContext)
  }

  const userPrompt = parts.join('\n')

  // 5. Analyze prompt
  console.log('📊 TAMANHO DO PROMPT:')
  console.log(`   analysisPrompt: ${agent.analysisPrompt.length} chars`)
  console.log(`   parametersContext: ${parametersContext.length} chars`)
  console.log(`   TOTAL userPrompt: ${userPrompt.length} chars (~${Math.round(userPrompt.length/4)} tokens)`)

  // 6. Check if critical instructions are present
  console.log('\n🔍 VERIFICAÇÃO DE INSTRUÇÕES CRÍTICAS:')
  const hasRules = userPrompt.includes('REGRAS CRÍTICAS DE VALIDAÇÃO')
  const hasParametersList = userPrompt.includes('📊 PARÂMETROS DISPONÍVEIS NOS DOCUMENTOS')
  const hasT3Warning = userPrompt.includes('T3 não está na lista')
  const hasCortisolWarning = userPrompt.includes('Cortisol não está na lista')
  const hasNeverMention = userPrompt.includes('NUNCA mencione parâmetros que NÃO estão na lista')

  console.log(`   ✅ Tem "REGRAS CRÍTICAS"? ${hasRules}`)
  console.log(`   ✅ Tem "PARÂMETROS DISPONÍVEIS"? ${hasParametersList}`)
  console.log(`   ✅ Tem aviso sobre T3? ${hasT3Warning}`)
  console.log(`   ✅ Tem aviso sobre Cortisol? ${hasCortisolWarning}`)
  console.log(`   ✅ Tem "NUNCA mencione"? ${hasNeverMention}`)

  // 7. Check if T3/Cortisol are in the parameters list
  console.log('\n🔍 VERIFICAÇÃO DE PARÂMETROS ESPECÍFICOS NA LISTA:')
  const paramsLower = parametersContext.toLowerCase()
  const hasT3InList = paramsLower.includes('t3 livre') || paramsLower.includes('t3livre')
  const hasCortisolInList = paramsLower.includes('cortisol')

  console.log(`   T3 Livre na lista? ${hasT3InList} ${hasT3InList ? '⚠️ PROBLEMA!' : '✅ Correto'}`)
  console.log(`   Cortisol na lista? ${hasCortisolInList} ${hasCortisolInList ? '⚠️ PROBLEMA!' : '✅ Correto'}`)

  // 8. Show first 2000 chars of prompt
  console.log('\n📄 PRIMEIROS 2000 CARACTERES DO PROMPT:')
  console.log('─'.repeat(80))
  console.log(userPrompt.substring(0, 2000))
  console.log('─'.repeat(80))
  console.log('...')

  // 9. Show section where parameters list starts
  const paramsIndex = userPrompt.indexOf('📊 PARÂMETROS DISPONÍVEIS')
  if (paramsIndex !== -1) {
    console.log('\n📋 SEÇÃO DE PARÂMETROS DISPONÍVEIS:')
    console.log('─'.repeat(80))
    console.log(userPrompt.substring(paramsIndex, paramsIndex + 1500))
    console.log('─'.repeat(80))
  }

  // 10. Check for potential issues
  console.log('\n🚨 ANÁLISE DE PROBLEMAS POTENCIAIS:')

  if (userPrompt.length > 50000) {
    console.log('   ⚠️  PROBLEMA: Prompt muito grande (>50k chars), pode estar truncando')
  }

  if (!hasRules || !hasParametersList) {
    console.log('   ⚠️  PROBLEMA: Instruções críticas não encontradas no prompt!')
  }

  if (hasT3InList || hasCortisolInList) {
    console.log('   ⚠️  PROBLEMA: T3/Cortisol estão na lista de parâmetros (não deveriam estar)!')
  }

  // 11. Check position of instructions
  const rulesIndex = userPrompt.indexOf('REGRAS CRÍTICAS')
  const paramsListIndex = userPrompt.indexOf('📊 PARÂMETROS DISPONÍVEIS')

  if (rulesIndex === -1 || paramsListIndex === -1) {
    console.log('   ⚠️  PROBLEMA: Não consegui encontrar as seções críticas')
  } else if (rulesIndex > paramsListIndex) {
    console.log('   ⚠️  POSSÍVEL PROBLEMA: Regras vêm DEPOIS da lista de parâmetros')
    console.log(`      (Regras em: ${rulesIndex}, Lista em: ${paramsListIndex})`)
  } else {
    console.log(`   ✅ Ordem correta: Regras (pos ${rulesIndex}) → Lista (pos ${paramsListIndex})`)
  }

  console.log('\n=== FIM DO DEBUG ===')
}

debugActualPrompt()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
