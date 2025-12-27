import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { documents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function checkExtractedText() {
  console.log('=== VERIFICAÇÃO: Texto Extraído do PDF ===\n')

  const docId = 'ab23c0d9-645b-4aa5-8d07-eba90bb59e61'

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, docId))

  if (!doc) {
    console.log('❌ Documento não encontrado')
    return
  }

  const text = doc.extractedText || ''

  console.log('📄 INFORMAÇÕES DO DOCUMENTO:')
  console.log(`   Tamanho: ${text.length} chars`)
  console.log(`   Tipo: ${doc.documentType}`)
  console.log(`   Nome: ${doc.fileName}`)

  console.log('\n🔍 BUSCANDO MENÇÕES PROBLEMÁTICAS:')

  const textLower = text.toLowerCase()

  // Buscar T3
  const hasT3 = textLower.includes('t3')
  const hasTriiodotironina = textLower.includes('triiodotironina')
  const hasT3Livre = textLower.includes('t3 livre')

  // Buscar Cortisol
  const hasCortisol = textLower.includes('cortisol')

  // Buscar TGO
  const hasTGO = textLower.includes('tgo')
  const hasAST = textLower.includes('ast')

  console.log(`   T3: ${hasT3} ${hasT3 ? '⚠️' : '✅'}`)
  console.log(`   T3 Livre: ${hasT3Livre} ${hasT3Livre ? '⚠️' : '✅'}`)
  console.log(`   Triiodotironina: ${hasTriiodotironina} ${hasTriiodotironina ? '⚠️' : '✅'}`)
  console.log(`   Cortisol: ${hasCortisol} ${hasCortisol ? '⚠️' : '✅'}`)
  console.log(`   TGO: ${hasTGO} ${hasTGO ? '⚠️' : '✅'}`)
  console.log(`   AST: ${hasAST} ${hasAST ? '⚠️' : '✅'}`)

  // Se encontrou, mostrar contexto
  if (hasT3 || hasCortisol || hasTGO || hasAST) {
    console.log('\n📋 CONTEXTO DAS MENÇÕES:\n')

    if (hasT3) {
      const index = textLower.indexOf('t3')
      const context = text.substring(Math.max(0, index - 100), Math.min(text.length, index + 100))
      console.log('T3:')
      console.log('─'.repeat(80))
      console.log(context.replace(/\n/g, ' '))
      console.log('─'.repeat(80))
      console.log()
    }

    if (hasCortisol) {
      const index = textLower.indexOf('cortisol')
      const context = text.substring(Math.max(0, index - 100), Math.min(text.length, index + 100))
      console.log('Cortisol:')
      console.log('─'.repeat(80))
      console.log(context.replace(/\n/g, ' '))
      console.log('─'.repeat(80))
      console.log()
    }

    if (hasTGO) {
      const index = textLower.indexOf('tgo')
      const context = text.substring(Math.max(0, index - 100), Math.min(text.length, index + 100))
      console.log('TGO:')
      console.log('─'.repeat(80))
      console.log(context.replace(/\n/g, ' '))
      console.log('─'.repeat(80))
      console.log()
    }

    if (hasAST && !hasTGO) {
      const index = textLower.indexOf('ast')
      const context = text.substring(Math.max(0, index - 100), Math.min(text.length, index + 100))
      console.log('AST:')
      console.log('─'.repeat(80))
      console.log(context.replace(/\n/g, ' '))
      console.log('─'.repeat(80))
      console.log()
    }

    console.log('🚨 DIAGNÓSTICO:')
    console.log('   O PDF menciona esses parâmetros no texto extraído!')
    console.log('   O AI está lendo isso e achando que foram testados.')
    console.log('\n💡 POSSÍVEIS SOLUÇÕES:')
    console.log('   1. REMOVER documentsContext (texto extraído) e usar APENAS structuredData')
    console.log('   2. Adicionar AVISO mais forte no prompt sobre documentContext vs parâmetros')
    console.log('   3. Limpar o extractedText para remover menções a parâmetros não testados')
  } else {
    console.log('\n✅ Texto extraído está limpo - problema está em outro lugar')
  }

  console.log('\n=== FIM DA VERIFICAÇÃO ===')
}

checkExtractedText()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
