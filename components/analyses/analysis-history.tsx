'use client'

/**
 * Analysis History Component
 * Display user's analysis history with filters
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  History,
  Eye,
  Calendar,
  Clock,
  Brain,
  Loader2,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react'

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

interface AnalysisHistoryProps {
  onViewAnalysis?: (analysis: Analysis) => void
}

export function AnalysisHistory({ onViewAnalysis }: AnalysisHistoryProps) {
  const [allAnalyses, setAllAnalyses] = useState<Analysis[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/analyses/history`)
      if (!response.ok) {
        throw new Error('Erro ao carregar histórico')
      }

      const data = await response.json()
      const loadedAnalyses = data.analyses || []
      setAllAnalyses(loadedAnalyses)
      setAnalyses(loadedAnalyses)
    } catch (err) {
      console.error('[ANALYSIS-HISTORY] Error loading history:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtra as análises no lado do cliente
  useEffect(() => {
    let results = allAnalyses

    if (selectedAgent) {
      results = results.filter(analysis => analysis.agentId === selectedAgent)
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      results = results.filter(analysis =>
        analysis.prompt?.toLowerCase().includes(searchLower) ||
        analysis.agentName?.toLowerCase().includes(searchLower) ||
        analysis.analysis?.toLowerCase().includes(searchLower)
      )
    }
    setAnalyses(results)
  }, [searchTerm, selectedAgent, allAnalyses])

  // Get unique agents for filtering
  const uniqueAgents = Array.from(
    new Set(allAnalyses.map(a => JSON.stringify({ id: a.agentId, name: a.agentName })))
  ).map(str => JSON.parse(str))

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Carregando histórico...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-12 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
        <div className="flex flex-col items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-8 w-8" />
          <p className="font-medium">Erro ao carregar histórico</p>
          <p className="text-sm">{error}</p>
          <Button variant="outline" onClick={loadHistory} className="mt-2">
            Tentar novamente
          </Button>
        </div>
      </Card>
    )
  }

  if (allAnalyses.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <History className="h-12 w-12" />
          <p className="text-lg font-medium">Nenhuma análise realizada</p>
          <p className="text-sm">Suas análises aparecerão aqui após serem geradas</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar análises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {uniqueAgents.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Agente:</span>
              <Button
                variant={selectedAgent === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedAgent(null)}
                className="h-8"
              >
                Todos
              </Button>
              {uniqueAgents.map((agent) => (
                <Button
                  key={agent.id}
                  variant={selectedAgent === agent.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAgent(agent.id)}
                  className="h-8"
                >
                  {agent.name}
                </Button>
              ))}
            </div>
          )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {analyses.length === allAnalyses.length
          ? `${allAnalyses.length} análise${allAnalyses.length !== 1 ? 's' : ''} encontrada${allAnalyses.length !== 1 ? 's' : ''}`
          : `Mostrando ${analyses.length} de ${allAnalyses.length} análises`}
      </div>

      {/* Analyses List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {analyses.map((analysis) => (
            <Card
              key={analysis.id}
              className="hover:shadow-md transition-all cursor-pointer hover:bg-accent"
              onClick={() => onViewAnalysis?.(analysis)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Brain className="h-4 w-4 text-primary flex-shrink-0" />
                  <CardTitle className="text-base truncate" title={analysis.agentName}>{analysis.agentName}</CardTitle>
                  {analysis.ragUsed && (
                    <Badge variant="secondary" className="text-xs">
                      RAG
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(analysis.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(analysis.createdAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  {analysis.processingTimeMs && (
                    <div className="flex items-center gap-1">
                      ⚡ {(analysis.processingTimeMs / 1000).toFixed(1)}s
                    </div>
                  )}

                  {analysis.tokensUsed && (
                    <div className="flex items-center gap-1">
                      🔤 {analysis.tokensUsed.toLocaleString()} tokens
                    </div>
                  )}

                  {analysis.documentIds && analysis.documentIds.length > 0 && (
                    <div className="flex items-center gap-1">
                      📄 {analysis.documentIds.length} documento{analysis.documentIds.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
