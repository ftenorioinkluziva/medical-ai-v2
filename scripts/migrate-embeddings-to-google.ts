/**
 * Migration Script: OpenAI Embeddings → Google Embeddings
 *
 * This script re-generates all knowledge base embeddings using Google text-embedding-004
 * instead of OpenAI text-embedding-3-small for cost savings (50-60% cheaper).
 *
 * ⚠️ IMPORTANT: Run this script ONCE after updating embedding defaults
 *
 * Usage:
 *   pnpm tsx scripts/migrate-embeddings-to-google.ts
 *
 * Optional flags:
 *   --dry-run    : Preview changes without executing
 *   --batch-size=N : Process N articles at a time (default: 10)
 */

import { db } from '@/lib/db/client'
import { knowledgeArticles, knowledgeEmbeddings } from '@/lib/db/schema'
import { chunkDocument } from '@/lib/documents/chunking'
import { generateBatchEmbeddings } from '@/lib/ai/core/embeddings'
import { eq, sql } from 'drizzle-orm'

// Parse CLI arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='))
const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]!) : 10

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  Knowledge Base Embeddings Migration: OpenAI → Google         ║
║                                                                ║
║  This script will re-generate all knowledge embeddings        ║
║  using Google text-embedding-004 (50-60% cost savings)        ║
╚═══════════════════════════════════════════════════════════════╝
`)

if (dryRun) {
  console.log(`🔍 DRY RUN MODE - No changes will be made\n`)
}

async function migrateEmbeddings() {
  try {
    // 1. Count existing embeddings
    const existingEmbeddingsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(knowledgeEmbeddings)
      .then(res => Number(res[0]?.count || 0))

    const existingArticlesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(knowledgeArticles)
      .then(res => Number(res[0]?.count || 0))

    console.log(`📊 Current State:`)
    console.log(`   - Articles: ${existingArticlesCount}`)
    console.log(`   - Embeddings: ${existingEmbeddingsCount}`)
    console.log(``)

    if (existingArticlesCount === 0) {
      console.log(`✅ No articles found - nothing to migrate`)
      return
    }

    // 2. Fetch all articles
    console.log(`📚 Fetching all knowledge articles...`)
    const articles = await db.select().from(knowledgeArticles)
    console.log(`✅ Found ${articles.length} articles\n`)

    if (dryRun) {
      console.log(`📋 Would migrate ${articles.length} articles with ${existingEmbeddingsCount} total embeddings`)
      console.log(`💰 Estimated cost savings: ~50-60% on future embeddings`)
      return
    }

    // 3. Process articles in batches
    let totalProcessed = 0
    let totalChunks = 0
    let totalErrors = 0

    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize)
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(articles.length / batchSize)}`)

      for (const article of batch) {
        try {
          console.log(`  📄 ${article.title}...`)

          // Delete existing embeddings
          await db
            .delete(knowledgeEmbeddings)
            .where(eq(knowledgeEmbeddings.articleId, article.id))

          // Chunk the content
          const chunks = chunkDocument(article.content, {
            maxChunkSize: 1000,
            minChunkSize: 200,
            overlap: 100,
          })

          // Generate Google embeddings
          const chunkTexts = chunks.map(c => c.content)
          const { embeddings, model } = await generateBatchEmbeddings(chunkTexts, {
            provider: 'google'
          })

          // Store new embeddings
          for (const [index, chunk] of chunks.entries()) {
            await db.insert(knowledgeEmbeddings).values({
              articleId: article.id,
              chunkIndex: index,
              content: chunk.content,
              embedding: embeddings[index],
              embeddingModel: model,
              embeddingProvider: 'google',
            })
          }

          totalProcessed++
          totalChunks += chunks.length
          console.log(`  ✅ Generated ${chunks.length} Google embeddings`)

        } catch (error) {
          totalErrors++
          console.error(`  ❌ Error processing article ${article.id}:`, error)
        }
      }

      // Small delay between batches to avoid rate limits
      if (i + batchSize < articles.length) {
        console.log(`  ⏳ Waiting 2 seconds before next batch...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // 4. Final summary
    console.log(`\n
╔═══════════════════════════════════════════════════════════════╗
║  Migration Complete                                           ║
╚═══════════════════════════════════════════════════════════════╝

📊 Summary:
   - Articles processed: ${totalProcessed}/${articles.length}
   - Total chunks created: ${totalChunks}
   - Errors: ${totalErrors}
   - New embedding model: Google text-embedding-004
   - Previous model: OpenAI text-embedding-3-small

💰 Cost Savings:
   - Embedding generation: ~50-60% cheaper going forward
   - All future searches will use Google embeddings
   - No application code changes needed

✅ Next Steps:
   1. Test search functionality to ensure results quality
   2. Monitor Google embedding API usage in console
   3. All new knowledge articles will automatically use Google
`)

  } catch (error) {
    console.error(`\n❌ Migration failed:`, error)
    process.exit(1)
  }
}

// Run migration
migrateEmbeddings()
  .then(() => {
    console.log(`\n✨ Migration script completed`)
    process.exit(0)
  })
  .catch(error => {
    console.error(`\n💥 Fatal error:`, error)
    process.exit(1)
  })
