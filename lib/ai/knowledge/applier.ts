/**
 * Suggestion Applier
 * Aplica sugestões aprovadas ao Cérebro Lógico
 */

import { db } from '@/lib/db/client'
import {
  knowledgeUpdateSuggestions,
  biomarkersReference,
  protocols,
  syncAuditLog,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface ApplyResult {
  success: boolean
  changes?: {
    target: 'biomarker' | 'protocol'
    slug: string
    before: any
    after: any
  }
  error?: string
}

/**
 * Aplica uma sugestão aprovada ao Cérebro Lógico
 */
export async function applySuggestion(
  suggestionId: string,
  userId: string
): Promise<ApplyResult> {
  console.log(`🔧 [APPLIER] Applying suggestion ${suggestionId}`)

  // Carregar sugestão
  const [suggestion] = await db
    .select()
    .from(knowledgeUpdateSuggestions)
    .where(eq(knowledgeUpdateSuggestions.id, suggestionId))
    .limit(1)

  if (!suggestion) {
    console.error(`❌ [APPLIER] Suggestion ${suggestionId} not found`)
    return {
      success: false,
      error: 'Suggestion not found',
    }
  }

  console.log(`📋 [APPLIER] Suggestion details:`, {
    type: suggestion.suggestionType,
    targetType: suggestion.targetType,
    targetSlug: suggestion.targetSlug,
    status: suggestion.status,
  })

  // Verificar se já foi aplicada
  if (suggestion.status === 'applied') {
    console.warn(`⚠️  [APPLIER] Suggestion ${suggestionId} already applied`)
    return {
      success: false,
      error: 'Suggestion already applied',
    }
  }

  // Aplicar baseado no tipo
  try {
    let result: ApplyResult

    if (suggestion.targetType === 'biomarker') {
      if (suggestion.suggestionType === 'biomarker_update') {
        result = await applyBiomarkerUpdate(suggestion, userId)
      } else if (suggestion.suggestionType === 'biomarker_create') {
        result = await applyBiomarkerCreate(suggestion, userId)
      } else {
        return { success: false, error: 'Unknown suggestion type' }
      }
    } else if (suggestion.targetType === 'protocol') {
      // TODO: Implementar aplicação de protocolos
      return { success: false, error: 'Protocol application not yet implemented' }
    } else {
      return { success: false, error: 'Unknown target type' }
    }

    if (result.success) {
      // Atualizar status da sugestão
      await db
        .update(knowledgeUpdateSuggestions)
        .set({
          status: 'applied',
          appliedBy: userId,
          appliedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(knowledgeUpdateSuggestions.id, suggestionId))

      console.log(`✅ [APPLIER] Successfully applied suggestion ${suggestionId}`)
    }

    return result
  } catch (error) {
    console.error(`❌ [APPLIER] Error applying suggestion:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Aplica atualização de biomarcador existente
 */
async function applyBiomarkerUpdate(
  suggestion: any,
  userId: string
): Promise<ApplyResult> {
  const { targetSlug, suggestedData, currentData, articleId } = suggestion

  if (!targetSlug) {
    return { success: false, error: 'No target slug provided' }
  }

  // Carregar biomarcador atual
  const [current] = await db
    .select()
    .from(biomarkersReference)
    .where(eq(biomarkersReference.slug, targetSlug))
    .limit(1)

  if (!current) {
    // Biomarcador não existe - converter para criação
    console.log(
      `⚠️  [APPLIER] Biomarker ${targetSlug} not found, converting to CREATE operation`
    )
    return await applyBiomarkerCreate(
      { ...suggestion, suggestedData: { ...suggestedData, slug: targetSlug } },
      userId
    )
  }

  // Preparar dados de atualização
  const updateData: any = {
    updatedAt: new Date(),
    lastSyncedFrom: articleId,
    syncMetadata: {
      suggestionId: suggestion.id,
      appliedBy: userId,
      appliedAt: new Date().toISOString(),
      confidence: suggestion.aiConfidence,
      previousValues: currentData,
    },
  }

  // Atualizar apenas campos que foram sugeridos
  if (suggestedData.name !== undefined) updateData.name = suggestedData.name
  if (suggestedData.optimalMin !== undefined) updateData.optimalMin = suggestedData.optimalMin.toString()
  if (suggestedData.optimalMax !== undefined) updateData.optimalMax = suggestedData.optimalMax.toString()
  if (suggestedData.labMin !== undefined) updateData.labMin = suggestedData.labMin.toString()
  if (suggestedData.labMax !== undefined) updateData.labMax = suggestedData.labMax.toString()
  if (suggestedData.unit !== undefined) updateData.unit = suggestedData.unit
  if (suggestedData.sourceRef !== undefined) updateData.sourceRef = suggestedData.sourceRef

  // Executar atualização em transação
  await db.transaction(async (tx) => {
    // 1. Atualizar biomarcador
    await tx
      .update(biomarkersReference)
      .set(updateData)
      .where(eq(biomarkersReference.slug, targetSlug))

    // 2. Registrar em audit log
    await tx.insert(syncAuditLog).values({
      suggestionId: suggestion.id,
      action: 'biomarker_updated',
      targetType: 'biomarker',
      targetSlug,
      changes: {
        before: currentData,
        after: suggestedData,
      },
      performedBy: userId,
      sourceArticleId: articleId,
      notes: suggestion.aiReasoning,
    })
  })

  return {
    success: true,
    changes: {
      target: 'biomarker',
      slug: targetSlug,
      before: currentData,
      after: suggestedData,
    },
  }
}

/**
 * Aplica criação de novo biomarcador
 */
async function applyBiomarkerCreate(
  suggestion: any,
  userId: string
): Promise<ApplyResult> {
  const { suggestedData, articleId } = suggestion

  console.log(`🆕 [APPLIER] Creating new biomarker:`, {
    slug: suggestedData.slug,
    name: suggestedData.name,
    unit: suggestedData.unit,
  })

  if (!suggestedData.slug) {
    console.error(`❌ [APPLIER] No slug provided for new biomarker`)
    return { success: false, error: 'No slug provided for new biomarker' }
  }

  if (!suggestedData.name) {
    console.error(`❌ [APPLIER] No name provided for new biomarker`)
    return { success: false, error: 'No name provided for new biomarker' }
  }

  // Verificar se já existe
  const [existing] = await db
    .select()
    .from(biomarkersReference)
    .where(eq(biomarkersReference.slug, suggestedData.slug))
    .limit(1)

  if (existing) {
    // Biomarcador já existe - converter para atualização
    console.log(
      `⚠️  [APPLIER] Biomarker ${suggestedData.slug} already exists, converting to UPDATE operation`
    )

    // Construir currentData a partir do registro existente
    const currentData = {
      slug: existing.slug,
      name: existing.name,
      optimalMin: existing.optimalMin ? parseFloat(existing.optimalMin as string) : undefined,
      optimalMax: existing.optimalMax ? parseFloat(existing.optimalMax as string) : undefined,
      labMin: existing.labMin ? parseFloat(existing.labMin as string) : undefined,
      labMax: existing.labMax ? parseFloat(existing.labMax as string) : undefined,
      unit: existing.unit,
      sourceRef: existing.sourceRef,
    }

    return await applyBiomarkerUpdate(
      { ...suggestion, targetSlug: suggestedData.slug, currentData },
      userId
    )
  }

  // Preparar dados para inserção
  const insertData: any = {
    slug: suggestedData.slug,
    name: suggestedData.name,
    unit: suggestedData.unit || null,
    sourceRef: suggestedData.sourceRef || suggestion.articleTitle || null,
    updatedAt: new Date(),
    lastSyncedFrom: articleId || null,
    syncMetadata: {
      suggestionId: suggestion.id,
      appliedBy: userId,
      appliedAt: new Date().toISOString(),
      confidence: suggestion.aiConfidence,
    },
  }

  // Adicionar valores opcionais
  if (suggestedData.optimalMin !== undefined) insertData.optimalMin = suggestedData.optimalMin.toString()
  if (suggestedData.optimalMax !== undefined) insertData.optimalMax = suggestedData.optimalMax.toString()
  if (suggestedData.labMin !== undefined) insertData.labMin = suggestedData.labMin.toString()
  if (suggestedData.labMax !== undefined) insertData.labMax = suggestedData.labMax.toString()
  if (suggestedData.category) insertData.category = suggestedData.category
  if (suggestedData.clinicalInsight) insertData.clinicalInsight = suggestedData.clinicalInsight
  if (suggestedData.metaphor) insertData.metaphor = suggestedData.metaphor

  console.log(`💾 [APPLIER] Insert data:`, JSON.stringify(insertData, null, 2))

  // Executar inserção em transação
  try {
    await db.transaction(async (tx) => {
      // 1. Criar biomarcador
      console.log(`📝 [APPLIER] Inserting biomarker into database...`)
      await tx.insert(biomarkersReference).values(insertData)

      // 2. Registrar em audit log
      console.log(`📝 [APPLIER] Inserting audit log...`)
      await tx.insert(syncAuditLog).values({
        suggestionId: suggestion.id,
        action: 'biomarker_created',
        targetType: 'biomarker',
        targetSlug: suggestedData.slug,
        changes: {
          before: null,
          after: suggestedData,
        },
        performedBy: userId,
        sourceArticleId: articleId,
        notes: `Novo biomarcador criado: ${suggestedData.name}`,
      })

      console.log(`✅ [APPLIER] Transaction completed successfully`)
    })
  } catch (error) {
    console.error(`❌ [APPLIER] Transaction failed:`, error)
    throw error
  }

  return {
    success: true,
    changes: {
      target: 'biomarker',
      slug: suggestedData.slug,
      before: null,
      after: suggestedData,
    },
  }
}

/**
 * Reverte uma sugestão aplicada (rollback)
 */
export async function revertSuggestion(
  suggestionId: string,
  userId: string
): Promise<ApplyResult> {
  console.log(`⏪ [APPLIER] Reverting suggestion ${suggestionId}`)

  // Carregar sugestão
  const [suggestion] = await db
    .select()
    .from(knowledgeUpdateSuggestions)
    .where(eq(knowledgeUpdateSuggestions.id, suggestionId))
    .limit(1)

  if (!suggestion) {
    return { success: false, error: 'Suggestion not found' }
  }

  if (suggestion.status !== 'applied') {
    return { success: false, error: 'Suggestion was not applied' }
  }

  if (suggestion.suggestionType === 'biomarker_update' && suggestion.targetSlug) {
    // Reverter para valores anteriores
    const currentData = suggestion.currentData

    await db.transaction(async (tx) => {
      await tx
        .update(biomarkersReference)
        .set({
          optimalMin: currentData.optimalMin?.toString(),
          optimalMax: currentData.optimalMax?.toString(),
          labMin: currentData.labMin?.toString(),
          labMax: currentData.labMax?.toString(),
          unit: currentData.unit,
          sourceRef: currentData.sourceRef,
          updatedAt: new Date(),
        })
        .where(eq(biomarkersReference.slug, suggestion.targetSlug))

      await tx.insert(syncAuditLog).values({
        suggestionId,
        action: 'biomarker_reverted',
        targetType: 'biomarker',
        targetSlug: suggestion.targetSlug,
        changes: {
          before: suggestion.suggestedData,
          after: currentData,
        },
        performedBy: userId,
        notes: 'Reverted to previous values',
      })
    })

    // Atualizar status
    await db
      .update(knowledgeUpdateSuggestions)
      .set({
        status: 'approved', // Volta para aprovado mas não aplicado
        updatedAt: new Date(),
      })
      .where(eq(knowledgeUpdateSuggestions.id, suggestionId))

    return { success: true }
  }

  if (suggestion.suggestionType === 'biomarker_create' && suggestion.targetSlug) {
    // Deletar biomarcador criado
    await db.transaction(async (tx) => {
      await tx
        .delete(biomarkersReference)
        .where(eq(biomarkersReference.slug, suggestion.targetSlug))

      await tx.insert(syncAuditLog).values({
        suggestionId,
        action: 'biomarker_deleted',
        targetType: 'biomarker',
        targetSlug: suggestion.targetSlug,
        performedBy: userId,
        notes: 'Deleted biomarker created by suggestion',
      })
    })

    await db
      .update(knowledgeUpdateSuggestions)
      .set({
        status: 'approved',
        updatedAt: new Date(),
      })
      .where(eq(knowledgeUpdateSuggestions.id, suggestionId))

    return { success: true }
  }

  return { success: false, error: 'Revert not supported for this suggestion type' }
}
