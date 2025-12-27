/**
 * Check documents in database
 */

import { db } from '@/lib/db/client'
import { documents } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

async function checkDocuments() {
  try {
    console.log('📚 Checking documents in database...\n')

    const allDocs = await db
      .select({
        id: documents.id,
        fileName: documents.fileName,
        documentType: documents.documentType,
        processingStatus: documents.processingStatus,
        userId: documents.userId,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(10)

    console.log(`Found ${allDocs.length} documents:\n`)

    allDocs.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.fileName}`)
      console.log(`   Type: ${doc.documentType}`)
      console.log(`   Status: ${doc.processingStatus}`)
      console.log(`   User ID: ${doc.userId}`)
      console.log(`   Created: ${doc.createdAt}`)
      console.log()
    })

    const completedDocs = allDocs.filter(d => d.processingStatus === 'completed')
    console.log(`\n✅ ${completedDocs.length} documents with status 'completed'`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    process.exit(0)
  }
}

checkDocuments()
