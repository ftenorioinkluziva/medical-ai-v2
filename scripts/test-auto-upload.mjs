/**
 * Test Script for Auto-Upload API
 * Demonstrates how to upload a PDF to the knowledge base using the auto-upload endpoint
 *
 * Usage:
 *   node scripts/test-auto-upload.mjs <path-to-pdf> <session-token>
 *
 * Example:
 *   node scripts/test-auto-upload.mjs ./test.pdf "eyJhbGciOiJIUzI1NiJ9..."
 */

import { readFileSync } from 'fs'
import { basename } from 'path'

// Parse command line arguments
const pdfPath = process.argv[2]
const sessionToken = process.argv[3]

if (!pdfPath || !sessionToken) {
  console.error('❌ Usage: node scripts/test-auto-upload.mjs <path-to-pdf> <session-token>')
  console.error('')
  console.error('How to get session token:')
  console.error('1. Login at http://localhost:3000/login')
  console.error('2. Open DevTools (F12) → Application → Cookies')
  console.error('3. Copy value of "authjs.session-token"')
  process.exit(1)
}

console.log('🚀 Testing Auto-Upload API\n')
console.log(`📄 File: ${pdfPath}`)
console.log(`🔑 Token: ${sessionToken.substring(0, 20)}...\n`)

try {
  // Read the PDF file
  const fileBuffer = readFileSync(pdfPath)
  const fileName = basename(pdfPath)

  console.log(`✅ File loaded: ${fileBuffer.length} bytes`)
  console.log(`📝 Uploading to API...\n`)

  // Create FormData
  const FormData = (await import('formdata-node')).FormData
  const { Blob } = await import('buffer')

  const formData = new FormData()
  formData.append('file', new Blob([fileBuffer], { type: 'application/pdf' }), fileName)

  // Make the request
  const startTime = Date.now()

  const response = await fetch('http://localhost:3000/api/admin/knowledge/auto-upload', {
    method: 'POST',
    headers: {
      'Cookie': `authjs.session-token=${sessionToken}`
    },
    body: formData
  })

  const processingTime = Date.now() - startTime
  const data = await response.json()

  console.log(`⏱️  Request completed in ${processingTime}ms\n`)

  if (response.ok && data.success) {
    console.log('✅ SUCCESS!\n')
    console.log('📊 Result:')
    console.log(`   Article ID: ${data.articleId}`)
    console.log(`\n📋 Generated Metadata:`)
    console.log(`   Title: ${data.metadata.title}`)
    console.log(`   Category: ${data.metadata.category}`)
    console.log(`   Subcategory: ${data.metadata.subcategory || 'N/A'}`)
    console.log(`   Source: ${data.metadata.source || 'N/A'}`)
    console.log(`   Author: ${data.metadata.author || 'N/A'}`)
    console.log(`   Tags: ${data.metadata.tags}`)
    console.log(`   Summary: ${data.metadata.summary}`)
    console.log(`\n📈 Stats:`)
    console.log(`   Text Length: ${data.stats.textLength} chars`)
    console.log(`   Chunks: ${data.stats.chunksCount}`)
    console.log(`   Processing Time: ${data.stats.processingTimeMs}ms`)
  } else {
    console.error('❌ FAILED!\n')
    console.error(`Status: ${response.status} ${response.statusText}`)
    console.error(`Error: ${data.error}`)

    if (response.status === 401) {
      console.error('\n💡 Tip: Your session token may be expired. Login again and get a new token.')
    } else if (response.status === 403) {
      console.error('\n💡 Tip: You need admin privileges to upload articles.')
    }
  }

} catch (error) {
  console.error('❌ Error:', error.message)

  if (error.code === 'ENOENT') {
    console.error('\n💡 Tip: File not found. Check the path.')
  } else if (error.code === 'ECONNREFUSED') {
    console.error('\n💡 Tip: Make sure the dev server is running (pnpm dev)')
  }

  process.exit(1)
}
