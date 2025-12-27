/**
 * Test complete analysis API logic
 */

import { db } from '@/lib/db/client'
import { completeAnalyses, analyses, healthAgents, recommendations, weeklyPlans } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function testAPI() {
  try {
    const analysisId = 'f8b61ab5-830d-4fd6-b90e-d55efeb0881e'
    const userId = '2b2f1392-c098-49cb-be90-676dfa4c49ce'

    console.log(`🧪 Testing API logic for analysis: ${analysisId}\n`)

    // Step 1: Fetch complete analysis
    console.log('Step 1: Fetching complete analysis...')
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
    console.log(`   User: ${completeAnalysis.userId}`)
    console.log(`   Status: ${completeAnalysis.status}`)

    // Step 2: Fetch related analyses
    console.log('\nStep 2: Fetching related analyses...')
    const analysisIds = [
      completeAnalysis.integrativeAnalysisId,
      completeAnalysis.nutritionAnalysisId,
      completeAnalysis.exerciseAnalysisId,
    ].filter(Boolean) as string[]

    console.log(`   Analysis IDs: ${analysisIds.join(', ')}`)

    // Try fetching each analysis individually first
    for (const aId of analysisIds) {
      console.log(`\n   Fetching analysis: ${aId}`)
      const [analysis] = await db
        .select({
          id: analyses.id,
          agentId: analyses.agentId,
          analysis: analyses.analysis,
          insights: analyses.insights,
          actionItems: analyses.actionItems,
        })
        .from(analyses)
        .where(eq(analyses.id, aId))
        .limit(1)

      if (analysis) {
        console.log(`   ✅ Found analysis with agentId: ${analysis.agentId}`)

        // Fetch agent
        const [agent] = await db
          .select()
          .from(healthAgents)
          .where(eq(healthAgents.id, analysis.agentId))
          .limit(1)

        if (agent) {
          console.log(`      Agent: ${agent.name} (${agent.agentKey})`)
        } else {
          console.log(`      ❌ Agent not found for ID: ${analysis.agentId}`)
        }
      } else {
        console.log(`   ❌ Analysis not found`)
      }
    }

    // Step 3: Try the UNION query
    console.log('\nStep 3: Testing UNION query...')
    try {
      const relatedAnalyses = await db
        .select({
          id: analyses.id,
          analysis: analyses.analysis,
          insights: analyses.insights,
          actionItems: analyses.actionItems,
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
              insights: analyses.insights,
              actionItems: analyses.actionItems,
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
              insights: analyses.insights,
              actionItems: analyses.actionItems,
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

      console.log(`✅ UNION query successful, found ${relatedAnalyses.length} analyses`)
      relatedAnalyses.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.agentName} (${a.agentKey})`)
      })
    } catch (error) {
      console.log('❌ UNION query failed:', error)
    }

    console.log('\n✅ API test completed')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    process.exit(0)
  }
}

testAPI()
