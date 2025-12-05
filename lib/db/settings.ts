/**
 * App Settings Helper
 * Easy access to application settings
 */

import { db } from './client'
import { appSettings } from './schema'
import { eq } from 'drizzle-orm'

// Default settings
const DEFAULT_SETTINGS = {
  'knowledge.maxChunks': 184,
  'knowledge.maxCharsPerChunk': 1200,
  'knowledge.similarityThreshold': 0.1,
}

/**
 * Get a setting value (with caching)
 */
export async function getSetting<T = string>(
  key: string,
  defaultValue?: T
): Promise<T> {
  try {
    const [setting] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, key))
      .limit(1)

    if (setting) {
      // Try to parse as number if possible
      const value = setting.value
      const numValue = Number(value)
      if (!isNaN(numValue) && value === String(numValue)) {
        return numValue as T
      }
      return value as T
    }

    // Return default from constants
    if (key in DEFAULT_SETTINGS) {
      return DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS] as T
    }

    // Return provided default
    if (defaultValue !== undefined) {
      return defaultValue
    }

    throw new Error(`Setting '${key}' not found and no default provided`)
  } catch (error) {
    console.error(`Error getting setting '${key}':`, error)
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw error
  }
}

/**
 * Get multiple settings at once
 */
export async function getSettings(keys: string[]): Promise<Record<string, any>> {
  const result: Record<string, any> = {}

  for (const key of keys) {
    try {
      result[key] = await getSetting(key)
    } catch (error) {
      console.error(`Failed to get setting '${key}':`, error)
    }
  }

  return result
}

/**
 * Get knowledge base configuration
 */
export async function getKnowledgeConfig() {
  return {
    maxChunks: await getSetting<number>('knowledge.maxChunks', 184),
    maxCharsPerChunk: await getSetting<number>('knowledge.maxCharsPerChunk', 1200),
    similarityThreshold: await getSetting<number>('knowledge.similarityThreshold', 0.5),
  }
}
