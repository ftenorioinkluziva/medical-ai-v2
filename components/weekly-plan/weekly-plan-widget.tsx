'use client'

/**
 * Weekly Plan Widget - Minimal Health Design
 * Display the latest weekly plan on dashboard
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  Calendar,
  Pill,
  ShoppingCart,
  UtensilsCrossed,
  Dumbbell,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface WeeklyPlan {
  id: string
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
    meals: Array<{ day: string }>
  }
  workoutPlan: {
    overview: string
    workouts: Array<{ day: string; type: string }>
  }
  createdAt: string
}

interface WeeklyPlanWidgetProps {
  patientId?: string
}

export function WeeklyPlanWidget({ patientId }: WeeklyPlanWidgetProps = {}) {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlan()
  }, [patientId])

  const loadPlan = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const endpoint = patientId
        ? `/api/weekly-plan?patientId=${patientId}`
        : '/api/weekly-plan'

      const response = await fetch(endpoint)

      // Diferenciar 404 (nenhum plano) de erro real (500)
      if (response.status === 404) {
        setError('Nenhum plano semanal disponível. Faça sua primeira análise!')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao carregar plano')
      }

      const data = await response.json()
      if (data.plans && data.plans.length > 0) {
        setPlan(data.plans[0]) // Get the most recent plan
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'

      // Only log to console if it's an unexpected error (not the "no plan" case)
      if (!errorMessage.includes('Nenhum plano') &&
          !errorMessage.includes('Realize uma análise médica primeiro')) {
        console.error('Error loading weekly plan:', err)
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
            <p className="text-muted-foreground">Carregando plano semanal...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !plan) {
    const isNoPlan = error && error.includes('Nenhum plano')

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${isNoPlan ? 'bg-sky-50 border-sky-200' : 'bg-red-50 border-red-200'}`}>
            <div className={`p-2 rounded-lg shrink-0 ${isNoPlan ? 'bg-sky-100' : 'bg-red-100'}`}>
              <AlertCircle className={`h-5 w-5 ${isNoPlan ? 'text-sky-600' : 'text-red-600'}`} />
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${isNoPlan ? 'text-sky-900' : 'text-red-900'}`}>
                {isNoPlan ? 'Nenhum plano semanal disponível' : 'Erro ao carregar plano'}
              </p>
              <p className={`text-sm mt-1 ${isNoPlan ? 'text-sky-700' : 'text-red-700'}`}>
                {isNoPlan
                  ? 'Realize uma análise médica para gerar seu primeiro plano semanal personalizado.'
                  : error || 'Ocorreu um erro ao carregar o plano.'}
              </p>
            </div>
            <Button onClick={loadPlan} variant="outline" size="sm" className="ml-auto">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalSupplements = plan.supplementationStrategy.supplements.length
  const totalCategories = plan.shoppingList.categories.length
  const totalMeals = plan.mealPlan.meals.length
  const totalWorkouts = plan.workoutPlan.workouts.length

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-teal-600" />
            Plano Semanal Personalizado
          </CardTitle>
          <CardDescription>
            Semana iniciando em:{' '}
            {format(new Date(plan.weekStartDate), "dd 'de' MMMM", { locale: ptBR })}
            <span className="block mt-1 text-xs opacity-70">
              Gerado em: {format(new Date(plan.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="supplements">Suplementação</TabsTrigger>
            <TabsTrigger value="shopping">Compras</TabsTrigger>
            <TabsTrigger value="meals">Refeições</TabsTrigger>
            <TabsTrigger value="workouts">Treinos</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border border-border rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Pill className="h-4 w-4 text-purple-700" />
                  </div>
                  <h4 className="font-semibold text-foreground">Suplementação</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.supplementationStrategy.overview}
                </p>
                <Badge variant="outline" className="mt-2">{totalSupplements} suplementos</Badge>
              </div>

              <div className="p-4 border border-border rounded-lg hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-emerald-700" />
                  </div>
                  <h4 className="font-semibold text-foreground">Compras</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.shoppingList.overview}
                </p>
                <Badge variant="outline" className="mt-2">{totalCategories} categorias</Badge>
              </div>

              <div className="p-4 border border-border rounded-lg hover:border-orange-300 hover:bg-orange-50/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <UtensilsCrossed className="h-4 w-4 text-orange-700" />
                  </div>
                  <h4 className="font-semibold text-foreground">Refeições</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.mealPlan.overview}
                </p>
                <Badge variant="outline" className="mt-2">{totalMeals} dias planejados</Badge>
              </div>

              <div className="p-4 border border-border rounded-lg hover:border-sky-300 hover:bg-sky-50/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-sky-100 p-2 rounded-lg">
                    <Dumbbell className="h-4 w-4 text-sky-700" />
                  </div>
                  <h4 className="font-semibold text-foreground">Treinos</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.workoutPlan.overview}
                </p>
                <Badge variant="outline" className="mt-2">{totalWorkouts} treinos</Badge>
              </div>
            </div>
          </TabsContent>

          {/* Supplements Tab */}
          <TabsContent value="supplements" className="mt-6">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">{plan.supplementationStrategy.overview}</p>
            </div>
            <div className="space-y-3">
              {plan.supplementationStrategy.supplements.map((supplement, index) => (
                <div key={index} className="p-3 border border-border rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition-all">
                  <div className="flex items-start gap-2">
                    <div className="bg-purple-100 p-1.5 rounded shrink-0">
                      <Pill className="h-3 w-3 text-purple-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{supplement.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {supplement.dosage} - {supplement.timing}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{supplement.purpose}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Shopping Tab */}
          <TabsContent value="shopping" className="mt-6">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">{plan.shoppingList.overview}</p>
            </div>
            <div className="space-y-3">
              {plan.shoppingList.categories.map((category, index) => (
                <div key={index} className="p-3 border border-border rounded-lg hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                  <h4 className="font-semibold text-foreground mb-2">{category.category}</h4>
                  <div className="flex flex-wrap gap-1">
                    {category.items.map((item, idx) => (
                      <Badge key={idx} variant="outline">
                        {item.item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals" className="mt-6">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">{plan.mealPlan.overview}</p>
            </div>
            <div className="space-y-4">
              {plan.mealPlan.meals.map((day: any, index: number) => (
                <div key={index} className="border border-border rounded-lg p-4 bg-card hover:border-orange-300 hover:bg-orange-50/20 transition-all">
                  <h4 className="font-semibold text-foreground mb-4">{day.day}</h4>

                  <div className="space-y-4">
                    {/* Breakfast */}
                    {day.breakfast && (
                      <div>
                        <h5 className="font-semibold text-sm text-orange-600 mb-2">☀️ Café da Manhã</h5>
                        <div className="pl-4 space-y-1">
                          <p className="font-semibold text-sm text-foreground">{day.breakfast.name}</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                            {day.breakfast.ingredients?.map((ing: string, i: number) => (
                              <li key={i}>• {ing}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Lunch */}
                    {day.lunch && (
                      <div>
                        <h5 className="font-semibold text-sm text-emerald-600 mb-2">🌞 Almoço</h5>
                        <div className="pl-4 space-y-1">
                          <p className="font-semibold text-sm text-foreground">{day.lunch.name}</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                            {day.lunch.ingredients?.map((ing: string, i: number) => (
                              <li key={i}>• {ing}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Dinner */}
                    {day.dinner && (
                      <div>
                        <h5 className="font-semibold text-sm text-sky-600 mb-2">🌙 Jantar</h5>
                        <div className="pl-4 space-y-1">
                          <p className="font-semibold text-sm text-foreground">{day.dinner.name}</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                            {day.dinner.ingredients?.map((ing: string, i: number) => (
                              <li key={i}>• {ing}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Snacks */}
                    {day.snacks && day.snacks.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-sm text-purple-600 mb-2">🍎 Lanches</h5>
                        <div className="pl-4 space-y-1">
                          {day.snacks.map((snack: any, i: number) => (
                            <div key={i} className="text-xs">
                              <span className="font-semibold text-foreground">{snack.name}</span>
                              <span className="text-muted-foreground"> ({snack.timing})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="mt-6">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">{plan.workoutPlan.overview}</p>
            </div>
            <div className="space-y-4">
              {plan.workoutPlan.workouts.map((workout: any, index: number) => (
                <div key={index} className="border border-border rounded-lg p-4 bg-card hover:border-sky-300 hover:bg-sky-50/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-foreground">{workout.day}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{workout.type}</p>
                    </div>
                    <div className="flex gap-2">
                      {workout.duration && (
                        <Badge className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800">{workout.duration}</Badge>
                      )}
                      {workout.intensity && (
                        <Badge
                          className={
                            workout.intensity === 'high'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                              : workout.intensity === 'medium'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-accent text-foreground border-border'
                          }
                        >
                          {workout.intensity === 'high' ? 'Alta' : workout.intensity === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {workout.warmup && (
                    <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded text-xs">
                      <strong>Aquecimento:</strong> {workout.warmup}
                    </div>
                  )}

                  <div className="space-y-2">
                    {workout.exercises?.map((exercise: any, exIndex: number) => (
                      <div key={exIndex} className="p-3 bg-muted rounded border border-border hover:border-sky-300 hover:bg-sky-50/30 transition-all">
                        <p className="font-semibold text-sm text-foreground">{exercise.name}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          {exercise.sets && <span>Séries: {exercise.sets}</span>}
                          {exercise.reps && <span>Reps: {exercise.reps}</span>}
                          {exercise.duration && <span>Duração: {exercise.duration}</span>}
                        </div>
                        {exercise.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{exercise.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {workout.cooldown && (
                    <div className="mt-3 p-2 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded text-xs">
                      <strong>Alongamento:</strong> {workout.cooldown}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-center text-muted-foreground">
            ⚕️ Este plano é educacional e não substitui acompanhamento médico profissional.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
