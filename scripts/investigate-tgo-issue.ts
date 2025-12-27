import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables before any other imports
config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { analyses, documents, healthAgents, completeAnalyses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function investigate() {
  // ID fornecido pelo usuário - mas parece ser de uma análise individual, não complete_analysis
  const providedAnalysisId = '02fc6908-2a5a-4076-b1e9-de9ccf4ada1f'
  const userId = 'b920cba7-947a-4c50-a2be-3001912b51a8'

  // Buscar a complete_analysis do usuário que contém TGO/AST
  const correctCompleteAnalysisId = '7218d139-1a9f-48d5-80ec-27f7c8e26743'

  console.log('=== NOTA: Investigando a complete_analysis correta ===')
  console.log(`ID fornecido: ${providedAnalysisId}`)
  console.log(`ID correto encontrado: ${correctCompleteAnalysisId}\n`)

  const analysisId = correctCompleteAnalysisId

  console.log('=== INVESTIGAÇÃO: Análise com TGO/AST inexistente ===\n')

  // 1. Buscar complete_analysis
  console.log('1. COMPLETE ANALYSIS:')
  const [completeAnalysis] = await db
    .select()
    .from(completeAnalyses)
    .where(eq(completeAnalyses.id, analysisId))

  if (!completeAnalysis) {
    console.log('❌ Complete Analysis não encontrada!')
    return
  }

  console.log(`- ID: ${completeAnalysis.id}`)
  console.log(`- User ID: ${completeAnalysis.userId}`)
  console.log(`- Status: ${completeAnalysis.status}`)
  console.log(`- Document IDs: ${JSON.stringify(completeAnalysis.documentIds)}`)
  console.log(`- Created at: ${completeAnalysis.createdAt}`)
  console.log(`- Completed at: ${completeAnalysis.completedAt}`)

  console.log('\n- Análises individuais:')
  console.log(`  Integrativa: ${completeAnalysis.integrativeAnalysisId}`)
  console.log(`  Nutrição: ${completeAnalysis.nutritionAnalysisId}`)
  console.log(`  Exercício: ${completeAnalysis.exerciseAnalysisId}`)

  if (!completeAnalysis.synthesis) {
    console.log('\n- ⚠️  SYNTHESIS: null/undefined')
  } else {
    const synthesisStr = JSON.stringify(completeAnalysis.synthesis, null, 2)
    console.log('\n- SYNTHESIS:')
    console.log(synthesisStr)

    // Procurar por TGO/AST no synthesis
    const hasTGO = synthesisStr.toLowerCase().includes('tgo') || synthesisStr.toLowerCase().includes('ast')
    console.log(`\n- ⚠️  Synthesis contém TGO/AST? ${hasTGO ? 'SIM' : 'NÃO'}`)

    if (hasTGO) {
      // Mostrar trechos específicos
      const lines = synthesisStr.split('\n')
      console.log('\n- Trechos com TGO/AST:')
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes('tgo') || line.toLowerCase().includes('ast')) {
          console.log(`  ${line}`)
        }
      })
    }
  }

  // 2. Buscar documentos analisados
  console.log('\n\n2. DOCUMENTOS ANALISADOS:')
  const docIds = completeAnalysis.documentIds as string[]
  console.log(`- Total: ${docIds.length}`)

  for (const docId of docIds) {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, docId))

    if (doc) {
      console.log(`- Nome: ${doc.fileName}`)
      console.log(`- Tipo: ${doc.documentType}`)
      console.log(`- Tamanho texto extraído: ${doc.extractedText?.length || 0} chars`)

      const extractedText = doc.extractedText || ''
      const hasTGOInDoc = extractedText.toLowerCase().includes('tgo') || extractedText.toLowerCase().includes('ast')
      console.log(`- ⚠️  Documento contém TGO/AST? ${hasTGOInDoc ? 'SIM' : 'NÃO'}`)

      if (hasTGOInDoc) {
        console.log('\n- Trechos com TGO/AST:')
        const lines = extractedText.split('\n')
        lines.forEach((line, idx) => {
          if (line.toLowerCase().includes('tgo') || line.toLowerCase().includes('ast')) {
            console.log(`  Linha ${idx + 1}: ${line}`)
          }
        })
      }

      console.log(`\n- Structured Data presente? ${doc.structuredData ? 'SIM' : 'NÃO'}`)
      if (doc.structuredData) {
        const structuredStr = typeof doc.structuredData === 'string'
          ? doc.structuredData
          : JSON.stringify(doc.structuredData, null, 2)

        const hasTGOInStructured = structuredStr.toLowerCase().includes('tgo') || structuredStr.toLowerCase().includes('ast')
        console.log(`- ⚠️  Structured Data contém TGO/AST? ${hasTGOInStructured ? 'SIM' : 'NÃO'}`)

        console.log('\n- STRUCTURED DATA (primeiros 3000 chars):')
        console.log(structuredStr.substring(0, 3000))
      }

      console.log('\n- TEXTO EXTRAÍDO (primeiros 3000 chars):')
      console.log(extractedText.substring(0, 3000))
    }
  }

  // 3. Buscar análises individuais referenciadas
  console.log('\n\n3. ANÁLISES INDIVIDUAIS REFERENCIADAS:')
  const individualAnalysisIds = [
    completeAnalysis.integrativeAnalysisId,
    completeAnalysis.nutritionAnalysisId,
    completeAnalysis.exerciseAnalysisId
  ].filter(id => id !== null)

  for (const id of individualAnalysisIds) {
    const [indAnalysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.id, id!))

    if (indAnalysis) {
      console.log(`\n  Analysis ID: ${indAnalysis.id}`)
      console.log(`  Agent ID: ${indAnalysis.agentId}`)
      console.log(`  Document ID: ${indAnalysis.documentId || 'undefined'}`)

      // Buscar nome do agente
      if (indAnalysis.agentId) {
        const [agent] = await db
          .select()
          .from(healthAgents)
          .where(eq(healthAgents.id, indAnalysis.agentId))

        if (agent) {
          console.log(`  Agente: ${agent.name}`)
        }
      }

      if (indAnalysis.result) {
        const resultStr = typeof indAnalysis.result === 'string'
          ? indAnalysis.result
          : JSON.stringify(indAnalysis.result, null, 2)
        const hasTGO = resultStr.toLowerCase().includes('tgo') || resultStr.toLowerCase().includes('ast')
        console.log(`  ⚠️  Contém TGO/AST? ${hasTGO ? 'SIM' : 'NÃO'}`)

        if (hasTGO) {
          console.log(`\n  *** ESTA ANÁLISE INDIVIDUAL CONTÉM TGO/AST ***`)

          // Mostrar trechos específicos
          const lines = resultStr.split('\n')
          console.log('  Trechos com TGO/AST:')
          let count = 0
          lines.forEach((line) => {
            if (line.toLowerCase().includes('tgo') || line.toLowerCase().includes('ast')) {
              console.log(`    ${line}`)
              count++
              if (count > 20) return // Limitar a 20 linhas
            }
          })

          console.log('\n  Resultado completo (primeiros 5000 chars):')
          console.log(resultStr.substring(0, 5000))
        }
      } else {
        console.log('  Result: NULL')
      }
    }
  }

  // 4. Buscar TODOS os documentos do usuário
  console.log('\n\n4. TODOS OS DOCUMENTOS DO USUÁRIO:')
  const userDocs = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))

  console.log(`- Total de documentos: ${userDocs.length}`)

  for (const doc of userDocs) {
    const extractedText = doc.extractedText || ''
    const hasTGO = extractedText.toLowerCase().includes('tgo') || extractedText.toLowerCase().includes('ast')

    console.log(`\n  Doc ID: ${doc.id}`)
    console.log(`  Nome: ${doc.fileName}`)
    console.log(`  Contém TGO/AST? ${hasTGO ? 'SIM ⚠️' : 'NÃO'}`)

    if (hasTGO) {
      console.log('  Trechos:')
      const lines = extractedText.split('\n')
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes('tgo') || line.toLowerCase().includes('ast')) {
          console.log(`    ${line}`)
        }
      })
    }
  }


  console.log('\n\n=== FIM DA INVESTIGAÇÃO ===')
}

investigate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
