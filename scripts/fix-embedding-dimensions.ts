/**
 * Fix Embedding Dimensions: 1536 → 768
 * This script directly alters the knowledge_embeddings table
 */

import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'

async function fixEmbeddingDimensions() {
  try {
    console.log('🔧 Fixing embedding dimensions...')

    // Step 1: Delete all existing embeddings (they're incompatible)
    console.log('🗑️  Deleting existing embeddings (1536 dim)...')
    await db.execute(sql`TRUNCATE TABLE knowledge_embeddings`)
    console.log('✅ Old embeddings deleted')

    // Step 2: Alter column to 768 dimensions
    console.log('📐 Altering column to 768 dimensions...')
    await db.execute(sql`
      ALTER TABLE knowledge_embeddings
      ALTER COLUMN embedding SET DATA TYPE vector(768)
    `)
    console.log('✅ Column altered to 768 dimensions')

    console.log('\n✨ Done! Now run: pnpm embeddings:migrate')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  process.exit(0)
}

fixEmbeddingDimensions()
