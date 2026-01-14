'use client'

/**
 * Recent Analyses Widget
 * Displays a compact list of recent analyses with view modal
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnalysisViewModal } from './analysis-view-modal'
import {
  Brain,
  Calendar,
  Eye,
  Loader2,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Analysis {
  id: string
  agentId: string
  agentName: string
  agentKey: string
  prompt: string
  analysis: string
  modelUsed: string
  tokensUsed: number | null
  processingTimeMs: number | null
  ragUsed: boolean
  documentIds: string[] | null
  createdAt: string
}

interface RecentAnalysesWidgetProps {
  limit?: number
  onAnalysesLoad?: (count: number) => void
  patientId?: string
}

export function RecentAnalysesWidget({ limit = 5, onAnalysesLoad, patientId }: RecentAnalysesWidgetProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const searchParams = useSearchParams()
  const openAnalysisId = searchParams.get('openAnalysis')
  const router = useRouter()

  useEffect(() => {
    loadAnalyses()
  }, [patientId])

  // Effect to handle opening analysis from URL param
  useEffect(() => {
    if (openAnalysisId && analyses.length > 0 && !isModalOpen) {
      const targetAnalysis = analyses.find(a => a.id === openAnalysisId)
      if (targetAnalysis) {
        setSelectedAnalysis(targetAnalysis)
        setIsModalOpen(true)
        // Optional: clear the param so refreshing doesn't re-open if closed? 
        // Or keep it to support sharing URLs. Keeping it is fine.
      }
    }
  }, [openAnalysisId, analyses, isModalOpen])

  const loadAnalyses = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const endpoint = patientId
        ? `/api/analyses/history?patientId=${patientId}&limit=${limit}`
        : `/api/analyses/history?limit=${limit}`

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Erro ao carregar análises')
      }

      const data = await response.json()
      const recentAnalyses = (data.analyses || []).slice(0, limit)
      setAnalyses(recentAnalyses)
      onAnalysesLoad?.(data.analyses?.length || 0)
    } catch (err) {
      console.error('Error loading analyses:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedAnalysis(null), 300)
  }

  const getAgentColor = (agentKey: string) => {
    const colors: Record<string, string> = {
      integrative: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      endocrinology: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      nutrition: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      exercise: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    }
    return colors[agentKey] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
  }

  const getAgentIcon = (agentKey: string) => {
    const icons: Record<string, string> = {
      integrative: '🧘',
      endocrinology: '⚕️',
      nutrition: '🥗',
      exercise: '💪',
    }
    return icons[agentKey] || '🤖'
  }

  const getAnalysisPreview = (analysisText: string, maxLength: number = 80) => {
    if (!analysisText) return 'Sem prévia disponível'
    const preview = analysisText.replace(/[#*_\n]/g, ' ').trim()
    return preview.length > maxLength
      ? preview.substring(0, maxLength) + '...'
      : preview
  }

  const formatProcessingTime = (ms: number | null) => {
    if (!ms) return null
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-teal-600" />
            Análises Recentes
          </CardTitle>
          <CardDescription>
            Histórico de análises realizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-teal-600" />
                <p className="text-sm text-muted-foreground">Carregando análises...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="h-8 w-8 mx-auto mb-3 text-red-500" />
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <Button onClick={loadAnalyses} variant="outline" size="sm">
                Tentar Novamente
              </Button>
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-muted-foreground mb-1 font-medium">
                Nenhuma análise realizada
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Faça sua primeira análise com um agente de IA
              </p>
              <Link href="/analyze">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Iniciar Análise
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto overflow-x-hidden">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-3 rounded-lg border border-border hover:border-teal-300 hover:bg-teal-50/50 transition-all dark:hover:bg-teal-900/20 cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon with agent color */}
                    <div className={`p-2 rounded-lg shrink-0 text-xl ${getAgentColor(analysis.agentKey)}`}>
                      {getAgentIcon(analysis.agentKey)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Title with badges */}
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-sm font-semibold text-foreground truncate flex-1 leading-tight group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors"
                          onClick={() => handleViewAnalysis(analysis)}
                        >
                          {analysis.agentName}
                        </p>
                        {analysis.ragUsed && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            <Sparkles className="h-3 w-3 mr-1" />
                            RAG
                          </Badge>
                        )}
                      </div>

                      {/* Analysis preview */}
                      <div className="text-xs text-muted-foreground italic line-clamp-2 leading-relaxed">
                        "{getAnalysisPreview(analysis.analysis)}"
                      </div>

                      {/* Metadata row */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(analysis.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                        {formatProcessingTime(analysis.processingTimeMs) && (
                          <>
                            <span>•</span>
                            <span>{formatProcessingTime(analysis.processingTimeMs)}</span>
                          </>
                        )}
                        {analysis.tokensUsed && (
                          <>
                            <span>•</span>
                            <span>{analysis.tokensUsed.toLocaleString()} tokens</span>
                          </>
                        )}
                      </div>

                      {/* Action button */}
                      <div className="pt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900/30"
                          onClick={() => handleViewAnalysis(analysis)}
                        >
                          <Eye className="h-3 w-3" />
                          Ver Completa
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* View All Link */}
              <div className="pt-2">
                <Link href="/analyze">
                  <Button
                    variant="outline"
                    className="w-full justify-between group"
                    size="sm"
                  >
                    Ver Todas as Análises
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis View Modal */}
      <AnalysisViewModal
        analysis={selectedAnalysis}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
