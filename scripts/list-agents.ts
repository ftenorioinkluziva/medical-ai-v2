import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'

async function listAgents() {
  const agents = await db
    .select({
      agentKey: healthAgents.agentKey,
      name: healthAgents.name,
      title: healthAgents.title,
    })
    .from(healthAgents)

  console.log('=== AGENTES DISPONÍVEIS ===\n')
  agents.forEach(a => {
    console.log(`- ${a.agentKey}: ${a.name} (${a.title})`)
  })
  console.log(`\nTotal: ${agents.length} agentes`)
}

listAgents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
