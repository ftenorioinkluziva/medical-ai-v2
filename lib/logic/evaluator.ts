/**
 * Biomarker Evaluator
 * Core logic for evaluating biomarkers against reference values
 */

import { db } from '@/lib/db/client'
import { biomarkersReference, calculatedMetrics, protocols } from '@/lib/db/schema'
import type { BiomarkerValue, BiomarkerEvaluation, MetricCalculation, TriggeredProtocol } from './types'

export interface EvaluationResult {
  biomarkers: BiomarkerEvaluation[]
  metrics: MetricCalculation[]
  triggeredProtocols: TriggeredProtocol[]
  summary: {
    totalBiomarkers: number
    optimal: number
    suboptimal: number
    abnormal: number
    metricsCalculated: number
    protocolsTriggered: number
  }
}

/**
 * Evaluate biomarkers against reference ranges
 * This is the core evaluation logic used by both API and internal calls
 */
export async function evaluateBiomarkers(
  biomarkers: BiomarkerValue[]
): Promise<EvaluationResult> {
  console.log('🔬 [EVALUATOR] Evaluating biomarkers', { count: biomarkers.length })

  // Create a map of biomarker values
  const biomarkerMap = new Map<string, number>()
  biomarkers.forEach(b => biomarkerMap.set(b.slug, b.value))

  console.log('📊 [EVALUATOR] Biomarker map:', Array.from(biomarkerMap.keys()).sort())

  // Get all biomarker reference data
  const biomarkerRefs = await db
    .select()
    .from(biomarkersReference)

  // Get all calculated metrics
  const metricsData = await db
    .select()
    .from(calculatedMetrics)

  // Get all protocols
  const allProtocols = await db
    .select()
    .from(protocols)

  // Evaluate each biomarker against optimal ranges
  const evaluations = biomarkers.map(({ slug, value }) => {
    const ref = biomarkerRefs.find(r => r.slug === slug)

    if (!ref) {
      return {
        slug,
        value,
        status: 'unknown' as const,
        message: 'Biomarcador não encontrado na base de conhecimento',
        reference: {
          name: slug,
          unit: null,
          optimalMin: null,
          optimalMax: null,
          labMin: null,
          labMax: null,
          clinicalInsight: null,
          metaphor: null,
        },
      }
    }

    const optimalMin = ref.optimalMin ? parseFloat(ref.optimalMin as string) : null
    const optimalMax = ref.optimalMax ? parseFloat(ref.optimalMax as string) : null
    const labMin = ref.labMin ? parseFloat(ref.labMin as string) : null
    const labMax = ref.labMax ? parseFloat(ref.labMax as string) : null

    let status: 'optimal' | 'suboptimal' | 'abnormal' | 'unknown' = 'optimal'
    let message = 'Dentro da faixa ótima'

    // Check optimal range first
    if (optimalMin !== null && value < optimalMin) {
      status = 'suboptimal'
      message = `Abaixo do ideal (ótimo: ≥ ${optimalMin})`
    } else if (optimalMax !== null && value > optimalMax) {
      status = 'suboptimal'
      message = `Acima do ideal (ótimo: ≤ ${optimalMax})`
    }

    // Check lab range for abnormalities
    if (labMin !== null && value < labMin) {
      status = 'abnormal'
      message = `Abaixo do limite laboratorial (${labMin})`
    } else if (labMax !== null && value > labMax) {
      status = 'abnormal'
      message = `Acima do limite laboratorial (${labMax})`
    }

    return {
      slug,
      value,
      status,
      message,
      reference: {
        name: ref.name,
        unit: ref.unit,
        optimalMin,
        optimalMax,
        labMin,
        labMax,
        clinicalInsight: ref.clinicalInsight,
        metaphor: ref.metaphor,
      },
    }
  })

  // Calculate metrics
  const calculatedValues = metricsData.map(metric => {
    try {
      // Parse formula and replace placeholders with actual values
      let formula = metric.formula
      const slugMatches = formula.match(/\{([^}]+)\}/g)

      if (!slugMatches) {
        return {
          slug: metric.slug,
          name: metric.name,
          formula: metric.formula,
          value: null,
          error: 'Fórmula inválida',
          riskInsight: metric.riskInsight,
          targetMin: null,
          targetMax: null,
        }
      }

      // Replace all slug placeholders with values
      for (const match of slugMatches) {
        const slug = match.replace(/[{}]/g, '')
        const value = biomarkerMap.get(slug)

        if (value === undefined) {
          return {
            slug: metric.slug,
            name: metric.name,
            formula: metric.formula,
            value: null,
            error: `Biomarcador necessário não fornecido: ${slug}`,
            riskInsight: metric.riskInsight,
            targetMin: null,
            targetMax: null,
          }
        }

        formula = formula.replace(match, value.toString())
      }

      // Evaluate the formula
      const value = eval(formula) as number
      const targetMin = metric.targetMin ? parseFloat(metric.targetMin as string) : null
      const targetMax = metric.targetMax ? parseFloat(metric.targetMax as string) : null

      let status: 'optimal' | 'suboptimal' = 'optimal'
      let message = 'Dentro da faixa alvo'

      if (targetMin !== null && value < targetMin) {
        status = 'suboptimal'
        message = `Abaixo do alvo (ideal: ≥ ${targetMin})`
      } else if (targetMax !== null && value > targetMax) {
        status = 'suboptimal'
        message = `Acima do alvo (ideal: ≤ ${targetMax})`
      }

      return {
        slug: metric.slug,
        name: metric.name,
        formula: metric.formula,
        value: parseFloat(value.toFixed(2)),
        status,
        message,
        riskInsight: metric.riskInsight,
        targetMin,
        targetMax,
      }
    } catch (error) {
      return {
        slug: metric.slug,
        name: metric.name,
        formula: metric.formula,
        value: null,
        error: 'Erro ao calcular métrica',
        riskInsight: metric.riskInsight,
        targetMin: null,
        targetMax: null,
      }
    }
  })

  // Evaluate protocols (trigger conditions)
  const triggeredProtocols = allProtocols.filter(protocol => {
    try {
      // Parse trigger condition
      let condition = protocol.triggerCondition.toLowerCase()

      // Extract all potential biomarker slugs (alphanumeric + underscore)
      const slugMatches = condition.match(/[a-z][a-z0-9_]*/g)
      if (!slugMatches) return false

      // Sort by length (longest first) to avoid partial replacements
      const sortedSlugs = [...new Set(slugMatches)].sort((a, b) => b.length - a.length)

      // Track if all required biomarkers are available
      let allBiomarkersAvailable = true

      for (const slug of sortedSlugs) {
        // Skip logical operators and common JS keywords
        if (['or', 'and', 'true', 'false', 'null', 'undefined'].includes(slug)) continue

        const value = biomarkerMap.get(slug)
        if (value !== undefined) {
          // Use a more specific regex that handles underscores correctly
          // Match the slug when it's NOT preceded or followed by alphanumeric or underscore
          condition = condition.replace(
            new RegExp(`(?<![a-z0-9_])${slug.replace(/_/g, '_')}(?![a-z0-9_])`, 'g'),
            value.toString()
          )
        } else {
          // Biomarker not available - replace with null to prevent ReferenceError
          // This will make most conditions evaluate to false (which is correct behavior)
          condition = condition.replace(
            new RegExp(`(?<![a-z0-9_])${slug.replace(/_/g, '_')}(?![a-z0-9_])`, 'g'),
            'null'
          )
          allBiomarkersAvailable = false
        }
      }

      // If not all biomarkers are available, skip this protocol
      if (!allBiomarkersAvailable) {
        return false
      }

      // Clean up the condition for evaluation
      condition = condition
        .replace(/\bor\b/g, '||')
        .replace(/\band\b/g, '&&')

      // Evaluate the condition
      return eval(condition) as boolean
    } catch (error) {
      console.warn(`⚠️ Could not evaluate protocol: ${protocol.title}`, error)
      return false
    }
  })

  const summary = {
    totalBiomarkers: evaluations.length,
    optimal: evaluations.filter(e => e.status === 'optimal').length,
    suboptimal: evaluations.filter(e => e.status === 'suboptimal').length,
    abnormal: evaluations.filter(e => e.status === 'abnormal').length,
    metricsCalculated: calculatedValues.filter(m => m.value !== null).length,
    protocolsTriggered: triggeredProtocols.length,
  }

  console.log(`✅ [EVALUATOR] Evaluation complete:`)
  console.log(`   - Biomarkers evaluated: ${evaluations.length}`)
  console.log(`   - Metrics calculated: ${calculatedValues.length}`)
  console.log(`   - Protocols triggered: ${triggeredProtocols.length}`)

  return {
    biomarkers: evaluations,
    metrics: calculatedValues,
    triggeredProtocols: triggeredProtocols.map(p => ({
      id: p.id,
      type: p.type,
      title: p.title,
      description: p.description,
      dosage: p.dosage,
      sourceRef: p.sourceRef,
      triggerCondition: p.triggerCondition,
    })),
    summary,
  }
}
