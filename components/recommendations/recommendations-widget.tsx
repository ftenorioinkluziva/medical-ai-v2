'use client'

/**
 * Recommendations Widget
 * Display personalized health recommendations
 */

import { useEffect, useState } from 'react'
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

export function RecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async (forceRefresh = false) => {
    try {
      setIsLoading(true)
      setError(null)

      const url = forceRefresh ? '/api/recommendations?refresh=true' : '/api/recommendations'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Erro ao carregar recomendações')
      }

      const data = await response.json()
      setRecommendations(data.recommendations)
      setGeneratedAt(data.generatedAt)
      setIsCached(data.cached || false)
    } catch (err) {
      console.error('Error loading recommendations:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadRecommendations(true)
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
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Gerando recomendações personalizadas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !recommendations) {
    const isNoAnalysis = error && error.includes('Nenhuma análise encontrada')

    return (
      <Card className={isNoAnalysis ? "border-blue-200 bg-blue-50" : "border-red-200 bg-red-50"}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className={`h-5 w-5 flex-shrink-0 ${isNoAnalysis ? 'text-blue-600' : 'text-red-600'}`} />
            <div className="flex-1">
              <p className={`font-medium ${isNoAnalysis ? 'text-blue-900' : 'text-red-900'}`}>
                {isNoAnalysis ? 'Nenhuma análise disponível' : 'Erro ao carregar recomendações'}
              </p>
              <p className={`text-sm mt-1 ${isNoAnalysis ? 'text-blue-700' : 'text-red-700'}`}>
                {isNoAnalysis
                  ? 'Realize uma análise médica primeiro para receber recomendações personalizadas.'
                  : error || 'Ocorreu um erro ao carregar as recomendações.'
                }
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="ml-auto">
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Recomendações Personalizadas
            </CardTitle>
            <CardDescription>
              Sugestões baseadas no seu perfil e histórico
              {generatedAt && (
                <span className="block mt-1 text-xs">
                  Última atualização: {formatDate(generatedAt)}
                  {isCached && <Badge variant="secondary" className="ml-2 text-xs">Cache</Badge>}
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="exams" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="exams">
              Exames ({recommendations.examRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="lifestyle">
              Lifestyle ({recommendations.lifestyleRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="goals">
              Metas ({recommendations.healthGoals.length})
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alertas ({recommendations.alerts.length})
            </TabsTrigger>
          </TabsList>

          {/* Exams Tab */}
          <TabsContent value="exams" className="mt-6 space-y-4">
            {recommendations.examRecommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum exame recomendado no momento
              </p>
            ) : (
              recommendations.examRecommendations.map((exam, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <ClipboardList className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium">{exam.exam}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{exam.reason}</p>
                      </div>
                    </div>
                    <Badge variant={getUrgencyColor(exam.urgency) as any}>
                      {exam.urgency === 'high' ? 'Urgente' : exam.urgency === 'medium' ? 'Moderado' : 'Baixo'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pl-8">
                    <Calendar className="h-3 w-3" />
                    {exam.suggestedTimeframe}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Lifestyle Tab */}
          <TabsContent value="lifestyle" className="mt-6 space-y-4">
            {recommendations.lifestyleRecommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma recomendação de lifestyle no momento
              </p>
            ) : (
              recommendations.lifestyleRecommendations.map((lifestyle, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getCategoryIcon(lifestyle.category)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium capitalize">{lifestyle.category}</h4>
                          <Badge variant="outline" className="text-xs">
                            {lifestyle.priority === 'high' ? 'Alta Prioridade' : lifestyle.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{lifestyle.recommendation}</p>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
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
          <TabsContent value="goals" className="mt-6 space-y-4">
            {recommendations.healthGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma meta definida no momento
              </p>
            ) : (
              recommendations.healthGoals.map((goal, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">{goal.goal}</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Atual:</span> {goal.currentStatus}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Meta:</span> {goal.targetValue}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prazo: {goal.timeframe}
                      </p>
                    </div>
                  </div>

                  {goal.actionSteps.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Passos de Ação:</h5>
                        <ul className="space-y-1">
                          {goal.actionSteps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
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
          <TabsContent value="alerts" className="mt-6 space-y-4">
            {recommendations.alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p className="text-sm font-medium text-green-600">Tudo Ótimo!</p>
                <p className="text-xs text-muted-foreground mt-1">Nenhum alerta no momento</p>
              </div>
            ) : (
              recommendations.alerts.map((alert, index) => {
                const alertConfig = {
                  urgent: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', icon: AlertCircle },
                  warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', icon: AlertCircle },
                  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: AlertCircle },
                }[alert.type]

                const Icon = alertConfig.icon

                return (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg ${alertConfig.bg} ${alertConfig.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 ${alertConfig.text} mt-0.5`} />
                      <div className="flex-1">
                        <p className={`font-medium ${alertConfig.text}`}>{alert.message}</p>
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
