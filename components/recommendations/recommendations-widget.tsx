'use client'

/**
 * Recommendations Widget - Minimal Health Design
 * Display personalized health recommendations
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Lightbulb,
  Loader2,
  AlertCircle,
  Target,
  Activity,
  ClipboardList,
  CheckCircle2,
  Calendar,
  TrendingUp,
  History,
} from 'lucide-react'

interface ExamRecommendation {
  exam: string
  reason: string
  urgency: 'high' | 'medium' | 'low'
  suggestedTimeframe: string
}

interface LifestyleRecommendation {
  category: 'exercise' | 'nutrition' | 'sleep' | 'stress' | 'hydration' | 'habits'
  recommendation: string
  priority: 'high' | 'medium' | 'low'
  expectedBenefit: string
}

interface HealthGoal {
  goal: string
  currentStatus: string
  targetValue: string
  timeframe: string
  actionSteps: string[]
}

interface Alert {
  type: 'urgent' | 'warning' | 'info'
  message: string
  action: string
}

interface Recommendations {
  examRecommendations: ExamRecommendation[]
  lifestyleRecommendations: LifestyleRecommendation[]
  healthGoals: HealthGoal[]
  alerts: Alert[]
}

interface RecommendationsWidgetProps {
  patientId?: string
}

export function RecommendationsWidget({ patientId }: RecommendationsWidgetProps = {}) {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [analysisDate, setAnalysisDate] = useState<string | null>(null)

  useEffect(() => {
    loadRecommendations()
  }, [patientId])

  const loadRecommendations = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const endpoint = patientId
        ? `/api/recommendations?patientId=${patientId}`
        : '/api/recommendations'

      const response = await fetch(endpoint)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao carregar recomendações')
      }

      const data = await response.json()
      setRecommendations(data.recommendations)
      setGeneratedAt(data.generatedAt)
      setAnalysisDate(data.analysisDate)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'

      // Only log to console if it's an unexpected error (not the "no recommendations" case)
      if (!errorMessage.includes('Nenhuma recomendação encontrada') &&
          !errorMessage.includes('Realize uma análise médica primeiro')) {
        console.error('Error loading recommendations:', err)
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
            <p className="text-muted-foreground">Gerando recomendações personalizadas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !recommendations) {
    const isNoAnalysis = error && (
      error.includes('Nenhuma análise encontrada') ||
      error.includes('Nenhuma recomendação encontrada') ||
      error.includes('Realize uma análise médica primeiro')
    )

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${isNoAnalysis ? 'bg-sky-50 border-sky-200' : 'bg-red-50 border-red-200'}`}>
            <div className={`p-2 rounded-lg shrink-0 ${isNoAnalysis ? 'bg-sky-100' : 'bg-red-100'}`}>
              <AlertCircle className={`h-5 w-5 ${isNoAnalysis ? 'text-sky-600' : 'text-red-600'}`} />
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${isNoAnalysis ? 'text-sky-900' : 'text-red-900'}`}>
                {isNoAnalysis ? 'Nenhuma análise disponível' : 'Erro ao carregar recomendações'}
              </p>
              <p className={`text-sm mt-1 ${isNoAnalysis ? 'text-sky-700' : 'text-red-700'}`}>
                {isNoAnalysis
                  ? 'Realize uma análise médica primeiro para receber recomendações personalizadas.'
                  : error || 'Ocorreu um erro ao carregar as recomendações.'
                }
              </p>
            </div>
            <Button
              onClick={loadRecommendations}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Recomendações Personalizadas
            </CardTitle>
            <CardDescription>
              Baseadas na sua última análise médica
              {analysisDate && (
                <span className="block mt-1 text-xs">
                  Análise de: {formatDate(analysisDate)}
                </span>
              )}
              {generatedAt && (
                <span className="block mt-1 text-xs opacity-70">
                  Recomendações geradas em: {formatDate(generatedAt)}
                </span>
              )}
            </CardDescription>
          </div>
          <Link href="/recommendations">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <History className="h-4 w-4" />
              Histórico
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="exams" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="exams" className="gap-2 data-[state=active]:!bg-sky-600 dark:data-[state=active]:!bg-sky-500 data-[state=active]:!text-white dark:data-[state=active]:!text-white">
              Exames ({recommendations.examRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="gap-2 data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white dark:data-[state=active]:!text-white">
              Lifestyle ({recommendations.lifestyleRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2 data-[state=active]:!bg-purple-600 dark:data-[state=active]:!bg-purple-500 data-[state=active]:!text-white dark:data-[state=active]:!text-white">
              Metas ({recommendations.healthGoals.length})
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2 data-[state=active]:!bg-amber-600 dark:data-[state=active]:!bg-amber-500 data-[state=active]:!text-white dark:data-[state=active]:!text-white">
              Alertas ({recommendations.alerts.length})
            </TabsTrigger>
          </TabsList>

          {/* Exams Tab */}
          <TabsContent value="exams" className="mt-6 space-y-3">
            {recommendations.examRecommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum exame recomendado no momento
              </p>
            ) : (
              recommendations.examRecommendations.map((exam, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border bg-card hover:border-sky-300 hover:bg-sky-50/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-sky-100 p-2 rounded-lg shrink-0">
                        <ClipboardList className="h-4 w-4 text-sky-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{exam.exam}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{exam.reason}</p>
                      </div>
                    </div>
                    <Badge variant={getUrgencyColor(exam.urgency) as any}>
                      {exam.urgency === 'high' ? 'Urgente' : exam.urgency === 'medium' ? 'Moderado' : 'Baixo'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pl-11 mt-2">
                    <Calendar className="h-3 w-3" />
                    {exam.suggestedTimeframe}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Lifestyle Tab */}
          <TabsContent value="lifestyle" className="mt-6 space-y-3">
            {recommendations.lifestyleRecommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma recomendação de lifestyle no momento
              </p>
            ) : (
              recommendations.lifestyleRecommendations.map((lifestyle, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border bg-card hover:border-teal-300 hover:bg-teal-50/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-teal-100 p-2 rounded-lg shrink-0">
                        {getCategoryIcon(lifestyle.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold capitalize text-foreground">{lifestyle.category}</h4>
                          <Badge variant="outline" className="text-xs">
                            {lifestyle.priority === 'high' ? 'Alta Prioridade' : lifestyle.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{lifestyle.recommendation}</p>
                        <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                          <TrendingUp className="h-3 w-3" />
                          {lifestyle.expectedBenefit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="mt-6 space-y-3">
            {recommendations.healthGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma meta definida no momento
              </p>
            ) : (
              recommendations.healthGoals.map((goal, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border bg-card hover:border-purple-300 hover:bg-purple-50/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg shrink-0">
                      <Target className="h-4 w-4 text-purple-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{goal.goal}</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground font-medium">Atual:</span> <span className="text-foreground">{goal.currentStatus}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">Meta:</span> <span className="text-foreground">{goal.targetValue}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prazo: {goal.timeframe}
                      </p>
                    </div>
                  </div>

                  {goal.actionSteps.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-foreground">Passos de Ação:</h5>
                        <ul className="space-y-1">
                          {goal.actionSteps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-sm text-foreground flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6 space-y-3">
            {recommendations.alerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 mb-4 inline-block">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Tudo Ótimo!</p>
                <p className="text-xs text-muted-foreground mt-1">Nenhum alerta no momento</p>
              </div>
            ) : (
              recommendations.alerts.map((alert, index) => {
                const alertConfig = {
                  urgent: { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-800', iconBg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' },
                  warning: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800', iconBg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600 dark:text-orange-400' },
                  info: { bg: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-200 dark:border-sky-800', iconBg: 'bg-sky-100 dark:bg-sky-900/30', color: 'text-sky-600 dark:text-sky-400' },
                }[alert.type]

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${alertConfig.bg} ${alertConfig.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${alertConfig.iconBg}`}>
                        <AlertCircle className={`h-4 w-4 ${alertConfig.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${alertConfig.color}`}>{alert.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">{alert.action}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            ⚕️ Estas recomendações são educacionais e não substituem consulta médica profissional.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
