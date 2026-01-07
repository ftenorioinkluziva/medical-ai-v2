'use server'

import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import type { DisplayConfig } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/session'

export async function updateDisplayConfig(agentId: string, displayConfig: DisplayConfig) {
  await requirePermission('manage_agents')

  try {
    await db.update(healthAgents)
      .set({ displayConfig: displayConfig })
      .where(eq(healthAgents.id, agentId))

    revalidatePath('/admin/display-configs')

    return { success: true }
  } catch (error) {
    console.error('Error updating display config:', error)
    return { success: false, message: 'Failed to update display config.' }
  }
}
