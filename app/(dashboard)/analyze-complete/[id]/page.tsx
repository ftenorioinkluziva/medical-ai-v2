/**
 * Complete Analysis Results Page
 * Display full results of multi-agent analysis
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { CompleteAnalysisResults } from '@/components/complete-analysis/complete-analysis-results'

export const metadata: Metadata = {
  title: 'Resultados da Análise Completa | Medical AI',
  description: 'Resultados integrados da análise multi-especialista',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CompleteAnalysisResultsPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/analyze-complete')
  }

  // Unwrap params Promise (Next.js 15+)
  const { id } = await params

  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={<div>Carregando resultados...</div>}>
        <CompleteAnalysisResults analysisId={id} />
      </Suspense>
    </div>
  )
}
