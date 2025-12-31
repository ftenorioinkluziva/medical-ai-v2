/**
 * Parameter Extractor
 * Extracts available biomarkers/parameters from structured medical documents
 * Used to prevent AI hallucinations by providing explicit list of what's available
 */

/**
 * Extract all available parameters from structured documents
 */
export function extractAvailableParameters(structuredDocuments: any[]): {
  allParameters: string[]
  parametersByDocument: Map<string, string[]>
  parameterDetails: Map<string, {
    value: any
    unit?: string
    referenceRange?: string
    status?: string
    documentType: string
  }>
} {
  const allParameters = new Set<string>()
  const parametersByDocument = new Map<string, string[]>()
  const parameterDetails = new Map<string, {
    value: any
    unit?: string
    referenceRange?: string
    status?: string
    documentType: string
  }>()

  for (const doc of structuredDocuments) {
    if (!doc || typeof doc !== 'object') continue
    if (!('modules' in doc) || !Array.isArray(doc.modules)) continue

    const docType = doc.documentType || 'unknown'
    const docParams: string[] = []

    for (const module of doc.modules) {
      if (!module.parameters || !Array.isArray(module.parameters)) continue

      for (const param of module.parameters) {
        if (!param.name) continue

        const paramName = param.name.trim()
        allParameters.add(paramName)
        docParams.push(paramName)

        // Store detailed info (keep most recent if duplicate)
        if (!parameterDetails.has(paramName)) {
          parameterDetails.set(paramName, {
            value: param.value,
            unit: param.unit,
            referenceRange: param.referenceRange,
            status: param.status,
            documentType: docType,
          })
        }
      }
    }

    if (docParams.length > 0) {
      parametersByDocument.set(docType, docParams)
    }
  }

  return {
    allParameters: Array.from(allParameters).sort(),
    parametersByDocument,
    parameterDetails,
  }
}

/**
 * Build context string with available parameters for AI prompt
 */
export function buildParametersContext(structuredDocuments: any[]): string {
  const { allParameters, parameterDetails } = extractAvailableParameters(structuredDocuments)

  if (allParameters.length === 0) {
    return '**ATENÇÃO:** Nenhum dado estruturado disponível. Não mencione valores específicos de exames.'
  }

  const lines: string[] = [
    '═══════════════════════════════════════════════════════',
    '📊 PARÂMETROS DISPONÍVEIS NOS DOCUMENTOS',
    '═══════════════════════════════════════════════════════',
    '',
    '⚠️  REGRA CRÍTICA: Você DEVE mencionar APENAS os parâmetros listados abaixo.',
    '⚠️  NUNCA invente, infira ou mencione parâmetros que NÃO estejam nesta lista.',
    '⚠️  Se um parâmetro não foi testado, escreva "não disponível" ou "não testado".',
    '',
    `Total de parâmetros disponíveis: ${allParameters.length}`,
    '',
    '---',
    '',
  ]

  // Group parameters by type for better organization
  const hematology: string[] = []
  const biochemistry: string[] = []
  const hormones: string[] = []
  const vitamins: string[] = []
  const others: string[] = []

  for (const param of allParameters) {
    const paramLower = param.toLowerCase()
    const detail = parameterDetails.get(param)
    const value = detail?.value !== undefined && detail?.value !== null ? detail.value : 'N/A'
    const unit = detail?.unit || ''
    const ref = detail?.referenceRange || ''

    const line = ref
      ? `- ${param}: ${value} ${unit} (Ref: ${ref})`
      : `- ${param}: ${value} ${unit}`

    // Categorize
    if (paramLower.includes('hemoglobin') || paramLower.includes('leucócito') ||
        paramLower.includes('plaqueta') || paramLower.includes('hematócrito') ||
        paramLower.includes('hemácia') || paramLower.includes('eosinófilo') ||
        paramLower.includes('linfócito') || paramLower.includes('monócito') ||
        paramLower.includes('basófilo') || paramLower.includes('neutrófilo') ||
        paramLower.includes('bastonete') || paramLower.includes('segmentado')) {
      hematology.push(line)
    } else if (paramLower.includes('tsh') || paramLower.includes('t3') ||
               paramLower.includes('t4') || paramLower.includes('testosterona') ||
               paramLower.includes('estradiol') || paramLower.includes('cortisol') ||
               paramLower.includes('progesterona') || paramLower.includes('prolactin') ||
               paramLower.includes('fsh') || paramLower.includes('lh') ||
               paramLower.includes('insulina') || paramLower.includes('hormônio')) {
      hormones.push(line)
    } else if (paramLower.includes('vitamin') || paramLower.includes('b12') ||
               paramLower.includes('ácido fólico') || paramLower.includes('folato')) {
      vitamins.push(line)
    } else if (paramLower.includes('glicose') || paramLower.includes('colesterol') ||
               paramLower.includes('triglicerídeo') || paramLower.includes('creatinina') ||
               paramLower.includes('ureia') || paramLower.includes('ácido úrico') ||
               paramLower.includes('transaminase') || paramLower.includes('tgo') ||
               paramLower.includes('tgp') || paramLower.includes('gama gt') ||
               paramLower.includes('fosfatase') || paramLower.includes('bilirrubina') ||
               paramLower.includes('albumina') || paramLower.includes('proteína') ||
               paramLower.includes('sódio') || paramLower.includes('potássio') ||
               paramLower.includes('cálcio') || paramLower.includes('magnésio') ||
               paramLower.includes('ferro') || paramLower.includes('ferritina')) {
      biochemistry.push(line)
    } else {
      others.push(line)
    }
  }

  if (hematology.length > 0) {
    lines.push('## HEMATOLOGIA')
    lines.push(...hematology)
    lines.push('')
  }

  if (biochemistry.length > 0) {
    lines.push('## BIOQUÍMICA')
    lines.push(...biochemistry)
    lines.push('')
  }

  if (hormones.length > 0) {
    lines.push('## HORMÔNIOS')
    lines.push(...hormones)
    lines.push('')
  }

  if (vitamins.length > 0) {
    lines.push('## VITAMINAS E MINERAIS')
    lines.push(...vitamins)
    lines.push('')
  }

  if (others.length > 0) {
    lines.push('## OUTROS PARÂMETROS')
    lines.push(...others)
    lines.push('')
  }

  lines.push('═══════════════════════════════════════════════════════')
  lines.push('')

  return lines.join('\n')
}

/**
 * Common medical abbreviations and their full names
 */
const MEDICAL_ABBREVIATIONS: Record<string, string[]> = {
  'gama gt': ['gama glutamil transferase', 'ggt', 'gamma gt'],
  'tgo': ['transaminase glutâmico oxalacética', 'ast', 'aspartato aminotransferase'],
  'tgp': ['transaminase pirúvica', 'alt', 'alanina aminotransferase'],
  'tsh': ['tireoestimulante', 'hormônio tireoestimulante'],
  'hba1c': ['hemoglobina glicada', 'hemoglobina glicosilada', 'a1c'],
  'vcm': ['volume corpuscular médio'],
  'hcm': ['hemoglobina corpuscular média'],
  'chcm': ['concentração de hemoglobina corpuscular média'],
  'rdw': ['red cell distribution width', 'amplitude de distribuição dos eritrócitos'],
  't3': ['triiodotironina'],
  't4': ['tiroxina'],
}

/**
 * Check if a parameter name matches any available parameter (including abbreviations)
 */
function isParameterAvailable(paramName: string, availableParameters: string[]): boolean {
  const paramLower = paramName.toLowerCase().trim()
  const availableLower = availableParameters.map(p => p.toLowerCase())

  // Direct match
  if (availableLower.some(avail => avail.includes(paramLower) || paramLower.includes(avail))) {
    return true
  }

  // Check abbreviations
  const abbreviations = MEDICAL_ABBREVIATIONS[paramLower] || []
  for (const abbrev of abbreviations) {
    if (availableLower.some(avail => avail.includes(abbrev))) {
      return true
    }
  }

  // Check if paramName is an abbreviation of any available parameter
  for (const [abbrev, fullNames] of Object.entries(MEDICAL_ABBREVIATIONS)) {
    if (fullNames.some(fn => paramLower.includes(fn))) {
      if (availableLower.some(avail => avail.includes(abbrev))) {
        return true
      }
    }
  }

  return false
}

/**
 * Validate that mentioned parameters exist in available parameters
 * Returns list of hallucinated parameters that don't exist
 */
export function validateMentionedParameters(
  text: string,
  availableParameters: string[]
): {
  valid: boolean
  hallucinatedParameters: string[]
  warnings: string[]
} {
  const warnings: string[] = []
  const hallucinated: string[] = []

  // Common medical parameters that might be mentioned
  const commonParameters = [
    'TGO', 'AST', 'TGP', 'ALT', 'Gama GT', 'Fosfatase Alcalina',
    'Bilirrubina', 'Hemoglobina', 'Hematócrito', 'Leucócitos',
    'Plaquetas', 'Glicose', 'HbA1c', 'Colesterol Total',
    'HDL', 'LDL', 'Triglicerídeos', 'Creatinina', 'Ureia',
    'TSH', 'T4 Livre', 'T3 Livre', 'Vitamina D', 'Vitamina B12', 'Ferritina',
    'Ferro', 'Testosterona', 'Estradiol', 'Insulina', 'Cortisol',
  ]

  for (const param of commonParameters) {
    const paramLower = param.toLowerCase()

    // Check if parameter is mentioned in text
    const mentioned = text.toLowerCase().includes(paramLower)

    if (mentioned) {
      // Check if it's actually available (including abbreviations)
      const available = isParameterAvailable(param, availableParameters)

      if (!available) {
        // Check if the mention is in an acceptable context (not analyzing, just suggesting)
        const contextPatterns = [
          // Patterns for "not available" context (with plural support)
          new RegExp(`${paramLower}[^.]{0,100}(não (está |estão )?(disponíveis?|testados?|medidos?|avaliados?)|não foi (testado|medido|avaliado))`, 'i'),
          new RegExp(`(dados|valores|informações)[^.]{0,80}${paramLower}[^.]{0,80}não (disponíveis?|testados?|medidos?|avaliados?)`, 'i'),
          new RegExp(`${paramLower}[^.]{0,80}(ausentes?|faltando|pendentes?)`, 'i'),

          // Pattern for parenthetical "not available" like: (T3 Livre: não disponível)
          new RegExp(`\\(.*${paramLower}[^)]{0,100}(não |sem )(disponíveis?|testados?|dados?)`, 'i'),

          // Pattern for colon-separated lists like: T3 Livre e T3 Reverso: não disponíveis
          new RegExp(`${paramLower}[^:]{0,50}:[^.]{0,50}não (disponíveis?|testados?)`, 'i'),

          // Patterns for "suggested for next evaluation" context
          new RegExp(`(marcadores|exames|testes|parâmetros)[^.]{0,100}(sugerid|recomendad|indicad|solicitad)[^.]{0,100}${paramLower}`, 'i'),
          new RegExp(`${paramLower}[^.]{0,80}(próxim|futur|seguinte)[ao]s?.{0,30}(avaliação|exame|ciclo)`, 'i'),
          new RegExp(`(solicitar|pedir|incluir|adicionar|recomendar)[^.]{0,80}${paramLower}`, 'i'),

          // Pattern for "not tested" context
          new RegExp(`${paramLower}[^.]{0,50}(não (testado|realizado|feito)|sem (dados|valores))`, 'i'),
        ]

        // Check if ANY pattern matches (acceptable context)
        const isAcceptableContext = contextPatterns.some(pattern => pattern.test(text))

        if (isAcceptableContext) {
          // This is OK - AI is saying "not available" or "suggest for next time"
          continue
        }

        // Special case: "AST" might be in "BASTOS" or "BASTONETES"
        if (paramLower === 'ast' || paramLower === 'tgo') {
          // Check if it's really the biomarker or just part of another word
          const astPattern = /\b(tgo|ast)\b/gi
          const matches = text.match(astPattern)

          if (matches && matches.length > 0) {
            hallucinated.push(param)
            warnings.push(`⚠️  "${param}" foi mencionado mas NÃO está disponível nos documentos. Possível confusão com "BASTOS" ou "BASTONETES".`)
          }
        } else {
          hallucinated.push(param)
          warnings.push(`⚠️  "${param}" foi mencionado mas NÃO está disponível nos documentos.`)
        }
      }
    }
  }

  return {
    valid: hallucinated.length === 0,
    hallucinatedParameters: hallucinated,
    warnings,
  }
}
