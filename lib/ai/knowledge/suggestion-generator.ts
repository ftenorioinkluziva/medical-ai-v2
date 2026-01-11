/**
 * Suggestion Generator
 * Compara resultados da análise com Cérebro Lógico e gera sugestões de atualização
 */

import { db } from '@/lib/db/client'
import { biomarkersReference, protocols, knowledgeUpdateSuggestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { ExtractedBiomarker, ExtractedProtocol } from './analyzer'

export interface GeneratedSuggestion {
  articleId: string
  articleTitle: string
  suggestionType: 'biomarker_update' | 'biomarker_create' | 'protocol_update' | 'protocol_create'
  targetType: 'biomarker' | 'protocol'
  targetSlug: string | null
  targetId: string | null
  suggestedData: any
  currentData: any | null
  aiConfidence: 'high' | 'medium' | 'low'
  aiReasoning: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  isConflict: boolean
}

/**
 * Gera sugestões comparando biomarcadores extraídos com Cérebro Lógico
 */
export async function generateBiomarkerSuggestions(
  extractedBiomarkers: ExtractedBiomarker[],
  articleId: string,
  articleTitle: string
): Promise<GeneratedSuggestion[]> {
  const suggestions: GeneratedSuggestion[] = []

  // Carregar todos os biomarcadores do Cérebro Lógico
  const existingBiomarkers = await db.select().from(biomarkersReference)
  const biomarkerMap = new Map(existingBiomarkers.map(b => [b.slug, b]))

  for (const extracted of extractedBiomarkers) {
    // Tentar encontrar match por qualquer slug possível
    let matchedBiomarker = null
    let matchedSlug = null

    for (const slug of extracted.possibleSlugs) {
      if (biomarkerMap.has(slug)) {
        matchedBiomarker = biomarkerMap.get(slug)
        matchedSlug = slug
        break
      }
    }

    if (matchedBiomarker) {
      // BIOMARKER UPDATE - Comparar valores
      const hasChanges = detectBiomarkerChanges(matchedBiomarker, extracted)

      if (hasChanges) {
        const { priority, reasoning } = calculateBiomarkerPriority(
          matchedBiomarker,
          extracted
        )

        suggestions.push({
          articleId,
          articleTitle,
          suggestionType: 'biomarker_update',
          targetType: 'biomarker',
          targetSlug: matchedSlug,
          targetId: null,
          suggestedData: {
            slug: matchedSlug,
            name: extracted.name,
            optimalMin: extracted.optimalMin,
            optimalMax: extracted.optimalMax,
            labMin: extracted.labMin,
            labMax: extracted.labMax,
            unit: extracted.unit,
            sourceRef: articleTitle,
          },
          currentData: {
            slug: matchedBiomarker.slug,
            name: matchedBiomarker.name,
            optimalMin: matchedBiomarker.optimalMin ? parseFloat(matchedBiomarker.optimalMin as string) : undefined,
            optimalMax: matchedBiomarker.optimalMax ? parseFloat(matchedBiomarker.optimalMax as string) : undefined,
            labMin: matchedBiomarker.labMin ? parseFloat(matchedBiomarker.labMin as string) : undefined,
            labMax: matchedBiomarker.labMax ? parseFloat(matchedBiomarker.labMax as string) : undefined,
            unit: matchedBiomarker.unit,
            sourceRef: matchedBiomarker.sourceRef,
          },
          aiConfidence: extracted.confidence,
          aiReasoning: reasoning,
          priority,
          isConflict: priority === 'critical',
        })
      }
    } else {
      // BIOMARKER CREATE - Novo biomarcador
      const suggestedSlug = extracted.possibleSlugs[0] // Usar primeiro slug como padrão

      // Só sugerir criação se tiver ao menos um valor definido
      if (
        extracted.optimalMin !== undefined ||
        extracted.optimalMax !== undefined ||
        extracted.labMin !== undefined ||
        extracted.labMax !== undefined
      ) {
        suggestions.push({
          articleId,
          articleTitle,
          suggestionType: 'biomarker_create',
          targetType: 'biomarker',
          targetSlug: suggestedSlug,
          targetId: null,
          suggestedData: {
            slug: suggestedSlug,
            name: extracted.name,
            optimalMin: extracted.optimalMin,
            optimalMax: extracted.optimalMax,
            labMin: extracted.labMin,
            labMax: extracted.labMax,
            unit: extracted.unit,
            sourceRef: articleTitle,
          },
          currentData: null,
          aiConfidence: extracted.confidence,
          aiReasoning: `Novo biomarcador encontrado na base de conhecimento: ${extracted.name}`,
          priority: extracted.confidence === 'high' ? 'medium' : 'low',
          isConflict: false,
        })
      }
    }
  }

  return suggestions
}

/**
 * Detecta se há mudanças significativas entre biomarcador atual e extraído
 */
function detectBiomarkerChanges(current: any, extracted: ExtractedBiomarker): boolean {
  const currentOptimalMin = current.optimalMin ? parseFloat(current.optimalMin as string) : undefined
  const currentOptimalMax = current.optimalMax ? parseFloat(current.optimalMax as string) : undefined
  const currentLabMin = current.labMin ? parseFloat(current.labMin as string) : undefined
  const currentLabMax = current.labMax ? parseFloat(current.labMax as string) : undefined

  // Comparar com threshold de 0.1% para evitar diferenças insignificantes
  const THRESHOLD = 0.001

  if (extracted.optimalMin !== undefined && currentOptimalMin !== undefined) {
    if (Math.abs(extracted.optimalMin - currentOptimalMin) > THRESHOLD) return true
  }

  if (extracted.optimalMax !== undefined && currentOptimalMax !== undefined) {
    if (Math.abs(extracted.optimalMax - currentOptimalMax) > THRESHOLD) return true
  }

  if (extracted.labMin !== undefined && currentLabMin !== undefined) {
    if (Math.abs(extracted.labMin - currentLabMin) > THRESHOLD) return true
  }

  if (extracted.labMax !== undefined && currentLabMax !== undefined) {
    if (Math.abs(extracted.labMax - currentLabMax) > THRESHOLD) return true
  }

  // Verificar se temos novos valores que não existiam antes
  if (extracted.optimalMin !== undefined && currentOptimalMin === undefined) return true
  if (extracted.optimalMax !== undefined && currentOptimalMax === undefined) return true
  if (extracted.labMin !== undefined && currentLabMin === undefined) return true
  if (extracted.labMax !== undefined && currentLabMax === undefined) return true

  return false
}

/**
 * Calcula prioridade da atualização baseada no impacto
 */
function calculateBiomarkerPriority(
  current: any,
  extracted: ExtractedBiomarker
): { priority: 'critical' | 'high' | 'medium' | 'low'; reasoning: string } {
  const currentLabMin = current.labMin ? parseFloat(current.labMin as string) : undefined
  const currentLabMax = current.labMax ? parseFloat(current.labMax as string) : undefined

  // CRITICAL: Mudanças em limites laboratoriais (afeta classificação de anormal)
  if (extracted.labMin !== undefined && currentLabMin !== undefined) {
    const percentChange = Math.abs((extracted.labMin - currentLabMin) / currentLabMin) * 100
    if (percentChange > 10) {
      return {
        priority: 'critical',
        reasoning: `Mudança crítica no limite laboratorial mínimo: ${currentLabMin} → ${extracted.labMin} (${percentChange.toFixed(1)}% de diferença). Afeta classificação de resultados anormais.`,
      }
    }
  }

  if (extracted.labMax !== undefined && currentLabMax !== undefined) {
    const percentChange = Math.abs((extracted.labMax - currentLabMax) / currentLabMax) * 100
    if (percentChange > 10) {
      return {
        priority: 'critical',
        reasoning: `Mudança crítica no limite laboratorial máximo: ${currentLabMax} → ${extracted.labMax} (${percentChange.toFixed(1)}% de diferença). Afeta classificação de resultados anormais.`,
      }
    }
  }

  const currentOptimalMin = current.optimalMin ? parseFloat(current.optimalMin as string) : undefined
  const currentOptimalMax = current.optimalMax ? parseFloat(current.optimalMax as string) : undefined

  // HIGH: Mudanças significativas em faixas ótimas
  if (extracted.optimalMin !== undefined && currentOptimalMin !== undefined) {
    const percentChange = Math.abs((extracted.optimalMin - currentOptimalMin) / currentOptimalMin) * 100
    if (percentChange > 15) {
      return {
        priority: 'high',
        reasoning: `Mudança significativa no limite ótimo mínimo: ${currentOptimalMin} → ${extracted.optimalMin} (${percentChange.toFixed(1)}% de diferença).`,
      }
    }
  }

  if (extracted.optimalMax !== undefined && currentOptimalMax !== undefined) {
    const percentChange = Math.abs((extracted.optimalMax - currentOptimalMax) / currentOptimalMax) * 100
    if (percentChange > 15) {
      return {
        priority: 'high',
        reasoning: `Mudança significativa no limite ótimo máximo: ${currentOptimalMax} → ${extracted.optimalMax} (${percentChange.toFixed(1)}% de diferença).`,
      }
    }
  }

  // MEDIUM: Novos valores preenchendo gaps
  if (extracted.optimalMin !== undefined && currentOptimalMin === undefined) {
    return {
      priority: 'medium',
      reasoning: `Novo valor para limite ótimo mínimo: ${extracted.optimalMin} ${extracted.unit || ''}. Preenche lacuna nos dados existentes.`,
    }
  }

  if (extracted.labMin !== undefined && currentLabMin === undefined) {
    return {
      priority: 'medium',
      reasoning: `Novo valor para limite laboratorial mínimo: ${extracted.labMin} ${extracted.unit || ''}. Preenche lacuna nos dados existentes.`,
    }
  }

  // LOW: Pequenas mudanças ou refinamentos
  return {
    priority: 'low',
    reasoning: `Atualização menor de valores de referência baseado em ${extracted.name}.`,
  }
}

/**
 * Salva sugestões no banco de dados (com deduplicação)
 */
export async function saveSuggestions(suggestions: GeneratedSuggestion[]): Promise<void> {
  if (suggestions.length === 0) {
    console.log('ℹ️ [SUGGESTION-GENERATOR] No suggestions to save')
    return
  }

  console.log(`💾 [SUGGESTION-GENERATOR] Saving ${suggestions.length} suggestions...`)

  // Buscar sugestões pendentes existentes para evitar duplicatas
  const targetSlugs = suggestions
    .map(s => s.targetSlug)
    .filter((slug): slug is string => slug !== null)

  const existingPendingSuggestions = await db
    .select()
    .from(knowledgeUpdateSuggestions)
    .where(eq(knowledgeUpdateSuggestions.status, 'pending'))

  const existingMap = new Map(
    existingPendingSuggestions.map(s => [
      `${s.targetType}:${s.targetSlug}`,
      s,
    ])
  )

  let savedCount = 0
  let skippedCount = 0

  for (const suggestion of suggestions) {
    try {
      const key = `${suggestion.targetType}:${suggestion.targetSlug}`

      // Verificar se já existe sugestão pendente para este alvo
      if (existingMap.has(key)) {
        const existing = existingMap.get(key)!

        // Comparar valores para ver se é realmente duplicata
        const isSimilar = areSuggestionsEquivalent(
          existing.suggestedData,
          suggestion.suggestedData
        )

        if (isSimilar) {
          console.log(
            `⏭️  [SUGGESTION-GENERATOR] Skipping duplicate: ${suggestion.targetSlug} (already pending with similar values)`
          )
          skippedCount++
          continue
        }

        // Se os valores são diferentes, continuar e criar (pode ser de fonte diferente)
        console.log(
          `🔄 [SUGGESTION-GENERATOR] Creating additional suggestion for ${suggestion.targetSlug} (different values from existing)`
        )
      }

      await db.insert(knowledgeUpdateSuggestions).values({
        articleId: suggestion.articleId,
        articleTitle: suggestion.articleTitle,
        suggestionType: suggestion.suggestionType,
        targetType: suggestion.targetType,
        targetSlug: suggestion.targetSlug,
        targetId: suggestion.targetId,
        suggestedData: suggestion.suggestedData,
        currentData: suggestion.currentData,
        aiConfidence: suggestion.aiConfidence,
        aiReasoning: suggestion.aiReasoning,
        priority: suggestion.priority,
        isConflict: suggestion.isConflict,
        extractionMetadata: {
          model: 'gemini-2.5-pro',
          analyzedAt: new Date().toISOString(),
          version: '1.0',
        },
      })

      savedCount++
    } catch (error) {
      console.error(`❌ [SUGGESTION-GENERATOR] Error saving suggestion:`, error)
      // Continue salvando outras sugestões
    }
  }

  console.log(
    `✅ [SUGGESTION-GENERATOR] Saved ${savedCount} suggestions, skipped ${skippedCount} duplicates (${savedCount + skippedCount} total processed)`
  )
}

/**
 * Compara se duas sugestões são equivalentes (mesmos valores)
 */
function areSuggestionsEquivalent(data1: any, data2: any): boolean {
  // Comparar valores numéricos principais
  const keys = ['optimalMin', 'optimalMax', 'labMin', 'labMax']

  for (const key of keys) {
    const val1 = data1[key]
    const val2 = data2[key]

    // Se ambos estão definidos, devem ser iguais (com tolerância)
    if (val1 !== undefined && val2 !== undefined) {
      const diff = Math.abs(val1 - val2)
      const tolerance = Math.max(val1, val2) * 0.01 // 1% de tolerância

      if (diff > tolerance) {
        return false // Valores diferentes
      }
    }
  }

  return true // Valores similares ou ausentes
}

/**
 * Função principal: Gera e salva todas as sugestões para um artigo
 */
export async function generateAndSaveSuggestions(
  extractedBiomarkers: ExtractedBiomarker[],
  extractedProtocols: ExtractedProtocol[],
  articleId: string,
  articleTitle: string
): Promise<number> {
  const biomarkerSuggestions = await generateBiomarkerSuggestions(
    extractedBiomarkers,
    articleId,
    articleTitle
  )

  // TODO: Implementar geração de sugestões de protocolos (futura)
  // const protocolSuggestions = await generateProtocolSuggestions(...)

  const allSuggestions = [...biomarkerSuggestions]

  await saveSuggestions(allSuggestions)

  return allSuggestions.length
}
