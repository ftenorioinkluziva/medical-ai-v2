/**
 * Medical Knowledge Engine (Logical Brain)
 * Deterministic analysis of biomarkers and protocol activation
 */

import type { StructuredMedicalDocument } from '@/lib/documents/structuring'
import type {
  BiomarkerValue,
  LogicalAnalysis,
  BiomarkerSnapshot,
} from './types'
import {
  extractBiomarkersFromDocuments,
  deduplicateBiomarkers,
} from './biomarker-extractor'
import { evaluateBiomarkers } from './evaluator'

/**
 * Run complete logical analysis on structured documents
 */
export async function runLogicalAnalysis(
  structuredDocuments: StructuredMedicalDocument[],
  documentIds?: string[]
): Promise<LogicalAnalysis> {
  console.log('🧠 [LOGICAL-BRAIN] Starting deterministic analysis...')
  console.log(`📄 [LOGICAL-BRAIN] Processing ${structuredDocuments.length} documents`)

  // 1. Extract biomarkers from all documents
  const allBiomarkers = extractBiomarkersFromDocuments(structuredDocuments, documentIds)

  if (allBiomarkers.length === 0) {
    console.warn('⚠️ [LOGICAL-BRAIN] No biomarkers found in documents')
    return createEmptyAnalysis()
  }

  // 2. Deduplicate (keep most recent value per biomarker)
  const uniqueBiomarkers = deduplicateBiomarkers(allBiomarkers)

  console.log(`🔬 [LOGICAL-BRAIN] Analyzing ${uniqueBiomarkers.length} unique biomarkers`)

  // 3. Evaluate biomarkers (direct call, not HTTP)
  try {
    const evaluationResult = await evaluateBiomarkers(
      uniqueBiomarkers.map(b => ({ slug: b.slug, value: b.value }))
    )

    // 4. Build critical alerts
    const criticalAlerts = buildCriticalAlerts(evaluationResult.biomarkers)

    const analysis: LogicalAnalysis = {
      biomarkers: evaluationResult.biomarkers,
      metrics: evaluationResult.metrics,
      protocols: evaluationResult.triggeredProtocols,
      summary: {
        ...evaluationResult.summary,
        criticalAlerts,
      },
    }

    console.log('✅ [LOGICAL-BRAIN] Analysis complete:')
    console.log(`   - Biomarkers: ${analysis.biomarkers.length}`)
    console.log(`   - Optimal: ${analysis.summary.optimal}`)
    console.log(`   - Suboptimal: ${analysis.summary.suboptimal}`)
    console.log(`   - Abnormal: ${analysis.summary.abnormal}`)
    console.log(`   - Metrics: ${analysis.metrics.length}`)
    console.log(`   - Protocols: ${analysis.protocols.length}`)
    console.log(`   - Critical alerts: ${analysis.summary.criticalAlerts.length}`)

    return analysis
  } catch (error) {
    console.error('❌ [LOGICAL-BRAIN] Error during analysis:', error)
    throw error
  }
}

/**
 * Build critical alerts from abnormal biomarkers
 */
function buildCriticalAlerts(biomarkers: any[]): string[] {
  return biomarkers
    .filter(b => b.status === 'abnormal')
    .map(b => `${b.reference.name}: ${b.value} ${b.reference.unit || ''} - ${b.message}`)
}

/**
 * Create empty analysis (fallback)
 */
function createEmptyAnalysis(): LogicalAnalysis {
  return {
    biomarkers: [],
    metrics: [],
    protocols: [],
    summary: {
      totalBiomarkers: 0,
      optimal: 0,
      suboptimal: 0,
      abnormal: 0,
      metricsCalculated: 0,
      protocolsTriggered: 0,
      criticalAlerts: [],
    },
  }
}

/**
 * Format logical analysis as context for AI prompt
 */
export function formatLogicalAnalysisForPrompt(analysis: LogicalAnalysis): string {
  if (analysis.biomarkers.length === 0) {
    return ''
  }

  const sections: string[] = []

  // Header
  sections.push('## 🧠 ANÁLISE LÓGICA AUTOMÁTICA (DADOS VERIFICADOS)')
  sections.push('')
  sections.push('**IMPORTANTE:** Os dados abaixo foram calculados matematicamente e validados contra a base de conhecimento médico.')
  sections.push('Você DEVE usar essas informações como base para sua análise, interpretando e humanizando os resultados.')
  sections.push('')

  // Biomarkers
  sections.push(`### 📊 Biomarcadores Avaliados (${analysis.biomarkers.length})`)
  sections.push('')

  for (const bio of analysis.biomarkers) {
    const statusEmoji = bio.status === 'optimal' ? '✅' : bio.status === 'suboptimal' ? '⚠️' : '🔴'
    const statusText = bio.status === 'optimal' ? 'ÓTIMO' : bio.status === 'suboptimal' ? 'SUBÓTIMO' : 'ANORMAL'

    sections.push(`${statusEmoji} **${bio.reference.name}**: ${bio.value} ${bio.reference.unit || ''}`)
    sections.push(`   - Status: **${statusText}**`)
    sections.push(`   - ${bio.message}`)

    if (bio.reference.optimalMin || bio.reference.optimalMax) {
      const min = bio.reference.optimalMin || '-'
      const max = bio.reference.optimalMax || '-'
      sections.push(`   - Faixa Ótima: ${min} a ${max} ${bio.reference.unit || ''}`)
    }

    if (bio.reference.clinicalInsight) {
      sections.push(`   - **Interpretação Clínica**: ${bio.reference.clinicalInsight}`)
    }

    if (bio.reference.metaphor) {
      sections.push(`   - **Metáfora**: ${bio.reference.metaphor}`)
    }

    sections.push('')
  }

  // Metrics
  if (analysis.metrics.length > 0) {
    sections.push(`### 🧮 Métricas Calculadas (${analysis.metrics.length})`)
    sections.push('')

    for (const metric of analysis.metrics) {
      if (metric.value === null) {
        sections.push(`⚪ **${metric.name}**: Não calculável`)
        if (metric.error) {
          sections.push(`   - ${metric.error}`)
        }
        sections.push('')
        continue
      }

      const statusEmoji = metric.status === 'optimal' ? '✅' : '⚠️'
      const statusText = metric.status === 'optimal' ? 'ÓTIMO' : 'SUBÓTIMO'

      sections.push(`${statusEmoji} **${metric.name}**: ${metric.value}`)
      sections.push(`   - Fórmula: \`${metric.formula}\``)
      sections.push(`   - Status: **${statusText}**`)

      if (metric.message) {
        sections.push(`   - ${metric.message}`)
      }

      if (metric.riskInsight) {
        sections.push(`   - **Avaliação de Risco**: ${metric.riskInsight}`)
      }

      sections.push('')
    }
  }

  // Protocols
  if (analysis.protocols.length > 0) {
    sections.push(`### 📋 Protocolos Ativados Automaticamente (${analysis.protocols.length})`)
    sections.push('')
    sections.push('**Os protocolos abaixo foram AUTOMATICAMENTE selecionados com base em regras clínicas validadas.**')
    sections.push('**Você DEVE incluí-los na sua análise e usar sua expertise para explicá-los de forma humanizada.**')
    sections.push('')

    for (const protocol of analysis.protocols) {
      sections.push(`#### 📌 ${protocol.title} (${protocol.type})`)
      sections.push('')
      sections.push(`**Condição de Ativação:** \`${protocol.triggerCondition}\``)
      sections.push('')
      sections.push(`**Protocolo:**`)
      sections.push(protocol.description)
      sections.push('')

      if (protocol.dosage) {
        sections.push(`**Dosagem:** ${protocol.dosage}`)
        sections.push('')
      }

      if (protocol.sourceRef) {
        sections.push(`**Fonte:** ${protocol.sourceRef}`)
        sections.push('')
      }
    }
  }

  // Critical alerts
  if (analysis.summary.criticalAlerts.length > 0) {
    sections.push('### ⚠️ ALERTAS CRÍTICOS')
    sections.push('')
    sections.push('**Os seguintes biomarcadores estão FORA dos limites laboratoriais de referência:**')
    sections.push('')

    for (const alert of analysis.summary.criticalAlerts) {
      sections.push(`- 🔴 ${alert}`)
    }

    sections.push('')
    sections.push('**Você DEVE destacar esses alertas na sua análise e recomendar avaliação médica urgente.**')
    sections.push('')
  }

  // Summary
  sections.push('---')
  sections.push('')
  sections.push('### 📈 Resumo Estatístico')
  sections.push('')
  sections.push(`- Total de biomarcadores: ${analysis.summary.totalBiomarkers}`)
  sections.push(`- Ótimos: ${analysis.summary.optimal} (${Math.round((analysis.summary.optimal / analysis.summary.totalBiomarkers) * 100)}%)`)
  sections.push(`- Subótimos: ${analysis.summary.suboptimal} (${Math.round((analysis.summary.suboptimal / analysis.summary.totalBiomarkers) * 100)}%)`)
  sections.push(`- Anormais: ${analysis.summary.abnormal} (${Math.round((analysis.summary.abnormal / analysis.summary.totalBiomarkers) * 100)}%)`)
  sections.push(`- Métricas calculadas: ${analysis.summary.metricsCalculated}`)
  sections.push(`- Protocolos ativados: ${analysis.summary.protocolsTriggered}`)
  sections.push('')

  sections.push('---')
  sections.push('')
  sections.push('**INSTRUÇÕES FINAIS PARA O AGENTE:**')
  sections.push('1. Use os dados acima como FUNDAMENTO da sua análise')
  sections.push('2. NÃO invente novos protocolos - use os sugeridos acima')
  sections.push('3. HUMANIZE e CONTEXTUALIZE os achados com sua expertise')
  sections.push('4. Explique o "PORQUÊ" de cada biomarcador estar alterado')
  sections.push('5. Conecte os biomarcadores entre si (visão sistêmica)')
  sections.push('6. Seja empático e educativo na comunicação')
  sections.push('')

  return sections.join('\n')
}

/**
 * Create biomarker snapshot for profile storage
 */
export function createBiomarkerSnapshot(
  analysis: LogicalAnalysis,
  biomarkerValues: BiomarkerValue[]
): BiomarkerSnapshot {
  const snapshot: BiomarkerSnapshot = {}

  for (const evaluation of analysis.biomarkers) {
    const biomarkerValue = biomarkerValues.find(b => b.slug === evaluation.slug)

    if (biomarkerValue) {
      snapshot[evaluation.slug] = {
        value: evaluation.value,
        unit: biomarkerValue.unit,
        date: biomarkerValue.date || new Date().toISOString(),
        documentId: biomarkerValue.documentId || '',
        status: evaluation.status,
      }
    }
  }

  return snapshot
}
