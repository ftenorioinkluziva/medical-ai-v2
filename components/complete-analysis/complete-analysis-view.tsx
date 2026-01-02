'use client'

/**
 * Complete Analysis View
 * Main component for multi-agent analysis workflow
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentSelector } from './document-selector'
import { AnalysisProgress } from './analysis-progress'
import { CompleteAnalysesList } from './complete-analyses-list'
import { toast } from 'sonner'
import { Loader2, Sparkles, FileText, History } from 'lucide-react'

interface HealthAgent {
  id: string
  name: string
  title: string
  description: string
  color: string
  analysisRole: 'foundation' | 'specialized' | 'none'
  analysisOrder: number | null
}

interface CompleteAnalysisViewProps {
  userId: string
}

export function CompleteAnalysisView({ userId }: CompleteAnalysisViewProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [agents, setAgents] = useState<HealthAgent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)

  // Fetch agents that participate in complete analysis
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents')
        if (!response.ok) throw new Error('Failed to fetch agents')

        const data = await response.json()

        // API already returns only active agents that participate in complete analysis, sorted by role and order
        setAgents(data.agents || [])
      } catch (error) {
        console.error('Error fetching agents:', error)
        toast.error('Erro ao carregar agentes')
      } finally {
        setLoadingAgents(false)
      }
    }

    fetchAgents()
  }, [])

  const handleStartAnalysis = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('Selecione pelo menos um documento')
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/analyses/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds: selectedDocuments,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao iniciar análise')
      }

      setCurrentAnalysisId(data.completeAnalysis.id)

      toast.success('Análise completa iniciada!', {
        description: 'Aguarde enquanto processamos seus documentos',
      })

      // Refresh the list after completion
      setTimeout(() => {
        setRefreshKey(prev => prev + 1)
        setSelectedDocuments([])
        setCurrentAnalysisId(null)
      }, 60000) // Estimativa de 60s para completar
    } catch (error) {
      console.error('Error starting analysis:', error)
      toast.error('Erro ao iniciar análise', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Tabs defaultValue="new" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-muted">
        <TabsTrigger value="new" className="gap-2 data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white">
          <Sparkles className="h-4 w-4" />
          Nova Análise
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-2 data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white">
          <History className="h-4 w-4" />
          Histórico
        </TabsTrigger>
      </TabsList>

      {/* Nova Análise */}
      <TabsContent value="new" className="space-y-6 mt-6">
        {/* Informações sobre a análise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Análise Médica Completa
            </CardTitle>
            <CardDescription>
              {loadingAgents ? (
                'Carregando informações dos agentes...'
              ) : agents.length === 0 ? (
                'Nenhum agente configurado para análise completa'
              ) : (
                `Análise integrada por ${agents.length} especialista${agents.length > 1 ? 's' : ''}: ${agents.map(a => a.name).join(', ')}`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAgents ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse bg-muted/20">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p>Nenhum agente configurado para análise completa.</p>
                <p className="text-sm mt-2">Configure agentes no painel administrativo.</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${agents.length === 1 ? 'md:grid-cols-1' : agents.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                {agents.map((agent, index) => {
                  const colorClasses = {
                    green: {
                      border: 'border-green-200 dark:border-green-800',
                      bg: 'bg-green-50/50 dark:bg-green-950/20',
                      title: 'text-green-900 dark:text-green-200',
                      text: 'text-green-700 dark:text-green-400',
                    },
                    purple: {
                      border: 'border-purple-200 dark:border-purple-800',
                      bg: 'bg-purple-50/50 dark:bg-purple-950/20',
                      title: 'text-purple-900 dark:text-purple-200',
                      text: 'text-purple-700 dark:text-purple-400',
                    },
                    orange: {
                      border: 'border-orange-200 dark:border-orange-800',
                      bg: 'bg-orange-50/50 dark:bg-orange-950/20',
                      title: 'text-orange-900 dark:text-orange-200',
                      text: 'text-orange-700 dark:text-orange-400',
                    },
                    blue: {
                      border: 'border-blue-200 dark:border-blue-800',
                      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
                      title: 'text-blue-900 dark:text-blue-200',
                      text: 'text-blue-700 dark:text-blue-400',
                    },
                    red: {
                      border: 'border-red-200 dark:border-red-800',
                      bg: 'bg-red-50/50 dark:bg-red-950/20',
                      title: 'text-red-900 dark:text-red-200',
                      text: 'text-red-700 dark:text-red-400',
                    },
                    yellow: {
                      border: 'border-yellow-200 dark:border-yellow-800',
                      bg: 'bg-yellow-50/50 dark:bg-yellow-950/20',
                      title: 'text-yellow-900 dark:text-yellow-200',
                      text: 'text-yellow-700 dark:text-yellow-400',
                    },
                  }

                  const colors = colorClasses[agent.color as keyof typeof colorClasses] || colorClasses.blue
                  const roleLabel = agent.analysisRole === 'foundation' ? 'Fundação' : 'Especializado'

                  return (
                    <div
                      key={agent.id}
                      className={`p-4 border rounded-lg ${colors.border} ${colors.bg}`}
                    >
                      <h3 className={`font-semibold ${colors.title} mb-2`}>
                        {index + 1}. {agent.name}
                        <span className="text-xs ml-2 opacity-70">({roleLabel})</span>
                      </h3>
                      <p className={`text-sm ${colors.text}`}>
                        {agent.title}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-4 p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-950/20">
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">✨ Resultados Integrados</h3>
              <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                <li>• Síntese consolidada de todas as análises</li>
                <li>• Recomendações integradas sem repetição</li>
                <li>• Plano semanal consistente e acionável</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Selecione os Documentos
            </CardTitle>
            <CardDescription>
              Escolha um ou mais documentos médicos para análise completa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentSelector
              selectedDocuments={selectedDocuments}
              onSelectionChange={setSelectedDocuments}
              disabled={isAnalyzing}
            />

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedDocuments.length > 0
                  ? `${selectedDocuments.length} documento${selectedDocuments.length > 1 ? 's' : ''} selecionado${selectedDocuments.length > 1 ? 's' : ''}`
                  : 'Nenhum documento selecionado'}
              </p>
              <Button
                size="lg"
                onClick={handleStartAnalysis}
                disabled={selectedDocuments.length === 0 || isAnalyzing}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Iniciar Análise Completa
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progresso da Análise Atual */}
        {currentAnalysisId && (
          <AnalysisProgress analysisId={currentAnalysisId} />
        )}
      </TabsContent>

      {/* Histórico */}
      <TabsContent value="history" className="mt-6">
        <CompleteAnalysesList key={refreshKey} />
      </TabsContent>
    </Tabs>
  )
}
