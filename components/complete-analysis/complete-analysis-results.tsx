'use client'

/**
 * Complete Analysis Results
 * Display full results of complete analysis
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  ArrowLeft,
  Sparkles,
  Brain,
  Activity,
  Utensils,
  Dumbbell,
  Lightbulb,
  Calendar as CalendarIcon,
  ClipboardList,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Pill,
  ShoppingCart,
  UtensilsCrossed
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { SynthesisView } from './synthesis-view'
import { AgentAnalysisView } from './agent-analysis-view'

interface CompleteAnalysisResultsProps {
  analysisId: string
}

export function CompleteAnalysisResults({ analysisId }: CompleteAnalysisResultsProps) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalysis()
  }, [analysisId])

  const loadAnalysis = async () => {
    try {
      const response = await fetch(`/api/analyses/complete/${analysisId}`)
      const result = await response.json()

      if (result.success) {
        setData(result.completeAnalysis)
      }
    } catch (error) {
      console.error('Error loading analysis:', error)
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

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Análise não encontrada</p>
      </div>
    )
  }

  const integrativeAnalysis = data.analyses.find((a: any) => a.agentKey === 'integrativa')
  const nutritionAnalysis = data.analyses.find((a: any) => a.agentKey === 'nutricao')
  const exerciseAnalysis = data.analyses.find((a: any) => a.agentKey === 'exercicio')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/analyze-complete">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Análise Completa</h1>
          <p className="text-muted-foreground mt-2">
            Análise realizada em {format(new Date(data.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700">Concluída</Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="synthesis" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="synthesis" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Síntese
          </TabsTrigger>
          <TabsTrigger value="integrative" className="gap-2">
            <Brain className="h-4 w-4" />
            M. Integrativa
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="gap-2">
            <Utensils className="h-4 w-4" />
            Nutrição
          </TabsTrigger>
          <TabsTrigger value="exercise" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            Exercício
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="weekly-plan" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Plano Semanal
          </TabsTrigger>
        </TabsList>

        {/* Síntese Consolidada */}
        <TabsContent value="synthesis" className="mt-6">
          {data.synthesis && <SynthesisView synthesis={data.synthesis} />}
        </TabsContent>

        {/* Medicina Integrativa */}
        <TabsContent value="integrative" className="mt-6">
          {integrativeAnalysis && (
            <AgentAnalysisView
              analysis={integrativeAnalysis}
              color="green"
            />
          )}
        </TabsContent>

        {/* Nutrição */}
        <TabsContent value="nutrition" className="mt-6">
          {nutritionAnalysis && (
            <AgentAnalysisView
              analysis={nutritionAnalysis}
              color="orange"
            />
          )}
        </TabsContent>

        {/* Exercício */}
        <TabsContent value="exercise" className="mt-6">
          {exerciseAnalysis && (
            <AgentAnalysisView
              analysis={exerciseAnalysis}
              color="blue"
            />
          )}
        </TabsContent>

        {/* Recomendações */}
        <TabsContent value="recommendations" className="mt-6">
          {data.recommendations ? (
            <RecommendationsView recommendations={data.recommendations} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nenhuma recomendação disponível para esta análise.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Plano Semanal */}
        <TabsContent value="weekly-plan" className="mt-6">
          {data.weeklyPlan ? (
            <WeeklyPlanView weeklyPlan={data.weeklyPlan} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nenhum plano semanal disponível para esta análise.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Recommendations View Component
 */
interface RecommendationsViewProps {
  recommendations: {
    examRecommendations: Array<{
      exam: string
      reason: string
      urgency: 'high' | 'medium' | 'low'
      suggestedTimeframe: string
    }>
    lifestyleRecommendations: Array<{
      category: string
      recommendation: string
      priority: 'high' | 'medium' | 'low'
      expectedBenefit: string
    }>
    healthGoals: Array<{
      goal: string
      currentStatus: string
      targetValue: string
      timeframe: string
      actionSteps: string[]
    }>
    alerts: Array<{
      type: 'urgent' | 'warning' | 'info'
      message: string
      action: string
    }>
  }
}

function RecommendationsView({ recommendations }: RecommendationsViewProps) {
  return (
    <div className="space-y-6">
      {/* Card de Informações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            Recomendações Personalizadas
          </CardTitle>
          <CardDescription>
            Baseadas na sua análise médica completa
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs para Navegação */}
      <Tabs defaultValue="exams" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="exams" className="gap-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white">
            <ClipboardList className="h-4 w-4" />
            Exames
          </TabsTrigger>
          <TabsTrigger value="lifestyle" className="gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <Activity className="h-4 w-4" />
            Estilo de Vida
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Target className="h-4 w-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <AlertCircle className="h-4 w-4" />
            Alertas
          </TabsTrigger>
        </TabsList>

        {/* Exames Tab */}
        <TabsContent value="exams" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-sky-600" />
                Exames Recomendados
              </CardTitle>
              <CardDescription>
                Exames sugeridos com base na análise médica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.examRecommendations.map((exam, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg transition-all ${
                    exam.urgency === 'high'
                      ? 'border-red-200 bg-white hover:bg-red-50/30'
                      : exam.urgency === 'medium'
                      ? 'border-amber-200 bg-white hover:bg-amber-50/30'
                      : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-gray-900">{exam.exam}</h4>
                    <Badge
                      className={`text-xs ${
                        exam.urgency === 'high'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : exam.urgency === 'medium'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {exam.urgency === 'high' ? 'Urgente' : exam.urgency === 'medium' ? 'Moderado' : 'Baixo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{exam.reason}</p>
                  <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {exam.suggestedTimeframe}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Estilo de Vida Tab */}
        <TabsContent value="lifestyle" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-600" />
                Recomendações de Estilo de Vida
              </CardTitle>
              <CardDescription>
                Mudanças recomendadas para melhorar sua saúde
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.lifestyleRecommendations.map((lifestyle, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg transition-all ${
                    lifestyle.priority === 'high'
                      ? 'border-teal-300 bg-white hover:bg-teal-50/30'
                      : lifestyle.priority === 'medium'
                      ? 'border-amber-200 bg-white hover:bg-amber-50/30'
                      : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm capitalize text-gray-900">{lifestyle.category}</h4>
                    <Badge
                      className={`text-xs ${
                        lifestyle.priority === 'high'
                          ? 'bg-teal-100 text-teal-700 border-teal-200'
                          : lifestyle.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {lifestyle.priority === 'high' ? 'Alta Prioridade' : lifestyle.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{lifestyle.recommendation}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                      <TrendingUp className="h-3 w-3" />
                      {lifestyle.expectedBenefit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Metas Tab */}
        <TabsContent value="goals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Metas de Saúde
              </CardTitle>
              <CardDescription>
                Objetivos definidos para seu progresso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.healthGoals.map((goal, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-purple-200 bg-white hover:bg-purple-50/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg shrink-0">
                    <Target className="h-4 w-4 text-purple-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-base text-gray-900 mb-3">{goal.goal}</h4>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Status Atual</p>
                        <p className="text-sm text-gray-900 font-semibold">{goal.currentStatus}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Meta</p>
                        <p className="text-sm text-purple-700 font-semibold">{goal.targetValue}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3" />
                      Prazo: {goal.timeframe}
                    </div>

                    {goal.actionSteps.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Passos de Ação</h5>
                        <ul className="space-y-2">
                          {goal.actionSteps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-sm text-gray-700 flex items-start gap-2 leading-relaxed">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Alertas Tab */}
        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Alertas de Saúde
              </CardTitle>
              <CardDescription>
                Pontos de atenção identificados na análise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.alerts.map((alert, index) => {
                const alertConfig = {
                  urgent: {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    iconBg: 'bg-red-100',
                    color: 'text-red-700',
                    badge: 'bg-red-100 text-red-700 border-red-200'
                  },
                  warning: {
                    bg: 'bg-orange-50',
                    border: 'border-orange-200',
                    iconBg: 'bg-orange-100',
                    color: 'text-orange-700',
                    badge: 'bg-orange-100 text-orange-700 border-orange-200'
                  },
                  info: {
                    bg: 'bg-sky-50',
                    border: 'border-sky-200',
                    iconBg: 'bg-sky-100',
                    color: 'text-sky-700',
                    badge: 'bg-sky-100 text-sky-700 border-sky-200'
                  }
                }[alert.type]

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${alertConfig.bg} ${alertConfig.border} hover:shadow-sm transition-all`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg shrink-0 ${alertConfig.iconBg}`}>
                        <AlertCircle className={`h-4 w-4 ${alertConfig.color}`} />
                      </div>
                      <Badge className={`text-xs ${alertConfig.badge}`}>
                        {alert.type === 'urgent' ? 'Urgente' : alert.type === 'warning' ? 'Atenção' : 'Info'}
                      </Badge>
                    </div>
                    <div>
                      <p className={`font-semibold text-sm mb-2 ${alertConfig.color}`}>{alert.message}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{alert.action}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Weekly Plan View Component
 */
interface WeeklyPlanViewProps {
  weeklyPlan: {
    weekStartDate: string
    supplementationStrategy: {
      overview: string
      supplements: Array<{
        name: string
        dosage: string
        timing: string
        purpose: string
      }>
    }
    shoppingList: {
      overview: string
      categories: Array<{
        category: string
        items: Array<{ item: string }>
      }>
    }
    mealPlan: {
      overview: string
      meals: Array<any>
    }
    workoutPlan: {
      overview: string
      workouts: Array<any>
    }
  }
}

function WeeklyPlanView({ weeklyPlan }: WeeklyPlanViewProps) {
  return (
    <div className="space-y-6">
      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-teal-600" />
            Plano Semanal
          </CardTitle>
          <CardDescription>
            Semana iniciando em: {format(new Date(weeklyPlan.weekStartDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs para Navegação */}
      <Tabs defaultValue="supplements" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="supplements" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Pill className="h-4 w-4" />
            Suplementação
          </TabsTrigger>
          <TabsTrigger value="shopping" className="gap-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white">
            <ShoppingCart className="h-4 w-4" />
            Compras
          </TabsTrigger>
          <TabsTrigger value="meals" className="gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <UtensilsCrossed className="h-4 w-4" />
            Refeições
          </TabsTrigger>
          <TabsTrigger value="workout" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Dumbbell className="h-4 w-4" />
            Treinos
          </TabsTrigger>
        </TabsList>

        {/* Suplementação Tab */}
        <TabsContent value="supplements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-purple-600" />
                Estratégia de Suplementação
              </CardTitle>
              <CardDescription>
                {weeklyPlan.supplementationStrategy.overview}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyPlan.supplementationStrategy.supplements.map((supplement, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition-all"
                >
                  <div className="flex items-start gap-2">
                    <div className="bg-purple-100 p-1.5 rounded shrink-0">
                      <Pill className="h-3 w-3 text-purple-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{supplement.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {supplement.dosage} - {supplement.timing}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{supplement.purpose}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lista de Compras Tab */}
        <TabsContent value="shopping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-sky-600" />
                Lista de Compras
              </CardTitle>
              <CardDescription>
                {weeklyPlan.shoppingList.overview}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {weeklyPlan.shoppingList.categories.map((category, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-base text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-sky-600" />
                    {category.category}
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {category.items.map((item: any, itemIndex: number) => (
                      <div
                        key={itemIndex}
                        className={`p-4 border rounded-lg transition-all ${
                          item.priority === 'high'
                            ? 'border-red-200 bg-white hover:bg-red-50/30'
                            : item.priority === 'medium'
                            ? 'border-amber-200 bg-white hover:bg-amber-50/30'
                            : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-sm text-gray-900">{item.item}</p>
                          {item.priority && (
                            <Badge
                              className={`text-xs ${
                                item.priority === 'high'
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : item.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              }`}
                            >
                              {item.priority === 'high' ? 'High' : item.priority === 'medium' ? 'Medium' : 'Low'}
                            </Badge>
                          )}
                        </div>
                        {item.quantity && (
                          <p className="text-sm text-gray-600 mt-1">{item.quantity}</p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic leading-relaxed">{item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {index < weeklyPlan.shoppingList.categories.length - 1 && (
                    <div className="border-t border-gray-200 mt-6" />
                  )}
                </div>
              ))}

              {/* Dicas de Compra */}
              {weeklyPlan.shoppingList.tips && weeklyPlan.shoppingList.tips.length > 0 && (
                <div className="border border-sky-200 rounded-lg p-4 bg-white hover:bg-sky-50/30 transition-colors mt-6">
                  <h4 className="font-semibold text-base text-gray-900 mb-3">💡 Dicas de Compra</h4>
                  <ul className="space-y-2">
                    {weeklyPlan.shoppingList.tips.map((tip: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                        <span className="text-sky-600 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plano de Refeições Tab */}
        <TabsContent value="meals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                Plano de Refeições
              </CardTitle>
              <CardDescription>
                {weeklyPlan.mealPlan.overview}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyPlan.mealPlan.meals.map((day: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:border-orange-300 hover:bg-orange-50/20 transition-all"
                >
                  <h4 className="font-semibold text-gray-900 mb-4">{day.day}</h4>
                  <div className="space-y-4">
                    {day.breakfast && (
                      <div>
                        <h5 className="font-semibold text-sm text-orange-600 mb-2">
                          ☀️ Café da Manhã
                        </h5>
                        <div className="pl-4">
                          <p className="font-semibold text-sm text-gray-900">{day.breakfast.name}</p>
                          {day.breakfast.ingredients && (
                            <ul className="text-xs text-gray-600 space-y-0.5 mt-1">
                              {day.breakfast.ingredients.map((ing: string, i: number) => (
                                <li key={i}>• {ing}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                    {day.lunch && (
                      <div>
                        <h5 className="font-semibold text-sm text-emerald-600 mb-2">🌞 Almoço</h5>
                        <div className="pl-4">
                          <p className="font-semibold text-sm text-gray-900">{day.lunch.name}</p>
                          {day.lunch.ingredients && (
                            <ul className="text-xs text-gray-600 space-y-0.5 mt-1">
                              {day.lunch.ingredients.map((ing: string, i: number) => (
                                <li key={i}>• {ing}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                    {day.dinner && (
                      <div>
                        <h5 className="font-semibold text-sm text-sky-600 mb-2">🌙 Jantar</h5>
                        <div className="pl-4">
                          <p className="font-semibold text-sm text-gray-900">{day.dinner.name}</p>
                          {day.dinner.ingredients && (
                            <ul className="text-xs text-gray-600 space-y-0.5 mt-1">
                              {day.dinner.ingredients.map((ing: string, i: number) => (
                                <li key={i}>• {ing}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                    {day.snacks && day.snacks.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-sm text-purple-600 mb-2">🍎 Lanches</h5>
                        <div className="pl-4 space-y-1">
                          {day.snacks.map((snack: any, i: number) => (
                            <div key={i} className="text-xs">
                              <span className="font-semibold text-gray-900">{snack.name}</span>
                              <span className="text-gray-600"> ({snack.timing})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plano de Exercícios Tab */}
        <TabsContent value="workout" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-emerald-600" />
                Plano de Exercícios
              </CardTitle>
              <CardDescription>
                {weeklyPlan.workoutPlan.overview}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyPlan.workoutPlan.workouts.map((workout: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{workout.day}</h4>
                      <p className="text-sm text-gray-600 mt-1">{workout.type}</p>
                    </div>
                    <div className="flex gap-2">
                      {workout.duration && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          {workout.duration}
                        </Badge>
                      )}
                      {workout.intensity && (
                        <Badge
                          className={
                            workout.intensity === 'high'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : workout.intensity === 'medium'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }
                        >
                          {workout.intensity === 'high'
                            ? 'Alta'
                            : workout.intensity === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {workout.warmup && (
                    <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                      <strong>Aquecimento:</strong> {workout.warmup}
                    </div>
                  )}
                  {workout.exercises && (
                    <div className="space-y-2">
                      {workout.exercises.map((exercise: any, exIndex: number) => (
                        <div
                          key={exIndex}
                          className="p-3 bg-gray-50 rounded border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                        >
                          <p className="font-semibold text-sm text-gray-900">{exercise.name}</p>
                          <div className="flex gap-3 text-xs text-gray-600 mt-1">
                            {exercise.sets && <span>Séries: {exercise.sets}</span>}
                            {exercise.reps && <span>Reps: {exercise.reps}</span>}
                            {exercise.duration && <span>Duração: {exercise.duration}</span>}
                          </div>
                          {exercise.notes && (
                            <p className="text-xs text-gray-500 mt-1 italic">{exercise.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {workout.cooldown && (
                    <div className="mt-3 p-2 bg-sky-50 border border-sky-200 rounded text-xs">
                      <strong>Alongamento:</strong> {workout.cooldown}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
