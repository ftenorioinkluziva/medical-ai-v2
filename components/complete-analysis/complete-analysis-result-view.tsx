'use client'

/**
 * Complete Analysis Result View
 * Renders the full results of a complete analysis, applying consistent UI patterns.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  Clock,
  Dumbbell,
  FileText,
  Lightbulb,
  Pill,
  ShoppingCart,
  Target,
  UtensilsCrossed,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { Button } from '../ui/button'
import { MealPlanNavigator } from '@/components/weekly-plan/meal-plan-navigator'
import { WorkoutPlanNavigator } from '@/components/weekly-plan/workout-plan-navigator'

interface CompleteAnalysis {
  id: string
  createdAt: string
  documentIds: string[]
  synthesis: {
    executiveSummary: string
    keyFindings: string[]
    criticalAlerts?: string[]
    mainRecommendations?: string[]
  }
  analyses: Array<{
    id: string
    analysis: string
    insights: any
    actionItems: any
    createdAt: string
    agentName: string
    agentKey: string
    agentTitle: string
    agentColor: string
  }>
  recommendations: {
    examRecommendations: any[]
    lifestyleRecommendations: any[]
    healthGoals: any[]
    alerts: any[]
  }
  weeklyPlan: any
}

interface CompleteAnalysisResultViewProps {
  analysis: CompleteAnalysis
}

export function CompleteAnalysisResultView({ analysis }: CompleteAnalysisResultViewProps) {
  const { synthesis, analyses, recommendations, weeklyPlan: rawWeeklyPlan } = analysis

  // Normalize weekly plan data (handle old format with {object, usage})
  const weeklyPlan = rawWeeklyPlan ? {
    ...rawWeeklyPlan,
    supplementationStrategy: rawWeeklyPlan.supplementationStrategy?.object || rawWeeklyPlan.supplementationStrategy,
    shoppingList: rawWeeklyPlan.shoppingList?.object || rawWeeklyPlan.shoppingList,
    mealPlan: rawWeeklyPlan.mealPlan?.object || rawWeeklyPlan.mealPlan,
    workoutPlan: rawWeeklyPlan.workoutPlan?.object || rawWeeklyPlan.workoutPlan,
  } : null

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })
  }

  const getUrgencyColor = (urgency: string) => (urgency === 'high' ? 'destructive' : urgency === 'medium' ? 'default' : 'secondary')
  const getPriorityColor = (priority: string) => (priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'secondary')
  const getAlertColor = (type: string) => (type === 'urgent' ? 'destructive' : type === 'warning' ? 'default' : 'secondary')
  const getCategoryIcon = (category: string) => (category === 'exercise' ? <Activity className="h-4 w-4" /> : <Target className="h-4 w-4" />)

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
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <Link href="/analyze-complete?tab=history">
            <Button variant="ghost" className="gap-2 mb-2 -ml-4">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar para o Histórico</span>
              <span className="sm:hidden">Voltar</span>
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Resultados da Análise Completa</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Análise gerada em {formatDate(analysis.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-card text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{analysis.documentIds.length} documento(s) analisado(s)</span>
        </div>
      </div>

      {/* Critical Alerts Card */}
      {synthesis.criticalAlerts && synthesis.criticalAlerts.length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticos
            </CardTitle>
            <CardDescription className="text-red-800 dark:text-red-200">
              Atenção: os seguintes pontos requerem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {synthesis.criticalAlerts.map((alert, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-900 dark:text-red-100 leading-relaxed">{alert}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="synthesis" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="synthesis" className="gap-1.5 data-[state=active]:!bg-purple-600 dark:data-[state=active]:!bg-purple-500 data-[state=active]:!text-white">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Síntese</span>
          </TabsTrigger>
          <TabsTrigger value="analyses" className="gap-1.5 data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Análises</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-1.5 data-[state=active]:!bg-amber-600 dark:data-[state=active]:!bg-amber-500 data-[state=active]:!text-white">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Metas</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-1.5 data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Plano</span>
          </TabsTrigger>
        </TabsList>

        {/* Synthesis Tab */}
        <TabsContent value="synthesis" className="mt-6">
          <Accordion type="multiple" className="w-full">
            {/* Item 1: Síntese Executiva */}
            <AccordionItem value="executive-summary">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 text-base sm:text-lg">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Síntese Executiva</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {synthesis.executiveSummary}
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Item 2: Principais Achados */}
            <AccordionItem value="key-findings">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 text-base sm:text-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Principais Achados</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <ul className="space-y-2.5">
                  {synthesis.keyFindings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{finding}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Item 3: Principais Recomendações */}
            {synthesis.mainRecommendations && synthesis.mainRecommendations.length > 0 && (
              <AccordionItem value="main-recommendations">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 text-base sm:text-lg">
                    <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span>Principais Recomendações</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    Ações prioritárias baseadas em todas as análises
                  </p>
                  <ol className="space-y-2.5 list-decimal list-inside">
                    {synthesis.mainRecommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground leading-relaxed pl-2">
                        {rec}
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </TabsContent>

        {/* Analyses Tab (NOVO) */}
        <TabsContent value="analyses" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue={analyses[0]?.agentKey || 'integrative'} className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-t-lg rounded-b-none bg-muted-foreground/10">
                  {analyses.map(analysis => (
                    <TabsTrigger
                      key={analysis.id}
                      value={analysis.agentKey}
                      className={`gap-1.5 sm:gap-2 data-[state=active]:!text-white ${
                        analysis.agentKey === 'integrative' ? 'data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500' :
                        analysis.agentKey === 'nutrition' ? 'data-[state=active]:!bg-orange-600 dark:data-[state=active]:!bg-orange-500' :
                        'data-[state=active]:!bg-sky-600 dark:data-[state=active]:!bg-sky-500'
                      }`}
                    >
                      <Brain className="h-4 w-4" />
                      <span className="hidden sm:inline">{analysis.agentName}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="p-4 sm:p-6">
                  {analyses.map(analysis => (
                    <TabsContent key={analysis.id} value={analysis.agentKey} className="mt-0">
                      {/* Header do agente */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold">{analysis.agentTitle}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {format(new Date(analysis.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>

                      {/* Accordion para cada seção da análise */}
                      <Accordion type="multiple" className="w-full">
                        {/* Item 1: Análise Detalhada */}
                        <AccordionItem value="detailed-analysis">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2 text-base sm:text-lg">
                              <FileText className="h-4 w-4" />
                              <span>Análise Detalhada</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4">
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {analysis.analysis}
                            </p>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Item 2: Insights-Chave (se existir) */}
                        {analysis.insights && analysis.insights.length > 0 && (
                          <AccordionItem value="insights">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-2 text-base sm:text-lg">
                                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <span>Insights-Chave</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4">
                              <ul className="space-y-2">
                                {analysis.insights.map((insight: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-teal-600 dark:text-teal-400 mt-1">•</span>
                                    <span className="text-sm text-muted-foreground leading-relaxed">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                        {/* Item 3: Ações Recomendadas (se existir) */}
                        {analysis.actionItems && analysis.actionItems.length > 0 && (
                          <AccordionItem value="action-items">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-2 text-base sm:text-lg">
                                <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span>Ações Recomendadas</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4">
                              <ul className="space-y-2">
                                {analysis.actionItems.map((item: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-3">
                                    <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      </Accordion>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab (ex-Recommendations) */}
        <TabsContent value="goals" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="exams" className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-t-lg rounded-b-none bg-muted-foreground/10">
                  <TabsTrigger value="exams" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-sky-600 dark:data-[state=active]:!bg-sky-500 data-[state=active]:!text-white">
                    <ClipboardList className="h-4 w-4" />
                    <span className="hidden sm:inline">Exames</span>
                    <span className="sm:hidden">({recommendations.examRecommendations.length})</span>
                    <span className="hidden sm:inline">({recommendations.examRecommendations.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="lifestyle" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white">
                    <Activity className="h-4 w-4" />
                    <span className="hidden sm:inline">Lifestyle</span>
                    <span className="sm:hidden">({recommendations.lifestyleRecommendations.length})</span>
                    <span className="hidden sm:inline">({recommendations.lifestyleRecommendations.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="goals" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-purple-600 dark:data-[state=active]:!bg-purple-500 data-[state=active]:!text-white">
                    <Target className="h-4 w-4" />
                    <span className="hidden sm:inline">Metas</span>
                    <span className="sm:hidden">({recommendations.healthGoals.length})</span>
                    <span className="hidden sm:inline">({recommendations.healthGoals.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-amber-600 dark:data-[state=active]:!bg-amber-500 data-[state=active]:!text-white">
                    <AlertCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Alertas</span>
                    <span className="sm:hidden">({recommendations.alerts.length})</span>
                    <span className="hidden sm:inline">({recommendations.alerts.length})</span>
                  </TabsTrigger>
                </TabsList>

                <div className="p-6">
                  {/* Exams Tab */}
                  <TabsContent value="exams" className="space-y-3 mt-0">
                    {recommendations.examRecommendations.length > 0 ? (
                      recommendations.examRecommendations.map((exam: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2 transition-colors hover:border-sky-300 hover:bg-sky-50/30 dark:hover:border-sky-700 dark:hover:bg-sky-900/30">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium">{exam.exam}</h4>
                            <Badge variant={getUrgencyColor(exam.urgency)}>{exam.urgency}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{exam.reason}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">Nenhum exame recomendado.</p>
                    )}
                  </TabsContent>

                  {/* Lifestyle Tab */}
                  <TabsContent value="lifestyle" className="space-y-3 mt-0">
                    {recommendations.lifestyleRecommendations.length > 0 ? (
                      recommendations.lifestyleRecommendations.map((lifestyle: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2 transition-colors hover:border-teal-300 hover:bg-teal-50/30 dark:hover:border-teal-700 dark:hover:bg-teal-900/30">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(lifestyle.category)}
                              <h4 className="font-medium capitalize">{lifestyle.category}</h4>
                            </div>
                            <Badge variant={getPriorityColor(lifestyle.priority)}>{lifestyle.priority}</Badge>
                          </div>
                          <p className="text-sm">{lifestyle.recommendation}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">Nenhuma recomendação de lifestyle.</p>
                    )}
                  </TabsContent>

                  {/* Goals Tab */}
                  <TabsContent value="goals" className="space-y-3 mt-0">
                    {recommendations.healthGoals.length > 0 ? (
                      recommendations.healthGoals.map((goal: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3 transition-colors hover:border-purple-300 hover:bg-purple-50/30 dark:hover:border-purple-700 dark:hover:bg-purple-900/30">
                          <h4 className="font-medium">{goal.goal}</h4>
                          <p className="text-sm text-muted-foreground">{goal.currentStatus} → {goal.targetValue}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">Nenhuma meta de saúde definida.</p>
                    )}
                  </TabsContent>

                  {/* Alerts Tab */}
                  <TabsContent value="alerts" className="space-y-3 mt-0">
                    {recommendations.alerts.length > 0 ? (
                      recommendations.alerts.map((alert: any, index: number) => {
                        const config = alertConfig[alert.type as keyof typeof alertConfig] || alertConfig.info
                        return (
                          <div key={index} className={`border rounded-lg p-4 space-y-2 transition-colors ${config.bg} ${config.border} ${config.hover}`}>
                            <div className="flex items-start gap-2">
                              <AlertCircle className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{alert.message}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  <strong>Ação recomendada:</strong> {alert.action}
                                </p>
                              </div>
                              <Badge variant={getAlertColor(alert.type)}>{alert.type}</Badge>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">Nenhum alerta.</p>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Tab (ex-Weekly Plan) */}
        <TabsContent value="plan" className="mt-6">
          {!weeklyPlan ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-3">
                  <div className="bg-muted rounded-lg p-4 inline-block">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Plano Semanal Não Disponível</h3>
                  <p className="text-sm text-muted-foreground">
                    O plano semanal não foi gerado para esta análise.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Plano Semanal Integrado
                </CardTitle>
                <CardDescription>
                  Um guia prático para sua semana, integrando suplementação, compras, refeições e treinos.
                </CardDescription>
              </CardHeader>
              <CardContent>
              <Tabs defaultValue="supplements" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted">
                  <TabsTrigger value="supplements" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-purple-600 dark:data-[state=active]:!bg-purple-500 data-[state=active]:!text-white">
                    <Pill className="h-4 w-4" />
                    <span className="hidden sm:inline">Suplementação</span>
                  </TabsTrigger>
                  <TabsTrigger value="shopping" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-emerald-600 dark:data-[state=active]:!bg-emerald-500 data-[state=active]:!text-white">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">Compras</span>
                  </TabsTrigger>
                  <TabsTrigger value="meals" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-orange-600 dark:data-[state=active]:!bg-orange-500 data-[state=active]:!text-white">
                    <UtensilsCrossed className="h-4 w-4" />
                    <span className="hidden sm:inline">Refeições</span>
                  </TabsTrigger>
                  <TabsTrigger value="workouts" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-sky-600 dark:data-[state=active]:!bg-sky-500 data-[state=active]:!text-white">
                    <Dumbbell className="h-4 w-4" />
                    <span className="hidden sm:inline">Treinos</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  {/* Supplements */}
                  <TabsContent value="supplements" className="mt-0">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-foreground">Estratégia de Suplementação</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {weeklyPlan.supplementationStrategy.overview}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {weeklyPlan.supplementationStrategy.supplements?.map((supplement: any, index: number) => (
                          <div key={index} className="p-4 border border-border rounded-lg bg-card hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/30 dark:hover:bg-purple-950/30 transition-all">
                            <h4 className="font-semibold text-base text-foreground mb-3">{supplement.name}</h4>
                            <div className="space-y-2.5 text-sm">
                              <div className="flex items-center gap-2">
                                <Pill className="h-4 w-4 text-muted-foreground shrink-0" />
                                <p className="text-muted-foreground">{supplement.dosage}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                <p className="text-muted-foreground">{supplement.timing}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <Target className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <p className="text-muted-foreground leading-relaxed">{supplement.purpose}</p>
                              </div>
                              {supplement.duration && (
                                <p className="text-xs text-muted-foreground mt-2">Duração: {supplement.duration}</p>
                              )}
                            </div>
                          </div>
                        ))}

                        {weeklyPlan.supplementationStrategy.hormonalSupport &&
                         weeklyPlan.supplementationStrategy.hormonalSupport.length > 0 && (
                          <>
                            <Separator className="my-6" />
                            <div>
                              <h4 className="font-semibold text-base text-foreground mb-4">Suporte Hormonal</h4>
                              <div className="space-y-3">
                                {weeklyPlan.supplementationStrategy.hormonalSupport.map((hormone: any, index: number) => (
                                  <div key={index} className="p-4 border border-purple-200 dark:border-purple-700 rounded-lg bg-card hover:bg-purple-50/30 dark:hover:bg-purple-950/30 transition-colors">
                                    <h5 className="font-semibold text-sm text-foreground">{hormone.hormone}</h5>
                                    <p className="text-sm text-foreground mt-2 leading-relaxed">{hormone.strategy}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Monitoramento: {hormone.monitoring}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {weeklyPlan.supplementationStrategy.nextExamRecommendations &&
                         weeklyPlan.supplementationStrategy.nextExamRecommendations.length > 0 && (
                          <>
                            <Separator className="my-6" />
                            <div>
                              <h4 className="font-semibold text-base text-foreground mb-4">Exames Recomendados para o Próximo Ciclo</h4>
                              <ul className="space-y-2.5">
                                {weeklyPlan.supplementationStrategy.nextExamRecommendations.map((exam: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2.5 text-sm">
                                    <span className="text-teal-600 mt-0.5">•</span>
                                    <span className="text-foreground leading-relaxed">{exam}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Shopping */}
                  <TabsContent value="shopping" className="mt-0">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-foreground">Lista de Compras</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1 leading-relaxed">{weeklyPlan.shoppingList.overview}</CardDescription>
                        {weeklyPlan.shoppingList.estimatedCost && (
                          <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-lg space-y-2">
                            <p className="text-sm text-sky-900 dark:text-sky-100 leading-relaxed font-medium">
                              {weeklyPlan.shoppingList.estimatedCost}
                            </p>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {weeklyPlan.shoppingList.categories?.map((category: any, index: number) => (
                          <div key={index}>
                            <h4 className="font-semibold text-base text-foreground mb-4 flex items-center gap-2">
                              <ShoppingCart className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                              {category.category}
                            </h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              {category.items.map((item: any, itemIndex: number) => (
                                <div
                                  key={itemIndex}
                                  className={`p-4 border rounded-lg transition-all ${
                                    item.priority === 'high'
                                      ? 'border-red-200 dark:border-red-800 bg-card hover:bg-red-50/30 dark:hover:bg-red-950/30'
                                      : item.priority === 'medium'
                                      ? 'border-amber-200 dark:border-amber-800 bg-card hover:bg-amber-50/30 dark:hover:bg-amber-950/30'
                                      : 'border-border bg-card hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/30 dark:hover:bg-sky-950/30'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="font-semibold text-sm text-foreground">{item.item}</p>
                                    {item.priority && (
                                      <Badge
                                        className={`text-xs ${
                                          item.priority === 'high'
                                            ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
                                            : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
                                        }`}
                                      >
                                        {item.priority}
                                      </Badge>
                                    )}
                                  </div>
                                  {item.quantity && (
                                    <p className="text-sm text-muted-foreground mt-1">{item.quantity}</p>
                                  )}
                                  {item.notes && (
                                    <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">{item.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                            {index < weeklyPlan.shoppingList.categories.length - 1 && <Separator className="mt-6" />}
                          </div>
                        ))}

                        {weeklyPlan.shoppingList.tips && weeklyPlan.shoppingList.tips.length > 0 && (
                          <>
                            <Separator className="my-6" />
                            <div className="border border-sky-200 dark:border-sky-800 rounded-lg p-4 bg-card hover:bg-sky-50/30 dark:hover:bg-sky-950/30 transition-colors">
                              <h4 className="font-semibold text-base text-foreground mb-3">Dicas de Compra</h4>
                              <ul className="space-y-2">
                                {weeklyPlan.shoppingList.tips.map((tip: string, index: number) => (
                                  <li key={index} className="text-sm text-foreground flex items-start gap-2.5 leading-relaxed">
                                    <span className="text-sky-600 mt-0.5">•</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Meals */}
                  <TabsContent value="meals" className="mt-0">
                    <MealPlanNavigator mealPlan={weeklyPlan.mealPlan} />
                  </TabsContent>

                  {/* Workouts */}
                  <TabsContent value="workouts" className="mt-0">
                    <WorkoutPlanNavigator workoutPlan={weeklyPlan.workoutPlan} />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <Card className="mt-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <p className="text-xs text-amber-900 dark:text-amber-100">
            <strong>⚠️ Aviso Importante:</strong> Estas recomendações são educacionais e <strong>NÃO substituem consulta médica profissional</strong>. Sempre consulte um profissional de saúde qualificado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}