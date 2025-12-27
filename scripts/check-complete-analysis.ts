/**
 * Check specific complete analysis
 */

import { db } from '@/lib/db/client'
import { completeAnalyses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function checkAnalysis() {
  try {
    const analysisId = 'f8b61ab5-830d-4fd6-b90e-d55efeb0881e'

    console.log(`🔍 Checking complete analysis: ${analysisId}\n`)

    // Check if analysis exists
    const analysis = await db
      .select()
      .from(completeAnalyses)
      .where(eq(completeAnalyses.id, analysisId))
      .limit(1)

    if (analysis.length === 0) {
      console.log('❌ Analysis NOT FOUND in database')
      console.log('\nLet me check all complete analyses...\n')

      const allAnalyses = await db
        .select({
          id: completeAnalyses.id,
          userId: completeAnalyses.userId,
          status: completeAnalyses.status,
          createdAt: completeAnalyses.createdAt,
        })
        .from(completeAnalyses)
        .limit(10)

      console.log(`Found ${allAnalyses.length} complete analyses:\n`)
      allAnalyses.forEach((a, i) => {
        console.log(`${i + 1}. ID: ${a.id}`)
        console.log(`   Status: ${a.status}`)
        console.log(`   User: ${a.userId}`)
        console.log(`   Created: ${a.createdAt}`)
        console.log()
      })
    } else {
      console.log('✅ Analysis FOUND!\n')
      const a = analysis[0]
      console.log('Details:')
      console.log(`  ID: ${a.id}`)
      console.log(`  User: ${a.userId}`)
      console.log(`  Status: ${a.status}`)
      console.log(`  Document IDs: ${JSON.stringify(a.documentIds)}`)
      console.log(`  Integrative Analysis ID: ${a.integrativeAnalysisId}`)
      console.log(`  Nutrition Analysis ID: ${a.nutritionAnalysisId}`)
      console.log(`  Exercise Analysis ID: ${a.exerciseAnalysisId}`)
      console.log(`  Has Synthesis: ${a.synthesis ? 'Yes' : 'No'}`)
      console.log(`  Recommendations ID: ${a.recommendationsId}`)
      console.log(`  Weekly Plan ID: ${a.weeklyPlanId}`)
      console.log(`  Created: ${a.createdAt}`)
      console.log(`  Completed: ${a.completedAt}`)

      if (a.synthesis) {
        console.log('\n📊 Synthesis:')
        console.log(JSON.stringify(a.synthesis, null, 2))
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    process.exit(0)
  }
}

checkAnalysis()
