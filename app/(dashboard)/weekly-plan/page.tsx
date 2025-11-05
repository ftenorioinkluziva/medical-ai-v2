'use client'

/**
 * Weekly Plan Page
 * Complete view of weekly health plan
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  Calendar,
  Pill,
  ShoppingCart,
  UtensilsCrossed,
  Dumbbell,
  AlertCircle,
  ArrowLeft,
  FileText,
  Clock,
  Target,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface WeeklyPlan {
  id: string
  weekStartDate: string
  supplementationStrategy: any
  shoppingList: any
  mealPlan: any
  workoutPlan: any
  createdAt: string
  agentName?: string
  agentColor?: string
}

export default function WeeklyPlanPage() {
  const [plans, setPlans] = useState<WeeklyPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<WeeklyPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/weekly-plan')
      if (!response.ok) {
        throw new Error('Erro ao carregar planos')
      }

      const data = await response.json()
      setPlans(data.plans || [])
      if (data.plans && data.plans.length > 0) {
        setSelectedPlan(data.plans[0]) // Select most recent
      }
    } catch (err) {
      console.error('Error loading plans:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
            <p className="text-sm text-gray-600">Carregando plano semanal...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <Calendar className="h-6 w-6 text-teal-600" />
            Plano Semanal Personalizado
          </h1>
          <p className="text-gray-600 mt-1">
            Seu guia completo de saúde para a semana
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50/30 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={loadPlans} variant="outline" size="sm" className="ml-auto">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Plans State */}
      {!error && plans.length === 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-12 text-center">
            <div className="bg-teal-50 rounded-lg p-4 mb-4 inline-block">
              <FileText className="h-12 w-12 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum plano semanal disponível</h3>
            <p className="text-sm text-gray-600 mb-6">
              Realize uma análise médica para gerar seu primeiro plano semanal personalizado
            </p>
            <Link href="/analyze">
              <Button className="bg-teal-600 hover:bg-teal-700">Fazer Análise Médica</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Plans List & Detail View */}
      {selectedPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Plans History */}
          {plans.length > 1 && (
            <div className="lg:col-span-1">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Planos Anteriores</CardTitle>
                  <CardDescription className="text-sm text-gray-600">{plans.length} planos gerados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPlan.id === plan.id
                          ? 'border-teal-300 bg-teal-50 shadow-sm'
                          : 'border-gray-200 hover:border-teal-200 hover:bg-teal-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Calendar className="h-4 w-4 text-teal-600" />
                        <p className="text-sm font-semibold text-gray-900">
                          {format(new Date(plan.weekStartDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {format(new Date(plan.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className={plans.length > 1 ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {/* Plan Info Card */}
            <Card className="mb-6 hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Semana de {format(new Date(selectedPlan.weekStartDate), "dd 'de' MMMM", { locale: ptBR })}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1">
                      Gerado em: {format(new Date(selectedPlan.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {selectedPlan.agentName && ` • ${selectedPlan.agentName}`}
                    </CardDescription>
                  </div>
                  <Button onClick={() => window.print()} variant="outline" className="text-gray-700">
                    Imprimir
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Tabs for Different Sections */}
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

              {/* Supplementation Tab */}
              <TabsContent value="supplements" className="mt-6 space-y-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">Estratégia de Suplementação</CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {selectedPlan.supplementationStrategy.overview}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPlan.supplementationStrategy.supplements?.map((supplement: any, index: number) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white hover:border-purple-300 hover:bg-purple-50/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-base text-gray-900">{supplement.name}</h4>
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">{supplement.dosage}</Badge>
                        </div>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500 shrink-0" />
                            <p className="text-gray-600">{supplement.timing}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                            <p className="text-gray-600 leading-relaxed">{supplement.purpose}</p>
                          </div>
                          {supplement.duration && (
                            <p className="text-xs text-gray-500 mt-2">Duração: {supplement.duration}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {selectedPlan.supplementationStrategy.hormonalSupport &&
                     selectedPlan.supplementationStrategy.hormonalSupport.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <h4 className="font-semibold text-base text-gray-900 mb-4">Suporte Hormonal</h4>
                          <div className="space-y-3">
                            {selectedPlan.supplementationStrategy.hormonalSupport.map((hormone: any, index: number) => (
                              <div key={index} className="p-4 border border-purple-200 rounded-lg bg-white hover:bg-purple-50/30 transition-colors">
                                <h5 className="font-semibold text-sm text-gray-900">{hormone.hormone}</h5>
                                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{hormone.strategy}</p>
                                <p className="text-xs text-gray-600 mt-2">
                                  Monitoramento: {hormone.monitoring}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedPlan.supplementationStrategy.nextExamRecommendations &&
                     selectedPlan.supplementationStrategy.nextExamRecommendations.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <h4 className="font-semibold text-base text-gray-900 mb-4">Exames Recomendados para o Próximo Ciclo</h4>
                          <ul className="space-y-2.5">
                            {selectedPlan.supplementationStrategy.nextExamRecommendations.map((exam: string, index: number) => (
                              <li key={index} className="flex items-start gap-2.5 text-sm">
                                <span className="text-teal-600 mt-0.5">•</span>
                                <span className="text-gray-700 leading-relaxed">{exam}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Shopping List Tab */}
              <TabsContent value="shopping" className="mt-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">Lista de Compras</CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1 leading-relaxed">{selectedPlan.shoppingList.overview}</CardDescription>
                    {selectedPlan.shoppingList.estimatedCost && (
                      <div className="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-lg space-y-2">
                        <p className="text-sm text-sky-900 leading-relaxed font-medium">
                          {selectedPlan.shoppingList.estimatedCost}
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedPlan.shoppingList.categories?.map((category: any, index: number) => (
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
                                        : 'bg-amber-100 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    {item.priority}
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
                        {index < selectedPlan.shoppingList.categories.length - 1 && <Separator className="mt-6" />}
                      </div>
                    ))}

                    {selectedPlan.shoppingList.tips && selectedPlan.shoppingList.tips.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div className="border border-sky-200 rounded-lg p-4 bg-white hover:bg-sky-50/30 transition-colors">
                          <h4 className="font-semibold text-base text-gray-900 mb-3">Dicas de Compra</h4>
                          <ul className="space-y-2">
                            {selectedPlan.shoppingList.tips.map((tip: string, index: number) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
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

              {/* Meal Plan Tab */}
              <TabsContent value="meals" className="mt-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">Plano de Refeições</CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1 leading-relaxed">{selectedPlan.mealPlan.overview}</CardDescription>
                    {(selectedPlan.mealPlan.dailyCalories || selectedPlan.mealPlan.macros) && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
                        {selectedPlan.mealPlan.dailyCalories && (
                          <p className="text-sm text-orange-900 font-medium">
                            {selectedPlan.mealPlan.dailyCalories} calorias/dia
                          </p>
                        )}
                        {selectedPlan.mealPlan.macros && (
                          <div className="flex gap-3 flex-wrap text-sm text-orange-900">
                            {selectedPlan.mealPlan.macros.protein && (
                              <span>Proteína: {selectedPlan.mealPlan.macros.protein}</span>
                            )}
                            {selectedPlan.mealPlan.macros.carbs && (
                              <span>• Carbos: {selectedPlan.mealPlan.macros.carbs}</span>
                            )}
                            {selectedPlan.mealPlan.macros.fats && (
                              <span>• Gorduras: {selectedPlan.mealPlan.macros.fats}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedPlan.mealPlan.meals?.map((day: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-5 bg-white hover:border-orange-300 hover:bg-orange-50/20 transition-all">
                        <h4 className="font-semibold text-base text-gray-900 mb-5">{day.day}</h4>

                        <div className="space-y-5">
                          {/* Breakfast */}
                          <div>
                            <h5 className="font-semibold text-sm text-orange-600 mb-3">☀️ Café da Manhã</h5>
                            <div className="pl-4 space-y-2">
                              <p className="font-semibold text-sm text-gray-900">{day.breakfast.name}</p>
                              <div className="flex gap-3 text-xs text-gray-600">
                                {day.breakfast.calories && <span>📊 {day.breakfast.calories}</span>}
                                {day.breakfast.prepTime && <span>⏱️ {day.breakfast.prepTime}</span>}
                              </div>
                              <ul className="text-sm text-gray-600 space-y-1 mt-2 leading-relaxed">
                                {day.breakfast.ingredients.map((ing: string, i: number) => (
                                  <li key={i}>• {ing}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Lunch */}
                          <div>
                            <h5 className="font-semibold text-sm text-emerald-600 mb-3">🌞 Almoço</h5>
                            <div className="pl-4 space-y-2">
                              <p className="font-semibold text-sm text-gray-900">{day.lunch.name}</p>
                              <div className="flex gap-3 text-xs text-gray-600">
                                {day.lunch.calories && <span>📊 {day.lunch.calories}</span>}
                                {day.lunch.prepTime && <span>⏱️ {day.lunch.prepTime}</span>}
                              </div>
                              <ul className="text-sm text-gray-600 space-y-1 mt-2 leading-relaxed">
                                {day.lunch.ingredients.map((ing: string, i: number) => (
                                  <li key={i}>• {ing}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Dinner */}
                          <div>
                            <h5 className="font-semibold text-sm text-sky-600 mb-3">🌙 Jantar</h5>
                            <div className="pl-4 space-y-2">
                              <p className="font-semibold text-sm text-gray-900">{day.dinner.name}</p>
                              <div className="flex gap-3 text-xs text-gray-600">
                                {day.dinner.calories && <span>📊 {day.dinner.calories}</span>}
                                {day.dinner.prepTime && <span>⏱️ {day.dinner.prepTime}</span>}
                              </div>
                              <ul className="text-sm text-gray-600 space-y-1 mt-2 leading-relaxed">
                                {day.dinner.ingredients.map((ing: string, i: number) => (
                                  <li key={i}>• {ing}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Snacks */}
                          {day.snacks && day.snacks.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-sm text-purple-600 mb-3">🍎 Lanches</h5>
                              <div className="pl-4 space-y-2">
                                {day.snacks.map((snack: any, i: number) => (
                                  <div key={i} className="text-sm">
                                    <span className="font-semibold text-gray-900">{snack.name}</span>
                                    <span className="text-gray-600"> ({snack.timing})</span>
                                    {snack.calories && <span className="text-xs text-gray-500 ml-2">• {snack.calories}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {selectedPlan.mealPlan.mealPrepTips && selectedPlan.mealPlan.mealPrepTips.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div className="border border-orange-200 rounded-lg p-4 bg-white hover:bg-orange-50/30 transition-colors">
                          <h4 className="font-semibold text-base text-gray-900 mb-3">Dicas de Meal Prep</h4>
                          <ul className="space-y-2">
                            {selectedPlan.mealPlan.mealPrepTips.map((tip: string, index: number) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                                <span className="text-orange-600 mt-0.5">•</span>
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

              {/* Workout Plan Tab */}
              <TabsContent value="workout" className="mt-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">Plano de Treinamento</CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1 leading-relaxed">{selectedPlan.workoutPlan.overview}</CardDescription>
                    {selectedPlan.workoutPlan.weeklyGoal && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-sm text-emerald-900 font-medium">
                          Meta: {selectedPlan.workoutPlan.weeklyGoal}
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedPlan.workoutPlan.workouts?.map((workout: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-5 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 transition-all">
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            <h4 className="font-semibold text-base text-gray-900">{workout.day}</h4>
                            <p className="text-sm text-gray-600 mt-1">{workout.type}</p>
                          </div>
                          <div className="text-right flex gap-2">
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{workout.duration}</Badge>
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
                                {workout.intensity === 'high' ? 'Alta' : workout.intensity === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {workout.warmup && (
                          <div className="mb-4 p-3 border border-amber-200 rounded-lg bg-white hover:bg-amber-50/30 transition-colors">
                            <p className="text-sm text-gray-700">
                              <strong className="text-gray-900">Aquecimento:</strong> {workout.warmup}
                            </p>
                          </div>
                        )}

                        <div className="space-y-3">
                          {workout.exercises.map((exercise: any, exIndex: number) => (
                            <div key={exIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                              <p className="font-semibold text-sm text-gray-900">{exercise.name}</p>
                              <div className="flex gap-4 text-sm text-gray-600 mt-2">
                                {exercise.sets && <span>Séries: {exercise.sets}</span>}
                                {exercise.reps && <span>Repetições: {exercise.reps}</span>}
                                {exercise.duration && <span>Duração: {exercise.duration}</span>}
                              </div>
                              {exercise.notes && <p className="text-xs text-gray-500 mt-2 italic leading-relaxed">{exercise.notes}</p>}
                            </div>
                          ))}
                        </div>

                        {workout.cooldown && (
                          <div className="mt-4 p-3 border border-sky-200 rounded-lg bg-white hover:bg-sky-50/30 transition-colors">
                            <p className="text-sm text-gray-700">
                              <strong className="text-gray-900">Alongamento:</strong> {workout.cooldown}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {selectedPlan.workoutPlan.restDays && selectedPlan.workoutPlan.restDays.length > 0 && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                        <h4 className="font-semibold text-base text-gray-900 mb-2">Dias de Descanso</h4>
                        <p className="text-sm text-gray-600">
                          {selectedPlan.workoutPlan.restDays.join(', ')}
                        </p>
                      </div>
                    )}

                    {selectedPlan.workoutPlan.progressionTips && selectedPlan.workoutPlan.progressionTips.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div className="border border-emerald-200 rounded-lg p-4 bg-white hover:bg-emerald-50/30 transition-colors">
                          <h4 className="font-semibold text-base text-gray-900 mb-3">Dicas de Progressão</h4>
                          <ul className="space-y-2">
                            {selectedPlan.workoutPlan.progressionTips.map((tip: string, index: number) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed">
                                <span className="text-emerald-600 mt-0.5">•</span>
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
            </Tabs>

            {/* Disclaimer */}
            <Card className="mt-6 border-amber-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong className="text-amber-700">⚠️ Aviso Importante:</strong> Este plano semanal é educacional e <strong>NÃO substitui acompanhamento médico, nutricional ou de educador físico profissional</strong>. Sempre consulte profissionais de saúde antes de iniciar qualquer suplementação, mudança alimentar ou programa de exercícios.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
