
import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requirePermission } from '@/lib/auth/session'

interface AgentUpdate {
    id: string
    analysisRole: 'foundation' | 'specialized' | 'none'
    analysisOrder: number | null
    isActive: boolean
    contextConfig?: {
        includeMedicalProfile: boolean
        includeDocuments: boolean
        includeStructuredData: boolean
        includeRagContext: boolean
        includePreviousAnalysis: boolean
    }
}

export async function POST(req: Request) {
    try {
        // 1. Check permissions
        await requirePermission('manage_agents')

        const body = await req.json()
        const { updates } = body as { updates: AgentUpdate[] }

        if (!Array.isArray(updates) || updates.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No updates provided' },
                { status: 400 }
            )
        }

        console.log(`[WORKFLOW-UPDATE] Processing ${updates.length} updates...`)

        // 2. Process all updates in a transaction (simulated with Promise.all for now as Drizzle txn syntax varies)
        // Ideally use db.transaction() but simplicity first
        await Promise.all(
            updates.map(async (update) => {
                await db
                    .update(healthAgents)
                    .set({
                        analysisRole: update.analysisRole,
                        analysisOrder: update.analysisOrder,
                        isActive: update.isActive,
                        contextConfig: update.contextConfig || undefined, // Only update if provided
                        updatedAt: new Date(),
                    })
                    .where(eq(healthAgents.id, update.id))
            })
        )

        console.log(`[WORKFLOW-UPDATE] Successfully updated ${updates.length} agents`)

        return NextResponse.json({ success: true, count: updates.length })
    } catch (error) {
        console.error('Error updating workflow agents:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update agents' },
            { status: 500 }
        )
    }
}
