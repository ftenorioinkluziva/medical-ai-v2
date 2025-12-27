/**
 * Test documents API logic
 */

import { db } from '@/lib/db/client'
import { documents } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

async function testDocumentsAPI() {
  try {
    const userId = '2b2f1392-c098-49cb-be90-676dfa4c49ce' // From check-documents.ts

    console.log(`📚 Testing documents API for user: ${userId}\n`)

    // Simulate the API query
    const userDocuments = await db
      .select({
        id: documents.id,
        fileName: documents.fileName,
        fileSize: documents.fileSize,
        mimeType: documents.fileType,
        documentType: documents.documentType,
        documentDate: documents.documentDate,
        processingStatus: documents.processingStatus,
        extractedText: documents.extractedText,
        structuredData: documents.structuredData,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.documentDate), desc(documents.createdAt))
      .limit(50)

    console.log(`✅ Found ${userDocuments.length} documents\n`)

    userDocuments.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.fileName}`)
      console.log(`   ID: ${doc.id}`)
      console.log(`   Type: ${doc.documentType}`)
      console.log(`   Status: ${doc.processingStatus}`)
      console.log(`   Created: ${doc.createdAt}`)
      console.log()
    })

    // Filter completed
    const completedDocs = userDocuments.filter(d => d.processingStatus === 'completed')
    console.log(`\n✅ ${completedDocs.length} completed documents that should appear in the UI`)

    // Simulate API response
    const apiResponse = {
      success: true,
      documents: userDocuments,
      count: userDocuments.length,
      timestamp: new Date().toISOString(),
    }

    console.log('\n📤 API Response:')
    console.log(JSON.stringify(apiResponse, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    process.exit(0)
  }
}

testDocumentsAPI()
