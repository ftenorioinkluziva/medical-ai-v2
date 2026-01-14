/**
 * Dashboard Statistics API
 * Get aggregated stats for the dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { documents, analyses, healthAgents } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Support patientId for doctors
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const userId = patientId && session.user.role === 'doctor' ? patientId : session.user.id

    console.log(`📊 [DASHBOARD-API] Fetching stats for user: ${userId}${patientId ? ' (doctor view)' : ''}`)

    // Get documents count
    const [docsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(eq(documents.userId, userId))

    // Get analyses count
    const [analysesCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analyses)
      .where(eq(analyses.userId, userId))

    // Get recent documents (last 5)
    const recentDocuments = await db
      .select({
        id: documents.id,
        fileName: documents.fileName,
        documentType: documents.documentType,
        createdAt: documents.createdAt,
        structuredData: documents.structuredData,
      })
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt))
      .limit(5)

    // Get recent analyses (last 5)
    const recentAnalyses = await db
      .select({
        id: analyses.id,
        agentId: analyses.agentId,
        prompt: analyses.prompt,
        createdAt: analyses.createdAt,
      })
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.createdAt))
      .limit(5)

    // Get unique agents used
    const agentsUsed = await db
      .select({
        agentId: analyses.agentId,
      })
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .groupBy(analyses.agentId)

    // Extract health metrics from recent documents
    const healthMetrics: any[] = []
    const parameterTrends: Map<string, any[]> = new Map()

    recentDocuments.forEach((doc) => {
      if (!doc.structuredData?.modules) return

      doc.structuredData.modules.forEach((module: any) => {
        module.parameters?.forEach((param: any) => {
          // Track specific important parameters
          const importantParams = [
            'Glicose',
            'Hemoglobina',
            'Colesterol Total',
            'HDL',
            'LDL',
            'Triglicerídeos',
            'Creatinina',
            'Ureia',
          ]

          if (importantParams.includes(param.name)) {
            if (!parameterTrends.has(param.name)) {
              parameterTrends.set(param.name, [])
            }

            const value = parseFloat(param.value)
            if (!isNaN(value)) {
              parameterTrends.get(param.name)!.push({
                date: doc.createdAt,
                value: value,
                unit: param.unit,
                status: param.status,
                referenceRange: param.referenceRange,
              })
            }
          }

          // Collect abnormal values for alerts
          if (param.status && param.status !== 'Normal') {
            healthMetrics.push({
              documentId: doc.id,
              documentName: doc.fileName,
              parameter: param.name,
              value: param.value,
              unit: param.unit,
              status: param.status,
              date: doc.createdAt,
            })
          }
        })
      })
    })

    // Sort trends by date
    parameterTrends.forEach((trends) => {
      trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })

    // Calculate last activity
    const lastActivity = (() => {
      const allActivities = [
        ...recentDocuments.map(d => ({ date: d.createdAt, type: 'document' })),
        ...recentAnalyses.map(a => ({ date: a.createdAt, type: 'analysis' }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return allActivities[0] || null
    })()

    const stats = {
      documentsCount: docsCount.count || 0,
      analysesCount: analysesCount.count || 0,
      agentsUsedCount: agentsUsed.length || 0,
      abnormalParametersCount: healthMetrics.length || 0,
      lastActivity,
      recentDocuments,
      recentAnalyses,
      healthMetrics,
      parameterTrends: Object.fromEntries(parameterTrends),
    }

    console.log(`✅ [DASHBOARD-API] Stats: ${stats.documentsCount} docs, ${stats.analysesCount} analyses`)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('❌ [DASHBOARD-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
