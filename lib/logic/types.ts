/**
 * Types for Logical Brain (Medical Knowledge Engine)
 */

import type { StructuredMedicalDocument } from '@/lib/documents/structuring'

/**
 * Single biomarker value extracted from a document
 */
export interface BiomarkerValue {
  slug: string
  value: number
  unit?: string
  date?: string // ISO date from document
  documentId?: string
  source?: string // Which document/module it came from
}

/**
 * Biomarker evaluation result
 */
export interface BiomarkerEvaluation {
  slug: string
  value: number
  status: 'optimal' | 'suboptimal' | 'abnormal' | 'unknown'
  message: string
  reference: {
    name: string
    unit: string | null
    optimalMin: number | null
    optimalMax: number | null
    labMin: number | null
    labMax: number | null
    clinicalInsight: string | null
    metaphor: string | null
  }
}

/**
 * Calculated metric result
 */
export interface MetricCalculation {
  slug: string
  name: string
  formula: string
  value: number | null
  status?: 'optimal' | 'suboptimal'
  message?: string
  riskInsight: string | null
  targetMin: number | null
  targetMax: number | null
  error?: string
}

/**
 * Triggered protocol
 */
export interface TriggeredProtocol {
  id: string
  type: string
  title: string
  description: string
  dosage: string | null
  sourceRef: string | null
  triggerCondition: string
}

/**
 * Complete logical analysis result
 */
export interface LogicalAnalysis {
  biomarkers: BiomarkerEvaluation[]
  metrics: MetricCalculation[]
  protocols: TriggeredProtocol[]
  summary: {
    totalBiomarkers: number
    optimal: number
    suboptimal: number
    abnormal: number
    metricsCalculated: number
    protocolsTriggered: number
    criticalAlerts: string[]
  }
}

/**
 * Evaluation API request
 */
export interface EvaluationRequest {
  biomarkers: BiomarkerValue[]
}

/**
 * Evaluation API response
 */
export interface EvaluationResponse {
  success: boolean
  evaluation: {
    biomarkers: BiomarkerEvaluation[]
    metrics: MetricCalculation[]
    triggeredProtocols: TriggeredProtocol[]
  }
  summary: {
    totalBiomarkers: number
    optimal: number
    suboptimal: number
    abnormal: number
    metricsCalculated: number
    protocolsTriggered: number
  }
  error?: string
}

/**
 * Biomarker snapshot for profile storage
 */
export interface BiomarkerSnapshot {
  [slug: string]: {
    value: number
    unit?: string
    date: string
    documentId: string
    status: 'optimal' | 'suboptimal' | 'abnormal'
  }
}

/**
 * Status translation helper
 */
export const STATUS_TRANSLATION = {
  optimal: 'Ótimo',
  suboptimal: 'Subótimo',
  abnormal: 'Anormal',
  unknown: 'Desconhecido',
} as const
