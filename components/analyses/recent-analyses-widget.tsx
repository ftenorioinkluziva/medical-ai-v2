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

  useEffect(() => {
    loadAnalyses()
  }, [patientId])

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
      integrative: 'bg-green-100 text-green-700',
      endocrinology: 'bg-purple-100 text-purple-700',
      nutrition: 'bg-orange-100 text-orange-700',
      exercise: 'bg-blue-100 text-blue-700',
    }
    return colors[agentKey] || 'bg-accent text-foreground'
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
            <div className="space-y-3 max-h-[200px] overflow-y-auto overflow-x-hidden">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-2.5 sm:p-3 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors dark:border-gray-700 dark:hover:bg-teal-900/30 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 sm:p-2 rounded ${getAgentColor(analysis.agentKey)}`}>
                        <Brain className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {analysis.agentName}
                          </p>
                          {analysis.ragUsed && (
                            <Badge variant="secondary" className="text-xs">
                              RAG
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {analysis.prompt}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(analysis.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewAnalysis(analysis)}
                      className="shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
