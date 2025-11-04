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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando plano semanal...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="h-8 w-8" />
              Plano Semanal Personalizado
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Seu guia completo de saúde para a semana
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">{error}</p>
            <Button onClick={loadPlans} variant="outline" size="sm" className="ml-auto">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Plans State */}
      {!error && plans.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum plano semanal disponível</h3>
            <p className="text-muted-foreground mb-6">
              Realize uma análise médica para gerar seu primeiro plano semanal personalizado
            </p>
            <Link href="/analyze">
              <Button>Fazer Análise Médica</Button>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Planos Anteriores</CardTitle>
                  <CardDescription>{plans.length} planos gerados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPlan.id === plan.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4" />
                        <p className="text-sm font-medium">
                          {format(new Date(plan.weekStartDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
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
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>
                      Semana de {format(new Date(selectedPlan.weekStartDate), "dd 'de' MMMM", { locale: ptBR })}
                    </CardTitle>
                    <CardDescription>
                      Gerado em: {format(new Date(selectedPlan.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {selectedPlan.agentName && ` • ${selectedPlan.agentName}`}
                    </CardDescription>
                  </div>
                  <Button onClick={() => window.print()} variant="outline">
                    Imprimir
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Tabs for Different Sections */}
            <Tabs defaultValue="supplements" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="supplements" className="gap-2">
                  <Pill className="h-4 w-4" />
                  Suplementação
                </TabsTrigger>
                <TabsTrigger value="shopping" className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Compras
                </TabsTrigger>
                <TabsTrigger value="meals" className="gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  Refeições
                </TabsTrigger>
                <TabsTrigger value="workout" className="gap-2">
                  <Dumbbell className="h-4 w-4" />
                  Treinos
                </TabsTrigger>
              </TabsList>

              {/* Supplementation Tab */}
              <TabsContent value="supplements" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Estratégia de Suplementação</CardTitle>
                    <CardDescription>
                      {selectedPlan.supplementationStrategy.overview}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPlan.supplementationStrategy.supplements?.map((supplement: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">{supplement.name}</h4>
                          <Badge>{supplement.dosage}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="text-muted-foreground">{supplement.timing}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-muted-foreground">{supplement.purpose}</p>
                          </div>
                          {supplement.duration && (
                            <p className="text-xs text-muted-foreground">Duração: {supplement.duration}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {selectedPlan.supplementationStrategy.hormonalSupport &&
                     selectedPlan.supplementationStrategy.hormonalSupport.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3">Suporte Hormonal</h4>
                          <div className="space-y-3">
                            {selectedPlan.supplementationStrategy.hormonalSupport.map((hormone: any, index: number) => (
                              <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <h5 className="font-medium text-purple-900">{hormone.hormone}</h5>
                                <p className="text-sm text-purple-700 mt-1">{hormone.strategy}</p>
                                <p className="text-xs text-purple-600 mt-2">
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
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3">Exames Recomendados para o Próximo Ciclo</h4>
                          <ul className="space-y-2">
                            {selectedPlan.supplementationStrategy.nextExamRecommendations.map((exam: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-primary">•</span>
                                {exam}
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
                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Compras</CardTitle>
                    <CardDescription>{selectedPlan.shoppingList.overview}</CardDescription>
                    {selectedPlan.shoppingList.estimatedCost && (
                      <Badge variant="outline" className="mt-2 w-fit">
                        Custo estimado: {selectedPlan.shoppingList.estimatedCost}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedPlan.shoppingList.categories?.map((category: any, index: number) => (
                      <div key={index}>
                        <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                          {category.category}
                        </h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          {category.items.map((item: any, itemIndex: number) => (
                            <div
                              key={itemIndex}
                              className={`p-3 border rounded-lg ${
                                item.priority === 'high'
                                  ? 'border-red-200 bg-red-50'
                                  : item.priority === 'medium'
                                  ? 'border-yellow-200 bg-yellow-50'
                                  : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <p className="font-medium">{item.item}</p>
                                {item.priority && (
                                  <Badge
                                    variant={item.priority === 'high' ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {item.priority}
                                  </Badge>
                                )}
                              </div>
                              {item.quantity && (
                                <p className="text-sm text-muted-foreground mt-1">{item.quantity}</p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-muted-foreground mt-1 italic">{item.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        {index < selectedPlan.shoppingList.categories.length - 1 && <Separator className="mt-6" />}
                      </div>
                    ))}

                    {selectedPlan.shoppingList.tips && selectedPlan.shoppingList.tips.length > 0 && (
                      <>
                        <Separator />
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold mb-2 text-blue-900">Dicas de Compra</h4>
                          <ul className="space-y-1">
                            {selectedPlan.shoppingList.tips.map((tip: string, index: number) => (
                              <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                                <span className="text-blue-600">•</span>
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

              {/* Meal Plan Tab - Part 1 (will continue in next message) */}
              <TabsContent value="meals" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Plano de Refeições</CardTitle>
                    <CardDescription>{selectedPlan.mealPlan.overview}</CardDescription>
                    {selectedPlan.mealPlan.dailyCalories && (
                      <Badge variant="outline" className="mt-2 w-fit">
                        {selectedPlan.mealPlan.dailyCalories} calorias/dia
                      </Badge>
                    )}
                    {selectedPlan.mealPlan.macros && (
                      <div className="flex gap-2 mt-2">
                        {selectedPlan.mealPlan.macros.protein && (
                          <Badge variant="outline">Proteína: {selectedPlan.mealPlan.macros.protein}</Badge>
                        )}
                        {selectedPlan.mealPlan.macros.carbs && (
                          <Badge variant="outline">Carbos: {selectedPlan.mealPlan.macros.carbs}</Badge>
                        )}
                        {selectedPlan.mealPlan.macros.fats && (
                          <Badge variant="outline">Gorduras: {selectedPlan.mealPlan.macros.fats}</Badge>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedPlan.mealPlan.meals?.map((day: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-bold text-lg mb-4">{day.day}</h4>

                        <div className="space-y-4">
                          {/* Breakfast */}
                          <div>
                            <h5 className="font-semibold text-sm text-orange-600 mb-2">☀️ Café da Manhã</h5>
                            <div className="pl-4 space-y-1">
                              <p className="font-medium">{day.breakfast.name}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                {day.breakfast.calories && <span>📊 {day.breakfast.calories}</span>}
                                {day.breakfast.prepTime && <span>⏱️ {day.breakfast.prepTime}</span>}
                              </div>
                              <ul className="text-sm text-muted-foreground mt-1">
                                {day.breakfast.ingredients.map((ing: string, i: number) => (
                                  <li key={i}>• {ing}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Lunch */}
                          <div>
                            <h5 className="font-semibold text-sm text-green-600 mb-2">🌞 Almoço</h5>
                            <div className="pl-4 space-y-1">
                              <p className="font-medium">{day.lunch.name}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                {day.lunch.calories && <span>📊 {day.lunch.calories}</span>}
                                {day.lunch.prepTime && <span>⏱️ {day.lunch.prepTime}</span>}
                              </div>
                              <ul className="text-sm text-muted-foreground mt-1">
                                {day.lunch.ingredients.map((ing: string, i: number) => (
                                  <li key={i}>• {ing}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Dinner */}
                          <div>
                            <h5 className="font-semibold text-sm text-blue-600 mb-2">🌙 Jantar</h5>
                            <div className="pl-4 space-y-1">
                              <p className="font-medium">{day.dinner.name}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                {day.dinner.calories && <span>📊 {day.dinner.calories}</span>}
                                {day.dinner.prepTime && <span>⏱️ {day.dinner.prepTime}</span>}
                              </div>
                              <ul className="text-sm text-muted-foreground mt-1">
                                {day.dinner.ingredients.map((ing: string, i: number) => (
                                  <li key={i}>• {ing}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Snacks */}
                          {day.snacks && day.snacks.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-sm text-purple-600 mb-2">🍎 Lanches</h5>
                              <div className="pl-4 space-y-2">
                                {day.snacks.map((snack: any, i: number) => (
                                  <div key={i} className="text-sm">
                                    <span className="font-medium">{snack.name}</span>
                                    <span className="text-muted-foreground"> ({snack.timing})</span>
                                    {snack.calories && <span className="text-xs text-muted-foreground ml-2">• {snack.calories}</span>}
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
                        <Separator />
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold mb-2 text-green-900">Dicas de Meal Prep</h4>
                          <ul className="space-y-1">
                            {selectedPlan.mealPlan.mealPrepTips.map((tip: string, index: number) => (
                              <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                                <span className="text-green-600">•</span>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Plano de Treinamento</CardTitle>
                    <CardDescription>{selectedPlan.workoutPlan.overview}</CardDescription>
                    {selectedPlan.workoutPlan.weeklyGoal && (
                      <Badge variant="outline" className="mt-2 w-fit">
                        Meta: {selectedPlan.workoutPlan.weeklyGoal}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedPlan.workoutPlan.workouts?.map((workout: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-lg">{workout.day}</h4>
                            <p className="text-sm text-muted-foreground">{workout.type}</p>
                          </div>
                          <div className="text-right">
                            <Badge>{workout.duration}</Badge>
                            {workout.intensity && (
                              <Badge
                                variant={
                                  workout.intensity === 'high'
                                    ? 'destructive'
                                    : workout.intensity === 'medium'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="ml-2"
                              >
                                {workout.intensity === 'high' ? 'Alta' : workout.intensity === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {workout.warmup && (
                          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm">
                              <strong>Aquecimento:</strong> {workout.warmup}
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          {workout.exercises.map((exercise: any, exIndex: number) => (
                            <div key={exIndex} className="p-3 bg-muted/50 rounded-lg">
                              <p className="font-medium">{exercise.name}</p>
                              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                {exercise.sets && <span>Séries: {exercise.sets}</span>}
                                {exercise.reps && <span>Repetições: {exercise.reps}</span>}
                                {exercise.duration && <span>Duração: {exercise.duration}</span>}
                              </div>
                              {exercise.notes && <p className="text-xs text-muted-foreground mt-1 italic">{exercise.notes}</p>}
                            </div>
                          ))}
                        </div>

                        {workout.cooldown && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm">
                              <strong>Alongamento:</strong> {workout.cooldown}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {selectedPlan.workoutPlan.restDays && selectedPlan.workoutPlan.restDays.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Dias de Descanso</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedPlan.workoutPlan.restDays.join(', ')}
                        </p>
                      </div>
                    )}

                    {selectedPlan.workoutPlan.progressionTips && selectedPlan.workoutPlan.progressionTips.length > 0 && (
                      <>
                        <Separator />
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-semibold mb-2 text-purple-900">Dicas de Progressão</h4>
                          <ul className="space-y-1">
                            {selectedPlan.workoutPlan.progressionTips.map((tip: string, index: number) => (
                              <li key={index} className="text-sm text-purple-800 flex items-start gap-2">
                                <span className="text-purple-600">•</span>
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
            <Card className="mt-6 bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <p className="text-sm text-yellow-900">
                  <strong>⚠️ Aviso Importante:</strong> Este plano semanal é educacional e <strong>NÃO substitui acompanhamento médico, nutricional ou de educador físico profissional</strong>. Sempre consulte profissionais de saúde antes de iniciar qualquer suplementação, mudança alimentar ou programa de exercícios.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
