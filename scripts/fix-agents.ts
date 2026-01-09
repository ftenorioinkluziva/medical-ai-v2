
import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function fixAgents() {
    console.log('🔧 Fixing Missing Specialists...')

    // Fix Cardiologia
    await db.update(healthAgents)
        .set({
            agentType: 'analysis',
            analysisRole: 'specialized',
            analysisOrder: 3,
            isActive: true,
            contextConfig: {
                includeMedicalProfile: true,
                includeDocuments: true,
                includeStructuredData: true,
                includeRagContext: true,
                includePreviousAnalysis: true
            }
        })
        .where(eq(healthAgents.agentKey, 'cardiologia'))

    console.log('✅ Fixed Cardiologia')

    // Fix Gerontologia
    await db.update(healthAgents)
        .set({
            agentType: 'analysis',
            analysisRole: 'specialized',
            analysisOrder: 4,
            isActive: true,
            contextConfig: {
                includeMedicalProfile: true,
                includeDocuments: true,
                includeStructuredData: true,
                includeRagContext: true,
                includePreviousAnalysis: true
            }
        })
        .where(eq(healthAgents.agentKey, 'longevidade')) // Assuming key is longevidade based on previous contexts, or 'gerontologia'

    // Try both keys just in case
    await db.update(healthAgents)
        .set({
            agentType: 'analysis',
            analysisRole: 'specialized',
            analysisOrder: 4,
            isActive: true,
            contextConfig: {
                includeMedicalProfile: true,
                includeDocuments: true,
                includeStructuredData: true,
                includeRagContext: true,
                includePreviousAnalysis: true
            }
        })
        .where(eq(healthAgents.agentKey, 'gerontologia'))

    console.log('✅ Fixed Gerontologia/Longevidade')
}

fixAgents().catch(console.error)
