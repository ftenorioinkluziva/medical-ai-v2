/**
 * Agent Knowledge Filter
 * Handles filtering of knowledge articles based on agent configuration
 */

import { db } from '@/lib/db/client'
import { healthAgents, knowledgeArticles } from '@/lib/db/schema'
import { eq, inArray, and, or } from 'drizzle-orm'

export interface AgentKnowledgeConfig {
  knowledgeAccessType: 'full' | 'restricted'
  allowedAuthors: string[]
  allowedCategories: string[]
  allowedSubcategories: string[]
  excludedArticleIds: string[]
  includedArticleIds: string[]
}

/**
 * Get agent's knowledge configuration
 */
export async function getAgentKnowledgeConfig(
  agentId: string
): Promise<AgentKnowledgeConfig> {
  const agent = await db
    .select({
      knowledgeAccessType: healthAgents.knowledgeAccessType,
      allowedAuthors: healthAgents.allowedAuthors,
      allowedCategories: healthAgents.allowedCategories,
      allowedSubcategories: healthAgents.allowedSubcategories,
      excludedArticleIds: healthAgents.excludedArticleIds,
      includedArticleIds: healthAgents.includedArticleIds,
    })
    .from(healthAgents)
    .where(eq(healthAgents.id, agentId))
    .limit(1)

  if (!agent || agent.length === 0) {
    // Default: full access if agent not found
    return {
      knowledgeAccessType: 'full',
      allowedAuthors: [],
      allowedCategories: [],
      allowedSubcategories: [],
      excludedArticleIds: [],
      includedArticleIds: [],
    }
  }

  return {
    knowledgeAccessType: (agent[0].knowledgeAccessType as 'full' | 'restricted') || 'full',
    allowedAuthors: (agent[0].allowedAuthors as string[]) || [],
    allowedCategories: (agent[0].allowedCategories as string[]) || [],
    allowedSubcategories: (agent[0].allowedSubcategories as string[]) || [],
    excludedArticleIds: (agent[0].excludedArticleIds as string[]) || [],
    includedArticleIds: (agent[0].includedArticleIds as string[]) || [],
  }
}

/**
 * Get list of allowed article IDs for an agent based on its configuration
 */
export async function getAllowedArticleIds(
  agentId: string
): Promise<string[] | null> {
  const config = await getAgentKnowledgeConfig(agentId)

  // If full access, return null (no filtering needed)
  if (config.knowledgeAccessType === 'full') {
    return null
  }

  // Build filter conditions
  const conditions: any[] = [eq(knowledgeArticles.isVerified, 'verified')]

  // Apply cascading filters
  if (config.allowedAuthors.length > 0) {
    conditions.push(inArray(knowledgeArticles.author, config.allowedAuthors))
  }

  if (config.allowedCategories.length > 0) {
    conditions.push(inArray(knowledgeArticles.category, config.allowedCategories))
  }

  if (config.allowedSubcategories.length > 0) {
    conditions.push(inArray(knowledgeArticles.subcategory, config.allowedSubcategories))
  }

  // Fetch filtered articles
  let allowedArticles: string[] = []

  if (conditions.length > 1) {
    const filteredArticles = await db
      .select({ id: knowledgeArticles.id })
      .from(knowledgeArticles)
      .where(and(...conditions))

    allowedArticles = filteredArticles.map((a) => a.id)
  }

  // Add explicitly included articles
  if (config.includedArticleIds.length > 0) {
    allowedArticles = [...new Set([...allowedArticles, ...config.includedArticleIds])]
  }

  // Remove explicitly excluded articles
  if (config.excludedArticleIds.length > 0) {
    allowedArticles = allowedArticles.filter(
      (id) => !config.excludedArticleIds.includes(id)
    )
  }

  return allowedArticles
}

/**
 * Get statistics about agent's knowledge access
 */
export async function getAgentKnowledgeStats(agentId: string) {
  const config = await getAgentKnowledgeConfig(agentId)

  if (config.knowledgeAccessType === 'full') {
    const totalArticles = await db
      .select({ count: knowledgeArticles.id })
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.isVerified, 'verified'))

    return {
      accessType: 'full' as const,
      totalArticles: totalArticles.length,
      categoriesCount: 0,
      excludedCount: 0,
      includedCount: 0,
    }
  }

  const allowedIds = await getAllowedArticleIds(agentId)

  return {
    accessType: 'restricted' as const,
    totalArticles: allowedIds?.length || 0,
    authorsCount: config.allowedAuthors.length,
    categoriesCount: config.allowedCategories.length,
    subcategoriesCount: config.allowedSubcategories.length,
    excludedCount: config.excludedArticleIds.length,
    includedCount: config.includedArticleIds.length,
  }
}

/**
 * Get available knowledge categories with article counts
 */
export async function getKnowledgeCategories() {
  const articles = await db
    .select({
      category: knowledgeArticles.category,
    })
    .from(knowledgeArticles)
    .where(eq(knowledgeArticles.isVerified, 'verified'))

  // Count articles per category
  const categoryCounts: Record<string, number> = {}
  articles.forEach((article) => {
    const category = article.category || 'uncategorized'
    categoryCounts[category] = (categoryCounts[category] || 0) + 1
  })

  // Map of English category names to Portuguese labels
  const categoryLabels: Record<string, string> = {
    nutrition: 'Nutrição',
    endocrinology: 'Endocrinologia',
    cardiology: 'Cardiologia',
    hematology: 'Hematologia',
    metabolism: 'Metabolismo',
    integrative: 'Integrativa',
    general: 'Geral',
    immunology: 'Imunologia',
  }

  return Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category, // Keep English value for filtering
      label: categoryLabels[category] || category, // Portuguese label for display
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Get available knowledge authors with article counts
 */
export async function getKnowledgeAuthors() {
  const articles = await db
    .select({
      author: knowledgeArticles.author,
    })
    .from(knowledgeArticles)
    .where(eq(knowledgeArticles.isVerified, 'verified'))

  // Count articles per author
  const authorCounts: Record<string, number> = {}
  articles.forEach((article) => {
    const author = article.author?.trim() || ''
    if (author) {
      authorCounts[author] = (authorCounts[author] || 0) + 1
    }
  })

  return Object.entries(authorCounts)
    .map(([author, count]) => ({
      author,
      count,
    }))
    .sort((a, b) => a.author.localeCompare(b.author))
}

/**
 * Get available knowledge subcategories with article counts
 */
export async function getKnowledgeSubcategories() {
  const articles = await db
    .select({
      subcategory: knowledgeArticles.subcategory,
    })
    .from(knowledgeArticles)
    .where(eq(knowledgeArticles.isVerified, 'verified'))

  // Count articles per subcategory
  const subcategoryCounts: Record<string, number> = {}
  articles.forEach((article) => {
    const subcategory = article.subcategory?.trim() || ''
    if (subcategory) {
      subcategoryCounts[subcategory] = (subcategoryCounts[subcategory] || 0) + 1
    }
  })

  return Object.entries(subcategoryCounts)
    .map(([subcategory, count]) => ({
      subcategory,
      count,
    }))
    .sort((a, b) => a.subcategory.localeCompare(b.subcategory))
}
