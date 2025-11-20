/**
 * Biomarker Extractor
 * Extracts biomarker values from structured medical documents
 */

import type { StructuredMedicalDocument } from '@/lib/documents/structuring'
import type { BiomarkerValue } from './types'

/**
 * Biomarker name variations mapping
 * Maps common lab report names to biomarker slugs
 */
const BIOMARKER_NAME_MAP: Record<string, string[]> = {
  // Metabolic
  insulina: ['insulina', 'insulina em jejum', 'insulina basal', 'insulin'],
  glicemia: ['glicemia', 'glicose', 'glicemia de jejum', 'glucose', 'glicemia jejum'],
  hba1c: ['hemoglobina glicada', 'hba1c', 'a1c', 'hemoglobina glicosilada', 'hgba1c'],

  // Lipid Panel
  triglicerideos: ['triglicerídeos', 'triglicerides', 'triglicérides', 'tg'],
  hdl: ['hdl', 'hdl colesterol', 'hdl-colesterol', 'colesterol hdl'],
  ldl: ['ldl', 'ldl colesterol', 'ldl-colesterol', 'colesterol ldl'],
  colesterol_total: ['colesterol total', 'colesterol', 'total cholesterol'],
  vldl: ['vldl', 'vldl colesterol'],

  // Thyroid
  tsh: ['tsh', 'hormônio tireoestimulante', 'thyroid stimulating hormone'],
  t3_livre: ['t3 livre', 't3l', 'free t3', 'triiodotironina livre'],
  t4_livre: ['t4 livre', 't4l', 'free t4', 'tiroxina livre'],
  t3_reverso: ['t3 reverso', 't3r', 'reverse t3', 't3 reverse'],
  t4_total: ['t4 total', 't4', 'tiroxina total'],

  // Liver
  gama_gt: ['gama gt', 'ggt', 'gamma gt', 'gama-gt', 'gamaglutamiltransferase'],
  tgo: ['tgo', 'ast', 'aspartato aminotransferase', 'sgot'],
  tgp: ['tgp', 'alt', 'alanina aminotransferase', 'sgpt'],
  fosfatase_alcalina: ['fosfatase alcalina', 'fa', 'alkaline phosphatase', 'alp'],
  bilirrubina_total: ['bilirrubina total', 'bilirrubina'],

  // Kidney
  creatinina: ['creatinina', 'creatinine'],
  ureia: ['ureia', 'urea', 'bun'],
  acido_urico: ['ácido úrico', 'acido urico', 'uric acid'],

  // Hematology
  ferritina: ['ferritina', 'ferritin'],
  hemoglobina: ['hemoglobina', 'hb', 'hemoglobin'],
  hematocrito: ['hematócrito', 'hematocrito', 'hematocrit', 'ht'],
  leucocitos: ['leucócitos', 'leucocitos', 'white blood cells', 'wbc'],
  plaquetas: ['plaquetas', 'platelets'],

  // Inflammation
  homocisteina: ['homocisteína', 'homocisteina', 'homocysteine'],
  pcr_us: ['pcr ultra-sensível', 'pcr us', 'pcr ultrassensível', 'hs-crp', 'proteína c reativa'],

  // Vitamins
  vitamina_d3: ['vitamina d', 'vitamina d3', 'vitamin d', '25-oh vitamina d', '25(oh)d'],
  vitamina_b12: ['vitamina b12', 'b12', 'cobalamina', 'vitamin b12'],
  acido_folico: ['ácido fólico', 'acido folico', 'folato', 'folic acid'],

  // Hormones
  cortisol: ['cortisol'],
  testosterona: ['testosterona', 'testosterone'],
  estradiol: ['estradiol', 'e2'],
  progesterona: ['progesterona', 'progesterone'],

  // Electrolytes
  sodio: ['sódio', 'sodio', 'sodium', 'na'],
  potassio: ['potássio', 'potassio', 'potassium', 'k'],
  calcio: ['cálcio', 'calcio', 'calcium', 'ca'],
  magnesio: ['magnésio', 'magnesio', 'magnesium', 'mg'],

  // Others
  albumina: ['albumina', 'albumin'],
  proteina_total: ['proteína total', 'proteina total', 'total protein'],
}

/**
 * Parse numeric value from parameter value
 * Handles formats like: "12.5", "< 0.5", "> 100", "12,5"
 */
function parseNumericValue(value: string | number): number | null {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value !== 'string') {
    return null
  }

  // Remove common non-numeric characters but keep decimal separators
  let cleaned = value
    .replace(/[<>≤≥]/g, '') // Remove comparison operators
    .replace(/,/g, '.') // Replace comma with dot for decimal
    .trim()

  // Extract first number found
  const match = cleaned.match(/[\d.]+/)
  if (!match) {
    return null
  }

  const parsed = parseFloat(match[0])
  return isNaN(parsed) ? null : parsed
}

/**
 * Normalize biomarker name for matching
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .trim()
}

/**
 * Find biomarker slug from parameter name
 */
function findBiomarkerSlug(paramName: string): string | null {
  const normalized = normalizeString(paramName)

  for (const [slug, variations] of Object.entries(BIOMARKER_NAME_MAP)) {
    for (const variation of variations) {
      const normalizedVariation = normalizeString(variation)

      // Check if parameter name contains the variation
      if (normalized.includes(normalizedVariation) || normalizedVariation.includes(normalized)) {
        return slug
      }
    }
  }

  return null
}

/**
 * Extract biomarkers from a single structured document
 */
export function extractBiomarkersFromDocument(
  document: StructuredMedicalDocument,
  documentId?: string
): BiomarkerValue[] {
  const biomarkers: BiomarkerValue[] = []
  const examDate = document.examDate || new Date().toISOString()

  console.log(`🔍 [EXTRACTOR] Processing document: ${document.documentType}`)
  console.log(`📅 [EXTRACTOR] Exam date: ${examDate}`)

  for (const module of document.modules) {
    console.log(`📊 [EXTRACTOR] Processing module: ${module.moduleName}`)

    for (const param of module.parameters) {
      const slug = findBiomarkerSlug(param.name)

      if (slug) {
        const value = parseNumericValue(param.value)

        if (value !== null) {
          biomarkers.push({
            slug,
            value,
            unit: param.unit,
            date: examDate,
            documentId,
            source: `${module.moduleName} - ${param.name}`,
          })

          console.log(`  ✅ Matched: ${param.name} -> ${slug} = ${value} ${param.unit || ''}`)
        } else {
          console.log(`  ⚠️ Could not parse value for: ${param.name} = ${param.value}`)
        }
      } else {
        console.log(`  ⏭️ No match for: ${param.name}`)
      }
    }
  }

  console.log(`✅ [EXTRACTOR] Extracted ${biomarkers.length} biomarkers from document`)
  return biomarkers
}

/**
 * Extract biomarkers from multiple documents
 */
export function extractBiomarkersFromDocuments(
  documents: StructuredMedicalDocument[],
  documentIds?: string[]
): BiomarkerValue[] {
  const allBiomarkers: BiomarkerValue[] = []

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i]
    const docId = documentIds?.[i]
    const biomarkers = extractBiomarkersFromDocument(doc, docId)
    allBiomarkers.push(...biomarkers)
  }

  console.log(`🎯 [EXTRACTOR] Total biomarkers extracted: ${allBiomarkers.length}`)
  return allBiomarkers
}

/**
 * Deduplicate biomarkers - keep most recent value for each slug
 */
export function deduplicateBiomarkers(biomarkers: BiomarkerValue[]): BiomarkerValue[] {
  const latestMap = new Map<string, BiomarkerValue>()

  for (const biomarker of biomarkers) {
    const existing = latestMap.get(biomarker.slug)

    if (!existing) {
      latestMap.set(biomarker.slug, biomarker)
    } else {
      // Keep the most recent one
      const existingDate = existing.date ? new Date(existing.date) : new Date(0)
      const currentDate = biomarker.date ? new Date(biomarker.date) : new Date(0)

      if (currentDate > existingDate) {
        latestMap.set(biomarker.slug, biomarker)
      }
    }
  }

  const deduplicated = Array.from(latestMap.values())
  console.log(`🔄 [EXTRACTOR] Deduplicated: ${biomarkers.length} -> ${deduplicated.length}`)

  return deduplicated
}

/**
 * Get supported biomarker slugs
 */
export function getSupportedBiomarkers(): string[] {
  return Object.keys(BIOMARKER_NAME_MAP)
}

/**
 * Get biomarker variations for a slug
 */
export function getBiomarkerVariations(slug: string): string[] {
  return BIOMARKER_NAME_MAP[slug] || []
}
