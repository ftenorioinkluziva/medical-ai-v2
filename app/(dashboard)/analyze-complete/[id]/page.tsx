/**
 * Complete Analysis Result Page
 * Displays the detailed results of a complete analysis.
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db/client'
import { completeAnalyses, analyses, healthAgents, recommendations, weeklyPlans } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { CompleteAnalysisResultView } from '@/components/complete-analysis/complete-analysis-result-view'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Resultado da Análise Completa | Medical AI',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CompleteAnalysisResultPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/analyze-complete')
  }

  // Unwrap params Promise (Next.js 15+)
  const { id } = await params

  try {
    // Fetch complete analysis
    const [completeAnalysis] = await db
      .select()
      .from(completeAnalyses)
      .where(eq(completeAnalyses.id, id))
      .limit(1)

    if (!completeAnalysis) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Análise Não Encontrada</AlertTitle>
            <AlertDescription>A análise solicitada não foi encontrada.</AlertDescription>
          </Alert>
        </div>
      )
    }

    // Verify ownership
    if (completeAnalysis.userId !== session.user.id) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acesso Negado</AlertTitle>
            <AlertDescription>Você não tem permissão para visualizar esta análise.</AlertDescription>
          </Alert>
        </div>
      )
    }

    // Fetch related analyses with agent info
    const analysisIds = (completeAnalysis.analysisIds || []) as string[]

    const relatedAnalyses = analysisIds.length > 0
      ? await db
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
            analysisRole: healthAgents.analysisRole,
            analysisOrder: healthAgents.analysisOrder,
          })
          .from(analyses)
          .innerJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
          .where(inArray(analyses.id, analysisIds))
      : []

    // Sort analyses: foundation first, then specialized, both ordered by analysisOrder
    const sortedAnalyses = relatedAnalyses.sort((a, b) => {
      // Foundation agents come before specialized
      if (a.analysisRole === 'foundation' && b.analysisRole === 'specialized') return -1
      if (a.analysisRole === 'specialized' && b.analysisRole === 'foundation') return 1
      // Within same role, order by analysisOrder
      return (a.analysisOrder || 0) - (b.analysisOrder || 0)
    })

    // Fetch recommendations if available
    let recommendationsData = null
    if (completeAnalysis.recommendationsId) {
      const [recs] = await db
        .select()
        .from(recommendations)
        .where(eq(recommendations.id, completeAnalysis.recommendationsId))
        .limit(1)

      if (recs) {
        recommendationsData = {
          id: recs.id,
          examRecommendations: recs.examRecommendations,
          lifestyleRecommendations: recs.lifestyleRecommendations,
          healthGoals: recs.healthGoals,
          alerts: recs.alerts,
          createdAt: recs.createdAt,
        }
      }
    }

    // Fetch weekly plan if available
    let weeklyPlanData = null
    if (completeAnalysis.weeklyPlanId) {
      const [plan] = await db
        .select()
        .from(weeklyPlans)
        .where(eq(weeklyPlans.id, completeAnalysis.weeklyPlanId))
        .limit(1)

      if (plan) {
        weeklyPlanData = {
          id: plan.id,
          weekStartDate: plan.weekStartDate,
          supplementationStrategy: plan.supplementationStrategy,
          shoppingList: plan.shoppingList,
          mealPlan: plan.mealPlan,
          workoutPlan: plan.workoutPlan,
          createdAt: plan.createdAt,
        }
      }
    }

    const analysisData = {
      id: completeAnalysis.id,
      documentIds: completeAnalysis.documentIds,
      status: completeAnalysis.status,
      synthesis: completeAnalysis.synthesis,
      errorMessage: completeAnalysis.errorMessage,
      createdAt: completeAnalysis.createdAt,
      completedAt: completeAnalysis.completedAt,
      analyses: sortedAnalyses, // Passing individual analyses sorted by role and order
      recommendations: recommendationsData,
      weeklyPlan: weeklyPlanData,
    }

    return (
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          <Suspense fallback={
            <div className="flex h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          }>
            <CompleteAnalysisResultView analysis={analysisData} />
          </Suspense>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching complete analysis:', error)

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Análise</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Ocorreu um erro ao carregar a análise.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }
}