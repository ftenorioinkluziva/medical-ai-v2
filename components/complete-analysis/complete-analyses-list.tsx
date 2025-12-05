'use client'

/**
 * Complete Analyses List
 * Shows history of complete analyses
 */

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Analysis {
  id: string
  documentIds: string[]
  status: string
  createdAt: string
  completedAt: string | null
  synthesis: {
    executiveSummary: string
    keyFindings: string[]
  } | null
}

export function CompleteAnalysesList() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      const response = await fetch('/api/analyses/complete')
      const data = await response.json()

      if (data.success) {
        setAnalyses(data.analyses)
      }
    } catch (error) {
      console.error('Error loading analyses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma análise realizada</h3>
            <p className="text-sm text-muted-foreground">
              Inicie sua primeira análise completa na aba "Nova Análise"
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {analyses.map((analysis) => {
        const statusConfig = {
          completed: {
            icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
            badge: <Badge className="bg-green-100 text-green-700">Concluída</Badge>,
          },
          failed: {
            icon: <XCircle className="h-5 w-5 text-red-600" />,
            badge: <Badge className="bg-red-100 text-red-700">Erro</Badge>,
          },
          pending: {
            icon: <Clock className="h-5 w-5 text-gray-600" />,
            badge: <Badge variant="outline">Aguardando</Badge>,
          },
          analyzing_integrative: {
            icon: <Loader2 className="h-5 w-5 animate-spin text-purple-600" />,
            badge: <Badge className="bg-purple-100 text-purple-700">Em andamento</Badge>,
          },
          analyzing_specialized: {
            icon: <Loader2 className="h-5 w-5 animate-spin text-purple-600" />,
            badge: <Badge className="bg-purple-100 text-purple-700">Em andamento</Badge>,
          },
          generating_synthesis: {
            icon: <Loader2 className="h-5 w-5 animate-spin text-purple-600" />,
            badge: <Badge className="bg-purple-100 text-purple-700">Em andamento</Badge>,
          },
          generating_products: {
            icon: <Loader2 className="h-5 w-5 animate-spin text-purple-600" />,
            badge: <Badge className="bg-purple-100 text-purple-700">Em andamento</Badge>,
          },
        }

        const config = statusConfig[analysis.status as keyof typeof statusConfig] || statusConfig.pending

        return (
          <Card key={analysis.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                {/* Left side - Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    {config.icon}
                    <div>
                      <h3 className="font-semibold">
                        Análise Completa
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(analysis.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Executive Summary Preview */}
                  {analysis.synthesis?.executiveSummary && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {analysis.synthesis.executiveSummary}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {analysis.documentIds.length} documento{analysis.documentIds.length > 1 ? 's' : ''}
                    </span>
                    {analysis.completedAt && (
                      <span>
                        Concluída em {format(new Date(analysis.completedAt), "dd/MM/yyyy 'às' HH:mm")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex flex-col items-end gap-3">
                  {config.badge}

                  {analysis.status === 'completed' && (
                    <Link href={`/analyze-complete/${analysis.id}`}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Ver Resultados
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
