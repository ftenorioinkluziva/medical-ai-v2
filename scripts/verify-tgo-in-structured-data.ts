import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { documents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function verify() {
  const labReportId = 'ab23c0d9-645b-4aa5-8d07-eba90bb59e61'

  console.log('=== VERIFICAÇÃO: TGO/AST no Laudo Estruturado ===\n')

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, labReportId))

  if (!doc) {
    console.log('Documento não encontrado!')
    return
  }

  console.log(`Documento: ${doc.fileName}`)
  console.log(`Tipo: ${doc.documentType}\n`)

  if (!doc.structuredData) {
    console.log('Structured data não encontrado!')
    return
  }

  const structuredData = doc.structuredData as any
  const structuredStr = JSON.stringify(structuredData, null, 2)

  console.log('=== BUSCA POR TGO/AST ===\n')

  // 1. Busca case-insensitive no JSON completo
  const matches: string[] = []
  const lines = structuredStr.split('\n')

  lines.forEach((line, idx) => {
    const lower = line.toLowerCase()
    if (lower.includes('tgo') || lower.includes('ast')) {
      // Filtrar menções óbvias que não são o marcador
      if (!lower.includes('bastonete') && !lower.includes('bastos')) {
        matches.push(`Linha ${idx + 1}: ${line}`)
      }
    }
  })

  console.log(`Matches encontrados (excluindo BASTONETES/BASTOS): ${matches.length}\n`)

  if (matches.length > 0) {
    console.log('Matches:')
    matches.forEach(m => console.log(m))
  } else {
    console.log('✓ NENHUM MATCH ENCONTRADO para TGO ou AST (excluindo BASTONETES/BASTOS)')
  }

  // 2. Procurar especificamente por marcadores hepáticos nos módulos
  console.log('\n\n=== MARCADORES HEPÁTICOS NOS MÓDULOS ===\n')

  const modules = structuredData.modules || []
  const hepaticMarkers = ['tgo', 'tgp', 'ast', 'alt', 'gama gt', 'fosfatase alcalina', 'bilirrubina']

  let foundHepatic = false

  modules.forEach((module: any, idx: number) => {
    const moduleName = module.moduleName || module.category || 'Unknown'
    const parameters = module.parameters || []

    parameters.forEach((param: any) => {
      const paramName = (param.name || '').toLowerCase()

      hepaticMarkers.forEach(marker => {
        if (paramName.includes(marker)) {
          foundHepatic = true
          console.log(`\nMódulo ${idx + 1}: ${moduleName}`)
          console.log(`  Parâmetro: ${param.name}`)
          console.log(`  Valor: ${param.value} ${param.unit || ''}`)
          if (param.referenceRange) {
            console.log(`  Referência: ${param.referenceRange}`)
          }
        }
      })
    })
  })

  if (!foundHepatic) {
    console.log('✓ NENHUM MARCADOR HEPÁTICO ENCONTRADO nos módulos estruturados')
  }

  // 3. Listar TODOS os parâmetros disponíveis
  console.log('\n\n=== TODOS OS PARÂMETROS DISPONÍVEIS ===\n')

  const allParams: string[] = []

  modules.forEach((module: any) => {
    const parameters = module.parameters || []
    parameters.forEach((param: any) => {
      if (param.name) {
        allParams.push(param.name)
      }
    })
  })

  console.log(`Total de parâmetros: ${allParams.length}`)
  console.log('\nParâmetros (ordenados alfabeticamente):')
  allParams.sort().forEach((param, idx) => {
    console.log(`  ${idx + 1}. ${param}`)
  })

  console.log('\n\n=== CONCLUSÃO ===')
  console.log('\nProcurando especificamente por "TGO" ou "AST" (case-insensitive):')

  const hasTGO = allParams.some(p => p.toLowerCase().includes('tgo'))
  const hasAST = allParams.some(p =>
    p.toLowerCase().includes('ast') &&
    !p.toLowerCase().includes('bastonete') &&
    !p.toLowerCase().includes('bastos')
  )

  console.log(`  - TGO encontrado? ${hasTGO ? 'SIM' : 'NÃO'}`)
  console.log(`  - AST encontrado (excluindo bastonetes/bastos)? ${hasAST ? 'SIM' : 'NÃO'}`)

  if (!hasTGO && !hasAST) {
    console.log('\n⚠️  CONFIRMADO: O laudo NÃO contém o marcador TGO/AST!')
    console.log('⚠️  O valor "TGO (AST) 230 U/L" mencionado na synthesis foi INVENTADO pela IA!')
  }
}

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
