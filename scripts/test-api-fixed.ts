/**
 * Test fixed API logic
 */

import { db } from '@/lib/db/client'
import { completeAnalyses, analyses, healthAgents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function testAPI() {
  try {
    const analysisId = 'f8b61ab5-830d-4fd6-b90e-d55efeb0881e'

    console.log(`🧪 Testing fixed API logic for analysis: ${analysisId}\n`)

    // Fetch complete analysis
    const [completeAnalysis] = await db
      .select()
      .from(completeAnalyses)
      .where(eq(completeAnalyses.id, analysisId))
      .limit(1)

    if (!completeAnalysis) {
      console.log('❌ Complete analysis not found')
      return
    }

    console.log('✅ Complete analysis found')

    // Fetch related analyses
    const analysisIds = [
      completeAnalysis.integrativeAnalysisId,
      completeAnalysis.nutritionAnalysisId,
      completeAnalysis.exerciseAnalysisId,
    ].filter(Boolean) as string[]

    console.log(`\nFetching ${analysisIds.length} related analyses...\n`)

    const relatedAnalyses = await db
      .select({
        id: analyses.id,
        analysis: analyses.analysis,
        createdAt: analyses.createdAt,
        agentName: healthAgents.name,
        agentKey: healthAgents.agentKey,
        agentTitle: healthAgents.title,
        agentColor: healthAgents.color,
      })
      .from(analyses)
      .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
      .where(eq(analyses.id, analysisIds[0]))
      .union(
        db
          .select({
            id: analyses.id,
            analysis: analyses.analysis,
            createdAt: analyses.createdAt,
            agentName: healthAgents.name,
            agentKey: healthAgents.agentKey,
            agentTitle: healthAgents.title,
            agentColor: healthAgents.color,
          })
          .from(analyses)
          .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
          .where(eq(analyses.id, analysisIds[1]))
      )
      .union(
        db
          .select({
            id: analyses.id,
            analysis: analyses.analysis,
            createdAt: analyses.createdAt,
            agentName: healthAgents.name,
            agentKey: healthAgents.agentKey,
            agentTitle: healthAgents.title,
            agentColor: healthAgents.color,
          })
          .from(analyses)
          .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
          .where(eq(analyses.id, analysisIds[2]))
      )

    console.log(`✅ Successfully fetched ${relatedAnalyses.length} analyses:`)
    relatedAnalyses.forEach((a, i) => {
      console.log(`\n${i + 1}. ${a.agentName} (${a.agentKey})`)
      console.log(`   Analysis length: ${a.analysis.length} chars`)
      console.log(`   Created: ${a.createdAt}`)
    })

    console.log('\n✅ API test successful!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    process.exit(0)
  }
}

testAPI()
