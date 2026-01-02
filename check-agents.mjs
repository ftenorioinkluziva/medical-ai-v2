import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { db } from './lib/db/client.js'
import { healthAgents } from './lib/db/schema/index.js'
import { ne } from 'drizzle-orm'

const agents = await db
  .select({
    id: healthAgents.id,
    name: healthAgents.name,
    agentKey: healthAgents.agentKey,
    analysisRole: healthAgents.analysisRole,
    analysisOrder: healthAgents.analysisOrder,
    isActive: healthAgents.isActive,
  })
  .from(healthAgents)
  .where(ne(healthAgents.analysisRole, 'none'))

console.log('Agentes com analysisRole !== none:')
console.log(JSON.stringify(agents, null, 2))
console.log(`\nTotal: ${agents.length} agentes`)
