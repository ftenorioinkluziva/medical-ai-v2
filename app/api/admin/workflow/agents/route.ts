
import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { healthAgents } from '@/lib/db/schema'
import { eq, asc, inArray } from 'drizzle-orm'
import { requirePermission } from '@/lib/auth/session'

export async function GET() {
    try {
        // 1. Check permissions
        await requirePermission('manage_agents')

        // 2. Fetch all analysis agents sorted by order
        const agents = await db
            .select()
            .from(healthAgents)
            .where(inArray(healthAgents.agentType, ['analysis', 'product_generator']))
            .orderBy(asc(healthAgents.analysisOrder))

        return NextResponse.json({ success: true, agents })
    } catch (error) {
        console.error('Error fetching workflow agents:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch agents' },
            { status: 500 }
        )
    }
}
