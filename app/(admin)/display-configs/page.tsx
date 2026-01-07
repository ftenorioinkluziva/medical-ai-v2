import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DisplayConfigEditor } from '@/components/admin/display-configs/display-config-editor'

async function getDisplayConfigAgents() {
  const agents = await db.query.healthAgents.findMany({
    where: eq(healthAgents.agentType, 'product_generator'),
    orderBy: (healthAgents, { asc }) => [asc(healthAgents.displayOrder)],
  })
  return agents
}

export default async function DisplayConfigsAdminPage() {
  const agents = await getDisplayConfigAgents()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin: Display Config Editor</h1>
      <DisplayConfigEditor agents={agents} />
    </div>
  )
}
