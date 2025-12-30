'use client'

/**
 * Recommendations History Page
 * Shows all recommendations generated for the user
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Loader2,
  ArrowLeft,
  Lightbulb,
  Activity,
  Target,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Stethoscope,
  RefreshCw,
  ClipboardList,
} from 'lucide-react'

interface RecommendationHistory {
  id: string
  analysisId: string
  examRecommendations: any[]
  lifestyleRecommendations: any[]
  healthGoals: any[]
  alerts: any[]
  createdAt: string
  analysisDate: string
  agentName: string
  agentTitle: string
  agentColor: string
}

export default function RecommendationsHistoryPage() {
  const [recommendations, setRecommendations] = useState<RecommendationHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRec, setSelectedRec] = useState<RecommendationHistory | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/recommendations/history')
      if (!response.ok) {
        throw new Error('Erro ao carregar histórico')
      }

      const data = await response.json()
      setRecommendations(data.recommendations || [])

      // Select first recommendation by default
      if (data.recommendations && data.recommendations.length > 0) {
        setSelectedRec(data.recommendations[0])
      }
    } catch (err) {
      console.error('Error loading history:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateFromLatestAnalysis = async () => {
    try {
      setIsGenerating(true)

      // Get latest analysis
      const analysisResponse = await fetch('/api/analyses/history')
      if (!analysisResponse.ok) {
        throw new Error('Nenhuma análise encontrada')
      }

      const analysisData = await analysisResponse.json()
      if (!analysisData.analyses || analysisData.analyses.length === 0) {
        throw new Error('Nenhuma análise encontrada. Faça uma análise primeiro.')
      }

      const latestAnalysis = analysisData.analyses[0]

      // Generate recommendations
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: latestAnalysis.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar recomendações')
      }

      toast.success('Recomendações geradas com sucesso!')
      await loadHistory() // Reload history
    } catch (error) {
      console.error('Error generating recommendations:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar recomendações')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exercise':
        return <Activity className="h-4 w-4" />
      case 'nutrition':
        return <Target className="h-4 w-4" />
      default:
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Card>
          <CardContent className="p-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma recomendação encontrada</h3>
            <p className="text-muted-foreground mb-6">
              Gere recomendações a partir da sua última análise ou realize uma nova análise médica
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleGenerateFromLatestAnalysis} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Gerar da Última Análise
                  </>
                )}
              </Button>
              <Link href="/analyze">
                <Button variant="outline">Fazer Nova Análise</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Histórico de Recomendações</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {recommendations.length} recomendação(ões) encontrada(s)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - List of recommendations */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="font-semibold text-sm text-muted-foreground">
            Histórico de Recomendações
          </h2>
          <Select
            value={selectedRec?.id}
            onValueChange={(id) => {
              const rec = recommendations.find((r) => r.id === id)
              if (rec) setSelectedRec(rec)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma recomendação..." />
            </SelectTrigger>
            <SelectContent>
              {recommendations.map((rec) => (
                <SelectItem key={rec.id} value={rec.id}>
                  <div className="flex items-center gap-3 py-1">
                    <Stethoscope className="h-4 w-4 flex-shrink-0" style={{ color: rec.agentColor }} />
                    <div className="flex flex-col">
                      <span className="font-medium">{rec.agentName}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(rec.analysisDate)}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right content - Selected recommendation details */}
        <div className="lg:col-span-2">
          {selectedRec && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      Recomendações Personalizadas
                    </CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" style={{ color: selectedRec.agentColor }} />
                        <span>{selectedRec.agentTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3" />
                        <span>Análise: {formatDate(selectedRec.analysisDate)}</span>
                      </div>
                      <div className="text-xs opacity-70">
                        Gerado em: {formatDate(selectedRec.createdAt)}
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="exams" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-muted">
                    <TabsTrigger value="exams" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-sky-600 dark:data-[state=active]:!bg-sky-500 data-[state=active]:!text-white">
                      <ClipboardList className="h-4 w-4" />
                      <span className="hidden sm:inline">Exames</span>
                      <span className="sm:hidden">({selectedRec.examRecommendations.length})</span>
                      <span className="hidden sm:inline">({selectedRec.examRecommendations.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="lifestyle" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white">
                      <Activity className="h-4 w-4" />
                      <span className="hidden sm:inline">Lifestyle</span>
                      <span className="sm:hidden">({selectedRec.lifestyleRecommendations.length})</span>
                      <span className="hidden sm:inline">({selectedRec.lifestyleRecommendations.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="goals" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-purple-600 dark:data-[state=active]:!bg-purple-500 data-[state=active]:!text-white">
                      <Target className="h-4 w-4" />
                      <span className="hidden sm:inline">Metas</span>
                      <span className="sm:hidden">({selectedRec.healthGoals.length})</span>
                      <span className="hidden sm:inline">({selectedRec.healthGoals.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-amber-600 dark:data-[state=active]:!bg-amber-500 data-[state=active]:!text-white">
                      <AlertCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Alertas</span>
                      <span className="sm:hidden">({selectedRec.alerts.length})</span>
                      <span className="hidden sm:inline">({selectedRec.alerts.length})</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Exams Tab */}
                  <TabsContent value="exams" className="mt-6 space-y-3">
                    {selectedRec.examRecommendations.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum exame recomendado
                      </p>
                    ) : (
                      selectedRec.examRecommendations.map((exam: any, index: number) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-2 transition-colors hover:border-sky-300 hover:bg-sky-50/30 dark:hover:border-sky-700 dark:hover:bg-sky-900/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium">{exam.exam}</h4>
                            <Badge variant={getUrgencyColor(exam.urgency)}>
                              {exam.urgency === 'high' ? 'Alta' : exam.urgency === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{exam.reason}</p>
                          <div className="text-xs text-muted-foreground pt-2 border-t mt-2">
                            Prazo sugerido: {exam.suggestedTimeframe}
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Lifestyle Tab */}
                  <TabsContent value="lifestyle" className="mt-6 space-y-3">
                    {selectedRec.lifestyleRecommendations.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma recomendação de lifestyle
                      </p>
                    ) : (
                      selectedRec.lifestyleRecommendations.map((lifestyle: any, index: number) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-2 transition-colors hover:border-teal-300 hover:bg-teal-50/30 dark:hover:border-teal-700 dark:hover:bg-teal-900/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(lifestyle.category)}
                              <h4 className="font-medium capitalize">{lifestyle.category}</h4>
                            </div>
                            <Badge variant={getPriorityColor(lifestyle.priority)}>
                              {lifestyle.priority === 'high' ? 'Alta' : lifestyle.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                          </div>
                          <p className="text-sm">{lifestyle.recommendation}</p>
                          <div className="text-xs text-muted-foreground pt-2 border-t mt-2">
                            <strong>Benefício esperado:</strong> {lifestyle.expectedBenefit}
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Goals Tab */}
                  <TabsContent value="goals" className="mt-6 space-y-3">
                    {selectedRec.healthGoals.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma meta de saúde definida
                      </p>
                    ) : (
                      selectedRec.healthGoals.map((goal: any, index: number) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-3 transition-colors hover:border-purple-300 hover:bg-purple-50/30 dark:hover:border-purple-700 dark:hover:bg-purple-900/30"
                        >
                          <h4 className="font-medium">{goal.goal}</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Status Atual</p>
                              <p className="font-medium">{goal.currentStatus}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Meta</p>
                              <p className="font-medium">{goal.targetValue}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-2">Prazo: {goal.timeframe}</p>
                          </div>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium mb-2">Passos de Ação:</p>
                            <ul className="space-y-1">
                              {goal.actionSteps.map((step: string, stepIndex: number) => (
                                <li key={stepIndex} className="text-sm flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Alerts Tab */}
                  <TabsContent value="alerts" className="mt-6 space-y-3">
                    {selectedRec.alerts.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum alerta
                      </p>
                    ) : (
                      selectedRec.alerts.map((alert: any, index: number) => {
                        const alertConfig = {
                          urgent: {
                            bg: 'bg-red-50 dark:bg-red-950/20',
                            border: 'border-red-200 dark:border-red-800',
                            iconColor: 'text-red-600 dark:text-red-400',
                            hover: 'hover:border-red-300 hover:bg-red-50/30 dark:hover:border-red-700 dark:hover:bg-red-900/30',
                          },
                          warning: {
                            bg: 'bg-yellow-50 dark:bg-yellow-950/20',
                            border: 'border-yellow-200 dark:border-yellow-800',
                            iconColor: 'text-yellow-600 dark:text-yellow-400',
                            hover: 'hover:border-yellow-300 hover:bg-yellow-50/30 dark:hover:border-yellow-700 dark:hover:bg-yellow-900/30',
                          },
                          info: {
                            bg: 'bg-blue-50 dark:bg-blue-950/20',
                            border: 'border-blue-200 dark:border-blue-800',
                            iconColor: 'text-blue-600 dark:text-blue-400',
                            hover: 'hover:border-blue-300 hover:bg-blue-50/30 dark:hover:border-blue-700 dark:hover:bg-blue-900/30',
                          },
                        }[alert.type]

                        return (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 space-y-2 transition-colors ${alertConfig.bg} ${alertConfig.border} ${alertConfig.hover}`}
                          >
                            <div className="flex items-start gap-2">
                              <AlertCircle className={`h-5 w-5 flex-shrink-0 ${alertConfig.iconColor}`} />
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="font-medium text-sm">{alert.message}</p>
                                  <Badge variant={getAlertColor(alert.type)}>
                                    {alert.type === 'urgent' ? 'Urgente' : alert.type === 'warning' ? 'Atenção' : 'Info'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  <strong>Ação recomendada:</strong> {alert.action}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </TabsContent>
                </Tabs>

                {/* Disclaimer */}
                <Card className="mt-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <p className="text-xs text-amber-900 dark:text-amber-100">
                      <strong>⚠️ Aviso Importante:</strong> Estas recomendações são educacionais
                      e <strong>NÃO substituem consulta médica profissional</strong>. Sempre consulte um profissional
                      de saúde qualificado.
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
