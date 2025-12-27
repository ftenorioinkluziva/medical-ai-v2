import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { healthAgents, documents, medicalProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { analyzeWithAgent } from '@/lib/ai/agents/analyze'

async function testWithoutRAG() {
  console.log('=== TESTE: Análise SEM RAG ===\n')

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

  // 3. Get profile
  const [profile] = await db
    .select()
    .from(medicalProfiles)
    .where(eq(medicalProfiles.userId, userId))

  const medicalProfileContext = profile
    ? `Idade: ${profile.age} anos
Sexo: ${profile.sex}
Peso: ${profile.weight} kg
Altura: ${profile.height} cm`
    : ''

  console.log('🧪 Executando análise SEM RAG (knowledge context)...\n')

  try {
    const result = await analyzeWithAgent(
      agent,
      agent.analysisPrompt,
      {
        documentsContext: doc.extractedText || '',
        medicalProfileContext,
        knowledgeContext: '',  // ❌ SEM RAG!
        structuredDocuments: [doc.structuredData],
        documentIds: [doc.id],
        enableValidation: true,
        instruction: `Esta é a ANÁLISE FUNDACIONAL.

⚠️ REGRA CRÍTICA: Analise APENAS os dados e parâmetros que estão EFETIVAMENTE DISPONÍVEIS nos documentos.
Se um sistema não tiver dados disponíveis, diga explicitamente "Dados não disponíveis para avaliar [sistema]".
NUNCA mencione parâmetros que não foram testados.`,
      }
    )

    console.log('✅ SUCESSO! Análise completada SEM erros de validação!\n')
    console.log(`   💡 Insights: ${result.insights.length}`)
    console.log(`   🎯 Action Items: ${result.actionItems.length}`)
    console.log(`   📏 Tamanho: ${result.analysis.length} chars`)

    console.log('\n📋 PRIMEIROS 1000 CARACTERES DA ANÁLISE:')
    console.log('─'.repeat(80))
    console.log(result.analysis.substring(0, 1000))
    console.log('─'.repeat(80))

    console.log('\n🎉 CONCLUSÃO: O problema É o RAG!')
    console.log('   O conhecimento médico geral está "contaminando" a análise.')
    console.log('   Solução: Desabilitar RAG ou melhorar o prompt sobre uso do RAG.')

  } catch (error: any) {
    console.error('❌ FALHOU! Ainda há alucinação mesmo sem RAG!\n')
    console.error(error.message)

    console.log('\n🤔 CONCLUSÃO: O problema NÃO é apenas o RAG!')
    console.log('   Pode ser:')
    console.log('   1. Cache do modelo')
    console.log('   2. Gemini 2.5 Flash ignorando instruções')
    console.log('   3. Outro fator desconhecido')
  }

  console.log('\n=== FIM DO TESTE ===')
}

testWithoutRAG()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
