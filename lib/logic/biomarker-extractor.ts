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
  insulina: ['insulina basal', 'insulina em jejum', 'insulina jejum', 'insulina', 'insulin'],
  glicemia: ['glicose', 'glicemia jejum', 'glicemia de jejum', 'glicemia', 'glucose'],
  hba1c: ['hemoglobina glicada', 'hemoglobina glicosilada', 'hba1c', 'a1c', 'hgba1c'],
  homa_ir: ['homa ir', 'homa-ir', 'homeostasis model assessment'],
  homa_beta: ['homa beta', 'homa-beta'],

  // Lipid Panel
  triglicerideos: ['triglicerideos', 'triglicerides', 'triglicérides', 'tg'],
  hdl: ['colesterol hdl', 'hdl colesterol', 'hdl-colesterol', 'hdl'],
  ldl: ['colesterol ldl', 'ldl colesterol', 'ldl-colesterol', 'ldl'],
  colesterol_total: ['colesterol total', 'total cholesterol'],
  colesterol_nao_hdl: ['colesterol nao hdl', 'non-hdl cholesterol'],
  vldl: ['vldl', 'vldl colesterol'],
  apolipoproteina_a1: ['apolipoproteina a1', 'apo a1', 'apoa1'],
  apolipoproteina_b: ['apolipoproteina b', 'apo b', 'apob'],
  lipoproteina_a: ['lipoproteina a', 'lp(a)', 'lipoproteína a'],

  // Thyroid
  tsh: ['tsh tireoestimulante', 'hormonio tireoestimulante', 'tsh', 'thyroid stimulating hormone'],
  t3_livre: ['t3 livre', 't3l', 'free t3', 'triiodotironina livre'],
  t4_livre: ['t4 livre', 't4l', 'free t4', 'tiroxina livre'],
  t3_reverso: ['t3 reverso', 't3r', 'reverse t3', 't3 reverse'],
  t4_total: ['t4 total', 'tiroxina total'],
  anti_tpo: ['anticorpos antiperoxidase', 'anti-tpo', 'antitpo'],
  anti_tg: ['anticorpos antitireoglobulina', 'anti-tg', 'antitg'],

  // Liver
  gama_gt: ['gama glutamil transferase', 'gama gt', 'gamagluramiltransferase', 'ggt', 'gamma gt'],
  tgo: ['transaminase oxalacetica', 'tgo', 'ast', 'aspartato aminotransferase', 'sgot'],
  tgp: ['transaminase piruvica', 'tgp', 'alt', 'alanina aminotransferase', 'sgpt'],
  fosfatase_alcalina: ['fosfatase alcalina', 'fa', 'alkaline phosphatase', 'alp'],
  bilirrubina_total: ['bilirrubina total'],
  bilirrubina_direta: ['bilirrubina direta'],
  bilirrubina_indireta: ['bilirrubina indireta'],

  // Kidney
  creatinina: ['creatinina', 'creatinine'],
  ureia: ['ureia', 'urea', 'bun'],
  acido_urico: ['acido urico', 'uric acid'],
  taxa_filtracao_glomerular: ['taxa de filtracao glomerular', 'tfg', 'egfr', 'estimativa da taxa de filtracao'],

  // Hematology
  ferritina: ['ferritina', 'ferritin'],
  hemoglobina: ['hemoglobina', 'hemoglobin'],
  hematocrito: ['hematocrito', 'hematocrit'],
  hemacias: ['hemacias', 'eritrocitos', 'red blood cells', 'rbc'],
  leucocitos: ['leucocitos', 'white blood cells', 'wbc'],
  plaquetas: ['plaquetas', 'platelets'],
  vcm: ['vcm', 'volume corpuscular medio', 'mcv'],
  hcm: ['hcm', 'hemoglobina corpuscular media', 'mch'],
  chcm: ['chcm', 'concentracao de hemoglobina corpuscular media', 'mchc'],
  rdw: ['rdw', 'red cell distribution width'],
  vmp: ['vmp', 'volume plaquetario medio', 'mpv'],

  // White blood cells differential
  neutrofilos: ['neutrofilos', 'segmentados', 'neutrophils'],
  linfocitos: ['linfocitos', 'lymphocytes'],
  monocitos: ['monocitos', 'monocytes'],
  eosinofilos: ['eosinofilos', 'eosinophils'],
  basofilos: ['basofilos', 'basophils'],
  bastonetes: ['bastonetes', 'band cells'],

  // Inflammation
  homocisteina: ['homocisteina', 'homocysteine'],
  pcr_us: ['proteina c reativa ultrassensivel', 'pcr ultrassensivel', 'pcr ultra-sensivel', 'pcr us', 'hs-crp'],
  fibrinogenio: ['fibrinogenio', 'fibrinogen'],
  ferro_serico: ['ferro serico', 'serum iron'],

  // Vitamins & Minerals
  vitamina_d3: ['vitamina d3 25-hidroxi', 'vitamina d3 25hidroxi', 'vitamina d', 'vitamin d', '25-oh vitamina d', '25ohd'],
  vitamina_b12: ['vitamina b12', 'cobalamina', 'vitamin b12'],
  vitamina_c: ['vitamina c', 'acido ascorbico', 'vitamin c'],
  acido_folico: ['acido folico', 'folato', 'folic acid'],
  zinco_serico: ['zinco serico', 'zinc'],

  // Hormones
  cortisol: ['cortisol'],
  testosterona: ['testosterona total', 'testosterona', 'testosterone'],
  testosterona_livre: ['testosterona livre', 'free testosterone'],
  estradiol: ['estradiol'],
  progesterona: ['progesterona', 'progesterone'],
  dht: ['dht', 'dihidrotestosterona', 'dihydrotestosterone'],
  shbg: ['globulina ligadora de hormonios sexuais', 'shbg', 'sex hormone binding globulin'],
  dhea_s: ['sulfato de dehidroepiandrosterona', 'dhea-s', 'sdhea'],
  lh: ['lh', 'hormonio luteinizante', 'luteinizing hormone'],
  fsh: ['fsh', 'hormonio foliculo estimulante', 'follicle stimulating hormone'],
  paratormonio: ['paratormonio', 'pth', 'parathyroid hormone'],

  // Electrolytes
  sodio: ['sodio', 'sodium'],
  potassio: ['potassio', 'potassium'],
  calcio: ['calcio ionico', 'calcio livre', 'calcio', 'calcium'],
  magnesio: ['magnesio', 'magnesium'],

  // Prostate
  psa_total: ['psa total'],
  psa_livre: ['psa livre'],
  relacao_psa: ['relacao psa livre psa total', 'psa ratio'],

  // Others
  albumina: ['albumina', 'albumin'],
  proteina_total: ['proteina total', 'total protein'],

  // Body Composition (Bioimpedance)
  peso_corporal: ['peso', 'peso corporal', 'weight', 'body weight'],
  massa_muscular_esqueletica: ['massa muscular esqueletica', 'massa muscular', 'skeletal muscle mass', 'smm'],
  massa_gordura: ['massa de gordura', 'massa gorda', 'fat mass', 'body fat mass'],
  percentual_gordura: ['pgc', 'percentual de gordura corporal', 'body fat percentage', '%gc'],
  imc: ['imc', 'indice de massa corporal', 'bmi', 'body mass index'],
  agua_corporal: ['agua corporal total', 'agua corporal', 'total body water', 'tbw'],
  proteina_corporal: ['proteina corporal', 'body protein'],
  minerais_corporais: ['minerais', 'minerais corporais', 'minerals', 'body minerals'],
  gordura_visceral: ['nivel de gordura visceral', 'gordura visceral', 'visceral fat level', 'vfl'],
  taxa_metabolica_basal: ['taxa metabolica basal', 'tmb', 'basal metabolic rate', 'bmr'],
  relacao_cintura_quadril: ['relacao cintura-quadril', 'relacao cintura quadril', 'rcq', 'waist-hip ratio', 'whr'],
  pontuacao_inbody: ['pontuacao inbody', 'inbody score'],
  grau_obesidade: ['grau de obesidade', 'obesity degree'],
  peso_ideal: ['peso ideal', 'ideal weight'],
  controle_peso: ['controle de peso', 'weight control'],
  controle_gordura: ['controle de gordura', 'fat control'],
  controle_muscular: ['controle muscular', 'muscle control'],
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
  const cleaned = value
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
 * Uses a scoring system to find the best match
 */
function findBiomarkerSlug(paramName: string): string | null {
  const normalized = normalizeString(paramName)

  let bestMatch: { slug: string; score: number } | null = null

  for (const [slug, variations] of Object.entries(BIOMARKER_NAME_MAP)) {
    for (const variation of variations) {
      const normalizedVariation = normalizeString(variation)

      // Calculate match score
      let score = 0

      // Exact match = highest score
      if (normalized === normalizedVariation) {
        score = 1000
      }
      // Normalized param contains the variation (e.g., "HEMOGLOBINA GLICADA" contains "HEMOGLOBINA GLICADA")
      else if (normalized === normalizedVariation) {
        score = 900
      }
      // Variation is the full normalized param (e.g., "GLICOSE" matches "glicose")
      else if (normalizedVariation === normalized) {
        score = 800
      }
      // Normalized param starts with variation (e.g., "HEMOGLOBINA" in "HEMOGLOBINA HB")
      else if (normalized.startsWith(normalizedVariation + ' ') || normalized.startsWith(normalizedVariation)) {
        score = 700
      }
      // Variation starts with normalized param (e.g., "T3" in "T3 LIVRE")
      else if (normalizedVariation.startsWith(normalized + ' ') || normalizedVariation.startsWith(normalized)) {
        score = 600
      }
      // Normalized param contains variation as whole word
      else if (normalized.includes(' ' + normalizedVariation + ' ') ||
               normalized.includes(' ' + normalizedVariation) ||
               normalized.includes(normalizedVariation + ' ')) {
        score = 500
      }
      // Variation contains normalized param as whole word
      else if (normalizedVariation.includes(' ' + normalized + ' ') ||
               normalizedVariation.includes(' ' + normalized) ||
               normalizedVariation.includes(normalized + ' ')) {
        score = 400
      }
      // Any other substring match (lowest priority)
      else if (normalized.includes(normalizedVariation) || normalizedVariation.includes(normalized)) {
        score = 100
      }

      // Prefer longer variations (more specific)
      score += normalizedVariation.length

      // Update best match if this score is higher
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { slug, score }
      }
    }
  }

  return bestMatch?.slug || null
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
