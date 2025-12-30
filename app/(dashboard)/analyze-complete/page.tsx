/**
 * Complete Analysis Page
 * Multi-agent comprehensive analysis workflow
 */

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { Metadata } from 'next'
import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { CompleteAnalysisView } from '@/components/complete-analysis/complete-analysis-view'

export const metadata: Metadata = {
  title: 'Análise Completa | Medical AI',
  description: 'Análise médica multi-especialista integrada',
}

export default async function CompleteAnalysisPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/analyze-complete')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise Completa</h1>
          <p className="text-muted-foreground mt-2">
            Análise médica integrada por múltiplos especialistas
          </p>
        </div>

        {/* Main Content */}
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Carregando análise completa...</p>
            </div>
          }
        >
          <CompleteAnalysisView userId={session.user.id} />
        </Suspense>
      </div>
    </div>
  )
}
