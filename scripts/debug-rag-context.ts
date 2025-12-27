import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { healthAgents, documents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { buildKnowledgeContext } from '@/lib/ai/knowledge'

async function debugRAGContext() {
  console.log('=== DEBUG: RAG Context ===\n')

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
  const docId = 'ab23c0d9-645b-4aa5-8d07-eba90bb59e61'

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, docId))

  if (!doc) {
    console.log('❌ Documento não encontrado')
    return
  }

  // 3. Build knowledge context (same as orchestrator does)
  const documentsContext = doc.extractedText || ''
  const searchQuery = agent.analysisPrompt + '\n\n' + documentsContext.substring(0, 500)

  console.log('📊 QUERY PARA RAG:')
  console.log('─'.repeat(80))
  console.log(searchQuery.substring(0, 500))
  console.log('─'.repeat(80))
  console.log('...\n')

  console.log('🔍 Buscando conhecimento médico relevante...\n')

  const knowledgeContext = await buildKnowledgeContext(searchQuery, {
    maxChunks: 3,
    maxCharsPerChunk: 2000,
    agentId: agent.id,
  })

  console.log('📚 CONHECIMENTO RETORNADO (RAG):')
  console.log(`   Tamanho: ${knowledgeContext.length} chars`)
  console.log('─'.repeat(80))
  console.log(knowledgeContext)
  console.log('─'.repeat(80))

  // 4. Check if T3/Cortisol are mentioned in RAG
  console.log('\n🔍 VERIFICAÇÃO DE CONTAMINAÇÃO:')
  const ragLower = knowledgeContext.toLowerCase()

  const hasT3 = ragLower.includes('t3') || ragLower.includes('triiodotironina')
  const hasCortisol = ragLower.includes('cortisol')
  const hasThyroid = ragLower.includes('tireoid') || ragLower.includes('tireoide')
  const hasAdrenal = ragLower.includes('adrenal') || ragLower.includes('estresse')

  console.log(`   T3/Triiodotironina mencionado? ${hasT3} ${hasT3 ? '⚠️ PROBLEMA!' : '✅'}`)
  console.log(`   Cortisol mencionado? ${hasCortisol} ${hasCortisol ? '⚠️ PROBLEMA!' : '✅'}`)
  console.log(`   Tireoide mencionado? ${hasThyroid} ${hasThyroid ? '⚠️ Pode induzir!' : '✅'}`)
  console.log(`   Adrenal/Estresse mencionado? ${hasAdrenal} ${hasAdrenal ? '⚠️ Pode induzir!' : '✅'}`)

  if (hasT3 || hasCortisol || hasThyroid || hasAdrenal) {
    console.log('\n🚨 DIAGNÓSTICO:')
    console.log('   O RAG está trazendo conhecimento GERAL sobre T3, Cortisol, Tireoide ou Adrenal.')
    console.log('   O modelo pode estar confundindo conhecimento geral com dados do paciente!')
    console.log('\n💡 SOLUÇÃO:')
    console.log('   1. DESABILITAR RAG temporariamente para testar')
    console.log('   2. Ou MODIFICAR o prompt do RAG para distinguir claramente:')
    console.log('      - Conhecimento geral (contexto teórico)')
    console.log('      - Dados do paciente (parâmetros medidos)')
  } else {
    console.log('\n✅ RAG parece limpo - o problema pode estar em outro lugar')
  }

  console.log('\n=== FIM DO DEBUG ===')
}

debugRAGContext()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
