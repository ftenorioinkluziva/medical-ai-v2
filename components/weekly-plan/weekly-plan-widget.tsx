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
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { MealPlanNavigator } from './meal-plan-navigator'
import { WorkoutPlanNavigator } from './workout-plan-navigator'
import {
  Loader2,
  Calendar,
  Pill,
  ShoppingCart,
  UtensilsCrossed,
  Dumbbell,
  AlertCircle,
  Clock,
  Target,
  RotateCcw,
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
      duration?: string
    }>
    hormonalSupport?: Array<{
      hormone: string
      strategy: string
      monitoring: string
    }>
    nextExamRecommendations?: string[]
  }
  shoppingList: {
    overview: string
    estimatedCost?: string
    tips?: string[]
    categories: Array<{
      category: string
      items: Array<{
        item: string
        quantity?: string
        notes?: string
        priority?: 'high' | 'medium' | 'low'
      }>
    }>
  }
  mealPlan: {
    overview: string
    daily_calories_avg: string
    weekly_plan: Array<{
      day: string
      meals: {
        breakfast: any
        morning_snack: any
        lunch: any
        afternoon_snack: any
        pre_workout: any
        post_workout: any
        dinner: any
        supper: any
      }
    }>
  }
  workoutPlan: {
    overview: string
    weeklyGoal?: string
    workouts: Array<{
      day: string
      type: string
      duration: string
      intensity?: string
      warmup?: string
      exercises: Array<{
        name: string
        sets?: string
        reps?: string
        duration?: string
        notes?: string
      }>
      cooldown?: string
    }>
    restDays?: string[]
    progressionTips?: string[]
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
  const [activeTab, setActiveTab] = useState('supplements')
  const [completedShoppingItems, setCompletedShoppingItems] = useState<Set<string>>(new Set())

  // Load completed shopping items from localStorage when plan changes
  useEffect(() => {
    // Reset completed items when the plan changes
    setCompletedShoppingItems(new Set())

    if (!plan?.id) return

    const key = `shopping-completed-${plan.id}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCompletedShoppingItems(new Set(parsed))
      } catch (e) {
        console.error('[WEEKLY-PLAN] Error loading completed shopping items:', e)
      }
    }
  }, [plan?.id])

  // Save completed shopping items to localStorage whenever it changes
  useEffect(() => {
    if (!plan?.id) return

    try {
      const key = `shopping-completed-${plan.id}`
      localStorage.setItem(key, JSON.stringify(Array.from(completedShoppingItems)))
    } catch (e) {
      console.error('[WEEKLY-PLAN] Error saving completed shopping items:', e)
    }
  }, [completedShoppingItems, plan?.id])

  const toggleShoppingItemCompleted = (itemKey: string) => {
    setCompletedShoppingItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey)
      } else {
        newSet.add(itemKey)
      }
      return newSet
    })
  }

  const resetCompletedShoppingItems = () => {
    setCompletedShoppingItems(new Set())
    if (plan?.id) {
      localStorage.removeItem(`shopping-completed-${plan.id}`)
    }
  }

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
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${isNoPlan ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'}`}>
            <div className={`p-2 rounded-lg shrink-0 ${isNoPlan ? 'bg-sky-100 dark:bg-sky-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <AlertCircle className={`h-5 w-5 ${isNoPlan ? 'text-sky-600 dark:text-sky-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${isNoPlan ? 'text-sky-900 dark:text-sky-200' : 'text-red-900 dark:text-red-200'}`}>
                {isNoPlan ? 'Nenhum plano semanal disponível' : 'Erro ao carregar plano'}
              </p>
              <p className={`text-sm mt-1 ${isNoPlan ? 'text-sky-700 dark:text-sky-400' : 'text-red-700 dark:text-red-400'}`}>
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

  const totalSupplements = plan.supplementationStrategy?.supplements?.length || 0
  const totalCategories = plan.shoppingList?.categories?.length || 0
  const totalMeals = plan.mealPlan?.weekly_plan?.length || 0
  const totalWorkouts = plan.workoutPlan?.workouts?.length || 0

  const getSectionTitle = (tab: string) => {
    switch (tab) {
      case 'supplements':
        return 'Suplementação'
      case 'shopping':
        return 'Compras'
      case 'meals':
        return 'Refeições'
      case 'workouts':
        return 'Treinos'
      default:
        return ''
    }
  }

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
        <Tabs defaultValue="supplements" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="supplements" className="data-[state=active]:!bg-purple-600 dark:data-[state=active]:!bg-purple-500 data-[state=active]:!text-white">
              <Pill className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="shopping" className="data-[state=active]:!bg-sky-600 dark:data-[state=active]:!bg-sky-500 data-[state=active]:!text-white">
              <ShoppingCart className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="meals" className="data-[state=active]:!bg-orange-600 dark:data-[state=active]:!bg-orange-500 data-[state=active]:!text-white">
              <UtensilsCrossed className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="workouts" className="data-[state=active]:!bg-emerald-600 dark:data-[state=active]:!bg-emerald-500 data-[state=active]:!text-white">
              <Dumbbell className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          {/* Section Title */}
          <div className="mt-4 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{getSectionTitle(activeTab)}</h3>
          </div>

          {/* Overview Tab 
          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border border-border rounded-lg hover:border-purple-300 hover:bg-purple-50/30 dark:hover:bg-purple-950/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                    <Pill className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-foreground">Suplementação</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.supplementationStrategy.overview}
                </p>
                <Badge variant="outline" className="mt-2">{totalSupplements} suplementos</Badge>
              </div>

              <div className="p-4 border border-border rounded-lg hover:border-emerald-300 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-semibold text-foreground">Compras</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.shoppingList.overview}
                </p>
                <Badge variant="outline" className="mt-2">{totalCategories} categorias</Badge>
              </div>

              <div className="p-4 border border-border rounded-lg hover:border-orange-300 hover:bg-orange-50/30 dark:hover:bg-orange-950/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
                    <UtensilsCrossed className="h-4 w-4 text-orange-700 dark:text-orange-400" />
                  </div>
                  <h4 className="font-semibold text-foreground">Refeições</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.mealPlan.overview}
                </p>
                <Badge variant="outline" className="mt-2">{totalMeals} dias planejados</Badge>
              </div>

              <div className="p-4 border border-border rounded-lg hover:border-sky-300 hover:bg-sky-50/30 dark:hover:bg-sky-950/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-sky-100 dark:bg-sky-900/20 p-2 rounded-lg">
                    <Dumbbell className="h-4 w-4 text-sky-700 dark:text-sky-400" />
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
*/}
          {/* Supplements Tab */}
          <TabsContent value="supplements" className="mt-0">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{plan.supplementationStrategy?.overview}</p>
            </div>
            <div className="space-y-4">
              {plan.supplementationStrategy?.supplements?.map((supplement: any, index: number) => (
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

              {plan.supplementationStrategy?.hormonalSupport &&
                plan.supplementationStrategy?.hormonalSupport?.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h4 className="font-semibold text-base text-foreground mb-4">Suporte Hormonal</h4>
                      <div className="space-y-3">
                        {plan.supplementationStrategy?.hormonalSupport?.map((hormone: any, index: number) => (
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

              {plan.supplementationStrategy?.nextExamRecommendations &&
                plan.supplementationStrategy?.nextExamRecommendations?.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h4 className="font-semibold text-base text-foreground mb-4">Exames Recomendados para o Próximo Ciclo</h4>
                      <ul className="space-y-2.5">
                        {plan.supplementationStrategy?.nextExamRecommendations?.map((exam: string, index: number) => (
                          <li key={index} className="flex items-start gap-2.5 text-sm">
                            <span className="text-teal-600 mt-0.5">•</span>
                            <span className="text-foreground leading-relaxed">{exam}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
            </div>
          </TabsContent>

          {/* Shopping Tab */}
          <TabsContent value="shopping" className="mt-0">
            <div className="mb-4">
              {plan.shoppingList?.estimatedCost && (
                <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-lg space-y-2">
                  <p className="text-sm text-sky-900 dark:text-sky-100 leading-relaxed font-medium">
                    {plan.shoppingList?.estimatedCost}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-foreground">Lista de Compras</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={resetCompletedShoppingItems}
                className="gap-2 text-muted-foreground hover:text-foreground h-8"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Resetar</span>
              </Button>
            </div>
            <div className="space-y-6">
              {plan.shoppingList?.categories?.map((category: any, index: number) => (
                <div key={index}>
                  <h4 className="font-semibold text-base text-foreground mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                    {category.category}
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {category.items.map((item: any, itemIndex: number) => {
                      const itemKey = `${category.category}-${itemIndex}-${item.item}-${item.quantity || ''}`
                      const isCompleted = completedShoppingItems.has(itemKey)

                      return (
                        <div
                          key={itemKey}
                          className={`p-4 border rounded-lg transition-all ${isCompleted
                            ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 opacity-75'
                            : item.priority === 'high'
                              ? 'border-red-200 dark:border-red-800 bg-card hover:bg-red-50/30 dark:hover:bg-red-950/30'
                              : item.priority === 'medium'
                                ? 'border-amber-200 dark:border-amber-800 bg-card hover:bg-amber-50/30 dark:hover:bg-amber-950/30'
                                : 'border-border bg-card hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/30 dark:hover:bg-sky-950/30'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={itemKey}
                              checked={isCompleted}
                              onCheckedChange={() => toggleShoppingItemCompleted(itemKey)}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <label
                                  htmlFor={itemKey}
                                  className={`font-semibold text-sm cursor-pointer ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                                    }`}
                                >
                                  {item.item}
                                </label>
                                {item.priority && !isCompleted && (
                                  <Badge
                                    className={`text-xs ml-2 ${item.priority === 'high'
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
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {index < (plan.shoppingList?.categories?.length || 0) - 1 && <Separator className="mt-6" />}
                </div>
              ))}

              {plan.shoppingList?.tips && plan.shoppingList?.tips?.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div className="border border-sky-200 dark:border-sky-800 rounded-lg p-4 bg-card hover:bg-sky-50/30 dark:hover:bg-sky-950/30 transition-colors">
                    <h4 className="font-semibold text-base text-foreground mb-3">Dicas de Compra</h4>
                    <ul className="space-y-2">
                      {plan.shoppingList?.tips?.map((tip: string, index: number) => (
                        <li key={index} className="text-sm text-foreground flex items-start gap-2.5 leading-relaxed">
                          <span className="text-sky-600 mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals" className="mt-0">
            <MealPlanNavigator mealPlan={plan.mealPlan} />
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="mt-0">
            <WorkoutPlanNavigator workoutPlan={plan.workoutPlan} />
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
