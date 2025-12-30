'use client'

/**
 * Complete Analysis Result View
 * Renders the full results of a complete analysis, applying consistent UI patterns.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  FileText,
  Pill,
  ShoppingCart,
  Target,
  UtensilsCrossed,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { Button } from '../ui/button'

interface CompleteAnalysis {
  id: string
  createdAt: string
  documentIds: string[]
  synthesis: {
    executiveSummary: string
    keyFindings: string[]
  }
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
  const { synthesis, recommendations, weeklyPlan } = analysis

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

      {/* Synthesis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Síntese Executiva
          </CardTitle>
          <CardDescription>{synthesis.executiveSummary}</CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold mb-3">Principais Achados:</h4>
          <ul className="space-y-2">
            {synthesis.keyFindings.map((finding, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{finding}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted">
          <TabsTrigger value="recommendations" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Recomendações e Metas</span>
            <span className="sm:hidden">Metas</span>
          </TabsTrigger>
          <TabsTrigger value="weekly-plan" className="gap-1.5 sm:gap-2 data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Plano Semanal</span>
            <span className="sm:hidden">Plano</span>
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="mt-6">
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

        {/* Weekly Plan Tab */}
        <TabsContent value="weekly-plan" className="mt-6">
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
                  <TabsContent value="supplements" className="mt-0 space-y-3">
                    <p className="text-sm text-muted-foreground mb-4">{weeklyPlan.supplementationStrategy.overview}</p>
                    {weeklyPlan.supplementationStrategy.supplements.map((item: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg hover:border-purple-300 hover:bg-purple-50/30 dark:hover:bg-purple-950/30 transition-all">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.dosage} - {item.timing}</p>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Shopping */}
                  <TabsContent value="shopping" className="mt-0 space-y-3">
                    <p className="text-sm text-muted-foreground mb-4">{weeklyPlan.shoppingList.overview}</p>
                    {weeklyPlan.shoppingList.categories.map((cat: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg hover:border-emerald-300 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-all">
                        <h4 className="font-semibold mb-2">{cat.category}</h4>
                        <div className="flex flex-wrap gap-1">
                          {cat.items.map((item: any, idx: number) => <Badge key={idx} variant="outline">{item.item}</Badge>)}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Meals */}
                  <TabsContent value="meals" className="mt-0 space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">{weeklyPlan.mealPlan.overview}</p>
                    {weeklyPlan.mealPlan.meals.map((day: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 hover:border-orange-300 hover:bg-orange-50/20 dark:hover:bg-orange-950/20 transition-all">
                        <h4 className="font-semibold text-foreground mb-2">{day.day}</h4>
                        {/* O conteúdo detalhado das refeições iria aqui */}
                      </div>
                    ))}
                  </TabsContent>

                  {/* Workouts */}
                  <TabsContent value="workouts" className="mt-0 space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">{weeklyPlan.workoutPlan.overview}</p>
                    {weeklyPlan.workoutPlan.workouts.map((workout: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 hover:border-sky-300 hover:bg-sky-50/20 dark:hover:bg-sky-950/20 transition-all">
                        <h4 className="font-semibold text-foreground">{workout.day} - {workout.type}</h4>
                        {/* O conteúdo detalhado dos treinos iria aqui */}
                      </div>
                    ))}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
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