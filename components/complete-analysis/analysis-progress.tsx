'use client'

/**
 * Analysis Progress
 * Shows real-time progress of complete analysis
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface AnalysisProgressProps {
  analysisId: string
}

const STATUS_INFO = {
  pending: {
    label: 'Aguardando',
    progress: 0,
    description: 'Preparando análise...',
    color: 'bg-gray-500',
  },
  analyzing_integrative: {
    label: 'Medicina Integrativa',
    progress: 20,
    description: 'Analisando com especialista em Medicina Integrativa...',
    color: 'bg-green-500',
  },
  analyzing_specialized: {
    label: 'Análises Especializadas',
    progress: 50,
    description: 'Nutrição e Fisiologia do Exercício em análise...',
    color: 'bg-blue-500',
  },
  generating_synthesis: {
    label: 'Síntese Consolidada',
    progress: 70,
    description: 'Integrando análises dos especialistas...',
    color: 'bg-purple-500',
  },
  generating_products: {
    label: 'Finalizando',
    progress: 90,
    description: 'Gerando recomendações e plano semanal...',
    color: 'bg-orange-500',
  },
  completed: {
    label: 'Concluído',
    progress: 100,
    description: 'Análise completa finalizada com sucesso!',
    color: 'bg-green-600',
  },
  failed: {
    label: 'Erro',
    progress: 0,
    description: 'Ocorreu um erro durante a análise',
    color: 'bg-red-500',
  },
}

export function AnalysisProgress({ analysisId }: AnalysisProgressProps) {
  const [status, setStatus] = useState<keyof typeof STATUS_INFO>('pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const pollStatus = setInterval(async () => {
      try {
        const response = await fetch(`/api/analyses/complete/${analysisId}`)
        const data = await response.json()

        if (data.success) {
          setStatus(data.completeAnalysis.status)
          setError(data.completeAnalysis.errorMessage)

          // Stop polling when completed or failed
          if (data.completeAnalysis.status === 'completed' || data.completeAnalysis.status === 'failed') {
            clearInterval(pollStatus)

            // Redirect to results page when completed
            if (data.completeAnalysis.status === 'completed') {
              setTimeout(() => {
                window.location.href = `/analyze-complete/${analysisId}`
              }, 2000)
            }
          }
        }
      } catch (error) {
        console.error('Error polling status:', error)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollStatus)
  }, [analysisId])

  const statusInfo = STATUS_INFO[status]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === 'completed' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : status === 'failed' ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
          )}
          Progresso da Análise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <Badge className={`${statusInfo.color} text-white`}>
            {statusInfo.label}
          </Badge>
          <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={statusInfo.progress} className="h-2" />
          <p className="text-xs text-right text-muted-foreground">
            {statusInfo.progress}%
          </p>
        </div>

        {/* Error Message */}
        {error && status === 'failed' && (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <p className="text-sm text-red-900 font-medium">Erro:</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {status === 'completed' && (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <p className="text-sm text-green-900 font-medium">
              ✅ Análise concluída com sucesso!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Redirecionando para os resultados...
            </p>
          </div>
        )}

        {/* Steps Timeline */}
        <div className="space-y-3 pt-4 border-t">
          <p className="text-sm font-medium">Etapas:</p>
          {[
            { key: 'analyzing_integrative', label: 'Medicina Integrativa' },
            { key: 'analyzing_specialized', label: 'Nutrição e Exercício' },
            { key: 'generating_synthesis', label: 'Síntese Consolidada' },
            { key: 'generating_products', label: 'Recomendações e Plano' },
          ].map((step) => {
            const stepStatus = STATUS_INFO[step.key as keyof typeof STATUS_INFO]
            const isCompleted = stepStatus.progress <= statusInfo.progress
            const isCurrent = status === step.key

            return (
              <div key={step.key} className="flex items-center gap-3">
                <div
                  className={`
                    h-2 w-2 rounded-full
                    ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-purple-500 animate-pulse' : 'bg-gray-300'}
                  `}
                />
                <p
                  className={`
                    text-sm
                    ${isCompleted ? 'text-green-700 font-medium' : isCurrent ? 'text-purple-700 font-medium' : 'text-muted-foreground'}
                  `}
                >
                  {step.label}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
