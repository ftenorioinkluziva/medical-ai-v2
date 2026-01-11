/**
 * Auditoria de Sincronização: Base de Conhecimento vs Cérebro Lógico
 *
 * Este script analisa a base de conhecimento usando IA para:
 * 1. Extrair valores de referência mencionados nos artigos
 * 2. Extrair protocolos clínicos mencionados
 * 3. Comparar com os dados do Cérebro Lógico
 * 4. Gerar relatório de discrepâncias
 */

import { db } from '@/lib/db/client'
import { knowledgeArticles, biomarkersReference, protocols } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

// ========== CONFIGURAÇÕES ==========
const CONFIG = {
  // Modelo para análise (escolha baseada em necessidade)
  // - 'gemini-2.5-pro': Melhor precisão, raciocínio avançado (recomendado para auditoria crítica)
  // - 'gemini-2.5-flash': Mais rápido e econômico, ainda muito capaz
  // - 'gemini-3-pro-preview': Mais recente, experimentação (pode ter mudanças)
  model: 'gemini-2.5-pro' as const,

  // Limite de artigos para processar (0 = todos)
  // Recomendado: 10 para teste, 0 para auditoria completa
  articleLimit: 10,

  // Delay entre chamadas (ms) - evita rate limiting
  delayBetweenCalls: 1000,

  // Temperatura da IA (0.0-1.0)
  // Menor = mais consistente e conservador (recomendado para dados médicos)
  temperature: 0.1,
} as const
// ===================================

interface ExtractedBiomarker {
  name: string
  possibleSlugs: string[]
  optimalMin?: number
  optimalMax?: number
  labMin?: number
  labMax?: number
  unit?: string
  source: string
  confidence: 'high' | 'medium' | 'low'
}

interface ExtractedProtocol {
  condition: string
  recommendation: string
  dosage?: string
  type: 'supplement' | 'diet' | 'exercise' | 'medical'
  source: string
  confidence: 'high' | 'medium' | 'low'
}

interface ArticleAnalysis {
  articleId: string
  articleTitle: string
  biomarkers: ExtractedBiomarker[]
  protocols: ExtractedProtocol[]
}

interface DiscrepancyReport {
  biomarkerDiscrepancies: Array<{
    biomarkerName: string
    slug: string
    inLogicalBrain: {
      optimalMin?: number
      optimalMax?: number
      labMin?: number
      labMax?: number
      source?: string
      updatedAt?: Date
    } | null
    inKnowledgeBase: Array<{
      optimalMin?: number
      optimalMax?: number
      labMin?: number
      labMax?: number
      source: string
      confidence: string
    }>
    recommendation: string
  }>
  missingBiomarkers: Array<{
    name: string
    suggestedSlug: string
    references: Array<{
      source: string
      values: any
    }>
  }>
  protocolDiscrepancies: Array<{
    condition: string
    inLogicalBrain: boolean
    inKnowledgeBase: Array<{
      recommendation: string
      source: string
    }>
  }>
}

/**
 * Analisa um artigo da base de conhecimento usando IA
 */
async function analyzeArticle(article: any): Promise<ArticleAnalysis> {
  console.log(`\n📄 Analisando: ${article.title}`)

  const prompt = `Analise o seguinte artigo médico e extraia TODAS as informações sobre biomarcadores e protocolos clínicos.

ARTIGO:
Título: ${article.title}
Categoria: ${article.category}
Conteúdo: ${article.content}

INSTRUÇÕES:
1. Identifique TODOS os biomarcadores mencionados com valores de referência
2. Para cada biomarcador, extraia:
   - Nome completo
   - Possíveis slugs/identificadores (ex: "vitamina_d3", "25_hidroxi_vitamina_d")
   - Faixa ótima (optimal_min, optimal_max) se mencionada
   - Faixa laboratorial (lab_min, lab_max) se mencionada
   - Unidade de medida
   - Nível de confiança (high/medium/low)

3. Identifique TODOS os protocolos clínicos mencionados:
   - Condição que ativa o protocolo (ex: "vitamina D < 40")
   - Recomendação específica
   - Dosagem (se mencionada)
   - Tipo (supplement/diet/exercise/medical)
   - Nível de confiança (high/medium/low)

IMPORTANTE:
- Se o artigo mencionar "níveis ideais", "faixa ótima", "valores funcionais", extraia como optimalMin/optimalMax
- Se mencionar "limites laboratoriais", "valores de referência padrão", extraia como labMin/labMax
- Seja conservador: se não tiver certeza, marque como "low confidence"
- Retorne array vazio se não houver informações relevantes`

  try {
    // Usar Zod schema (método recomendado pelo AI SDK)
    const result = await generateObject({
      model: google(CONFIG.model),
      prompt,
      schema: z.object({
        biomarkers: z.array(z.object({
          name: z.string(),
          possibleSlugs: z.array(z.string()),
          optimalMin: z.number().optional(),
          optimalMax: z.number().optional(),
          labMin: z.number().optional(),
          labMax: z.number().optional(),
          unit: z.string().optional(),
          confidence: z.enum(['high', 'medium', 'low']),
        })),
        protocols: z.array(z.object({
          condition: z.string(),
          recommendation: z.string(),
          dosage: z.string().optional(),
          type: z.enum(['supplement', 'diet', 'exercise', 'medical']),
          confidence: z.enum(['high', 'medium', 'low']),
        })),
      }),
      temperature: CONFIG.temperature,
    })

    console.log(`   ✓ Biomarcadores encontrados: ${result.object.biomarkers.length}`)
    console.log(`   ✓ Protocolos encontrados: ${result.object.protocols.length}`)

    return {
      articleId: article.id,
      articleTitle: article.title,
      biomarkers: result.object.biomarkers.map(b => ({
        ...b,
        source: `${article.title} (${article.source || 'Base de Conhecimento'})`,
      })),
      protocols: result.object.protocols.map(p => ({
        ...p,
        source: `${article.title} (${article.source || 'Base de Conhecimento'})`,
      })),
    }
  } catch (error) {
    console.error(`   ❌ Erro ao analisar artigo:`, error)
    return {
      articleId: article.id,
      articleTitle: article.title,
      biomarkers: [],
      protocols: [],
    }
  }
}

/**
 * Compara os dados extraídos com o Cérebro Lógico
 */
async function compareWithLogicalBrain(
  analyses: ArticleAnalysis[]
): Promise<DiscrepancyReport> {
  console.log('\n🔍 Comparando com Cérebro Lógico...')

  // Carregar dados do Cérebro Lógico
  const logicalBiomarkers = await db.select().from(biomarkersReference)
  const logicalProtocols = await db.select().from(protocols)

  console.log(`   Cérebro Lógico: ${logicalBiomarkers.length} biomarcadores, ${logicalProtocols.length} protocolos`)

  const biomarkerDiscrepancies: DiscrepancyReport['biomarkerDiscrepancies'] = []
  const missingBiomarkers: DiscrepancyReport['missingBiomarkers'] = []
  const protocolDiscrepancies: DiscrepancyReport['protocolDiscrepancies'] = []

  // Agrupar biomarcadores extraídos por nome/slug
  const extractedBiomarkers = new Map<string, ExtractedBiomarker[]>()
  for (const analysis of analyses) {
    for (const bio of analysis.biomarkers) {
      for (const slug of bio.possibleSlugs) {
        if (!extractedBiomarkers.has(slug)) {
          extractedBiomarkers.set(slug, [])
        }
        extractedBiomarkers.get(slug)!.push(bio)
      }
    }
  }

  // Comparar cada biomarcador do Cérebro Lógico
  for (const logicalBio of logicalBiomarkers) {
    const knowledgeBaseRefs = extractedBiomarkers.get(logicalBio.slug) || []

    if (knowledgeBaseRefs.length > 0) {
      // Verificar discrepâncias
      const hasDiscrepancy = knowledgeBaseRefs.some(kb => {
        const optimalMinDiff = kb.optimalMin !== undefined &&
          Math.abs((kb.optimalMin || 0) - parseFloat(logicalBio.optimalMin as string || '0')) > 0.1
        const optimalMaxDiff = kb.optimalMax !== undefined &&
          Math.abs((kb.optimalMax || 0) - parseFloat(logicalBio.optimalMax as string || '0')) > 0.1

        return optimalMinDiff || optimalMaxDiff
      })

      if (hasDiscrepancy) {
        biomarkerDiscrepancies.push({
          biomarkerName: logicalBio.name,
          slug: logicalBio.slug,
          inLogicalBrain: {
            optimalMin: logicalBio.optimalMin ? parseFloat(logicalBio.optimalMin as string) : undefined,
            optimalMax: logicalBio.optimalMax ? parseFloat(logicalBio.optimalMax as string) : undefined,
            labMin: logicalBio.labMin ? parseFloat(logicalBio.labMin as string) : undefined,
            labMax: logicalBio.labMax ? parseFloat(logicalBio.labMax as string) : undefined,
            source: logicalBio.sourceRef || undefined,
            updatedAt: logicalBio.updatedAt || undefined,
          },
          inKnowledgeBase: knowledgeBaseRefs.map(kb => ({
            optimalMin: kb.optimalMin,
            optimalMax: kb.optimalMax,
            labMin: kb.labMin,
            labMax: kb.labMax,
            source: kb.source,
            confidence: kb.confidence,
          })),
          recommendation: 'REVISAR: Base de conhecimento tem valores diferentes',
        })
      }
    }
  }

  // Identificar biomarcadores na base de conhecimento que NÃO estão no Cérebro Lógico
  const logicalSlugs = new Set(logicalBiomarkers.map(b => b.slug))
  for (const [slug, refs] of extractedBiomarkers.entries()) {
    if (!logicalSlugs.has(slug) && refs.length > 0) {
      missingBiomarkers.push({
        name: refs[0].name,
        suggestedSlug: slug,
        references: refs.map(r => ({
          source: r.source,
          values: {
            optimalMin: r.optimalMin,
            optimalMax: r.optimalMax,
            labMin: r.labMin,
            labMax: r.labMax,
            unit: r.unit,
          },
        })),
      })
    }
  }

  console.log(`   ⚠️  Discrepâncias encontradas: ${biomarkerDiscrepancies.length}`)
  console.log(`   📝 Biomarcadores ausentes no Cérebro Lógico: ${missingBiomarkers.length}`)

  return {
    biomarkerDiscrepancies,
    missingBiomarkers,
    protocolDiscrepancies,
  }
}

/**
 * Gera relatório em Markdown
 */
function generateReport(report: DiscrepancyReport): string {
  const lines: string[] = []

  lines.push('# 📊 Relatório de Auditoria: Base de Conhecimento vs Cérebro Lógico')
  lines.push('')
  lines.push(`**Data da Auditoria:** ${new Date().toLocaleDateString('pt-BR')}`)
  lines.push(`**Modelo IA Usado:** ${CONFIG.model}`)
  lines.push(`**Temperatura:** ${CONFIG.temperature}`)
  lines.push('')

  // Sumário executivo
  lines.push('## 📋 Sumário Executivo')
  lines.push('')
  lines.push(`- **Discrepâncias de Valores:** ${report.biomarkerDiscrepancies.length}`)
  lines.push(`- **Biomarcadores Ausentes:** ${report.missingBiomarkers.length}`)
  lines.push(`- **Protocolos para Revisar:** ${report.protocolDiscrepancies.length}`)
  lines.push('')

  // Discrepâncias de valores
  if (report.biomarkerDiscrepancies.length > 0) {
    lines.push('## ⚠️ Discrepâncias de Valores de Referência')
    lines.push('')
    lines.push('Os seguintes biomarcadores têm valores diferentes na Base de Conhecimento:')
    lines.push('')

    for (const disc of report.biomarkerDiscrepancies) {
      lines.push(`### ${disc.biomarkerName} (\`${disc.slug}\`)`)
      lines.push('')
      lines.push('**Cérebro Lógico (Atual):**')
      if (disc.inLogicalBrain) {
        lines.push(`- Ótimo: ${disc.inLogicalBrain.optimalMin || '?'} - ${disc.inLogicalBrain.optimalMax || '?'}`)
        lines.push(`- Laboratorial: ${disc.inLogicalBrain.labMin || '?'} - ${disc.inLogicalBrain.labMax || '?'}`)
        lines.push(`- Fonte: ${disc.inLogicalBrain.source || 'Não especificada'}`)
        lines.push(`- Última atualização: ${disc.inLogicalBrain.updatedAt?.toLocaleDateString('pt-BR') || 'Desconhecida'}`)
      } else {
        lines.push('- **NÃO CADASTRADO**')
      }
      lines.push('')

      lines.push('**Base de Conhecimento:**')
      for (const kb of disc.inKnowledgeBase) {
        lines.push(`- Ótimo: ${kb.optimalMin || '?'} - ${kb.optimalMax || '?'}`)
        lines.push(`- Laboratorial: ${kb.labMin || '?'} - ${kb.labMax || '?'}`)
        lines.push(`- Fonte: ${kb.source}`)
        lines.push(`- Confiança: ${kb.confidence}`)
        lines.push('')
      }

      lines.push(`**Recomendação:** ${disc.recommendation}`)
      lines.push('')
      lines.push('---')
      lines.push('')
    }
  }

  // Biomarcadores ausentes
  if (report.missingBiomarkers.length > 0) {
    lines.push('## 📝 Biomarcadores Ausentes no Cérebro Lógico')
    lines.push('')
    lines.push('Os seguintes biomarcadores foram encontrados na Base de Conhecimento mas NÃO estão cadastrados no Cérebro Lógico:')
    lines.push('')

    for (const missing of report.missingBiomarkers) {
      lines.push(`### ${missing.name} (Sugestão: \`${missing.suggestedSlug}\`)`)
      lines.push('')
      lines.push('**Referências encontradas:**')
      for (const ref of missing.references) {
        lines.push(`- **Fonte:** ${ref.source}`)
        lines.push(`  - Ótimo: ${ref.values.optimalMin || '?'} - ${ref.values.optimalMax || '?'} ${ref.values.unit || ''}`)
        lines.push(`  - Laboratorial: ${ref.values.labMin || '?'} - ${ref.values.labMax || '?'} ${ref.values.unit || ''}`)
      }
      lines.push('')
      lines.push('**Ação Sugerida:** Adicionar ao Cérebro Lógico')
      lines.push('')
      lines.push('---')
      lines.push('')
    }
  }

  // Próximos passos
  lines.push('## 🎯 Próximos Passos Recomendados')
  lines.push('')
  lines.push('1. **Revisar Discrepâncias:** Decidir qual fonte usar (Cérebro Lógico ou Base de Conhecimento)')
  lines.push('2. **Atualizar Cérebro Lógico:** Executar SQL para atualizar valores desatualizados')
  lines.push('3. **Adicionar Biomarcadores Ausentes:** Cadastrar novos biomarcadores identificados')
  lines.push('4. **Implementar Sincronização:** Criar processo automático de sugestão de atualizações')
  lines.push('')

  return lines.join('\n')
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando Auditoria de Sincronização...\n')

  // 1. Carregar artigos da base de conhecimento
  console.log('📚 Carregando artigos da Base de Conhecimento...')
  const articles = await db
    .select()
    .from(knowledgeArticles)
    .where(eq(knowledgeArticles.isVerified, 'verified'))

  console.log(`   ✓ ${articles.length} artigos verificados encontrados`)

  if (articles.length === 0) {
    console.log('\n⚠️  Nenhum artigo encontrado. Adicione artigos à base de conhecimento primeiro.')
    return
  }

  // 2. Analisar cada artigo (com limite configurável)
  const articlesToProcess = CONFIG.articleLimit > 0
    ? articles.slice(0, CONFIG.articleLimit)
    : articles

  console.log(`\n🧠 Analisando ${articlesToProcess.length} artigos...`)
  console.log(`   Modelo: ${CONFIG.model}`)
  console.log(`   Temperatura: ${CONFIG.temperature}`)

  const analyses: ArticleAnalysis[] = []
  for (const article of articlesToProcess) {
    const analysis = await analyzeArticle(article)
    analyses.push(analysis)

    // Delay configurável para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenCalls))
  }

  // 3. Comparar com Cérebro Lógico
  const report = await compareWithLogicalBrain(analyses)

  // 4. Gerar relatório
  console.log('\n📝 Gerando relatório...')
  const reportMarkdown = generateReport(report)

  // 5. Salvar relatório
  const fs = await import('fs/promises')
  const reportPath = 'RELATORIO-AUDITORIA-CONHECIMENTO.md'
  await fs.writeFile(reportPath, reportMarkdown, 'utf-8')

  console.log(`\n✅ Relatório gerado: ${reportPath}`)
  console.log('\n📊 Resumo:')
  console.log(`   - Discrepâncias: ${report.biomarkerDiscrepancies.length}`)
  console.log(`   - Biomarcadores ausentes: ${report.missingBiomarkers.length}`)
  console.log(`   - Protocolos para revisar: ${report.protocolDiscrepancies.length}`)
  console.log('\nRevise o relatório e execute os próximos passos recomendados.')
}

main().catch(console.error)
