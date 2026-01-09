
import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'

async function debugAgents() {
    console.log('🔍 Debugging Agents...')

    const agents = await db.select().from(healthAgents)

    console.log(`Found ${agents.length} total agents.`)

    console.table(agents.map(a => ({
        name: a.name,
        type: a.agentType,
        role: a.analysisRole,
        active: a.isActive,
        key: a.agentKey
    })))

    const analysisAgents = agents.filter(a => a.agentType === 'analysis')
    console.log(`\nAnalysis Agents (${analysisAgents.length}):`)
    analysisAgents.forEach(a => {
        console.log(`- ${a.name}: Role=${a.analysisRole}, Order=${a.analysisOrder}`)
    })
}

debugAgents().catch(console.error)
