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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { MealPlanNavigator } from '@/components/weekly-plan/meal-plan-navigator'
import { WorkoutPlanNavigator } from '@/components/weekly-plan/workout-plan-navigator'
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
  RefreshCw,
  RotateCcw,
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('supplements')
  const [completedShoppingItems, setCompletedShoppingItems] = useState<Set<string>>(new Set())

  // Load completed shopping items from localStorage when plan changes
  useEffect(() => {
    // Reset completed items when the plan changes to avoid state leakage
    setCompletedShoppingItems(new Set())

    if (!selectedPlan?.id) return

    const key = `shopping-completed-${selectedPlan.id}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCompletedShoppingItems(new Set(parsed))
      } catch (e) {
        console.error('[WEEKLY-PLAN] Error loading completed shopping items:', e)
      }
    }
  }, [selectedPlan?.id])

  // Save completed shopping items to localStorage whenever it changes
  useEffect(() => {
    if (!selectedPlan?.id) return

    try {
      const key = `shopping-completed-${selectedPlan.id}`
      localStorage.setItem(key, JSON.stringify(Array.from(completedShoppingItems)))
    } catch (e) {
      console.error('[WEEKLY-PLAN] Error saving completed shopping items:', e)
    }
  }, [completedShoppingItems, selectedPlan?.id])

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
    if (selectedPlan?.id) {
      localStorage.removeItem(`shopping-completed-${selectedPlan.id}`)
    }
  }

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

      // Generate weekly plan
      const response = await fetch('/api/weekly-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: latestAnalysis.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao gerar plano semanal')
      }

      toast.success('Plano semanal gerado com sucesso!')
      await loadPlans() // Reload plans
    } catch (error) {
      console.error('Error generating weekly plan:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar plano semanal')
    } finally {
      setIsGenerating(false)
    }
  }

  const getSectionTitle = (tab: string) => {
    switch (tab) {
      case 'supplements':
        return 'Suplementação'
      case 'shopping':
        return 'Compras'
      case 'meals':
        return 'Refeições'
      case 'workout':
        return 'Treinos'
      default:
        return ''
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600 dark:text-teal-400" />
            <p className="text-sm text-muted-foreground">Carregando plano semanal...</p>
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
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
            <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Plano Semanal Personalizado
          </h1>
          <p className="text-muted-foreground mt-1">
            Seu guia completo de saúde para a semana
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20 hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
            <div className="bg-teal-50 dark:bg-teal-950/20 rounded-lg p-4 mb-4 inline-block">
              <FileText className="h-12 w-12 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum plano semanal disponível</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Gere um plano semanal a partir da sua última análise ou realize uma nova análise médica
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleGenerateFromLatestAnalysis}
                disabled={isGenerating}
                className="bg-teal-600 hover:bg-teal-700"
              >
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
      )}

      {/* Plans List & Detail View */}
      {selectedPlan && (
        <div className="space-y-4">
          {/* Plan Selector - Only show if multiple plans */}
          {plans.length > 1 && (
            <Card>
              <CardContent className="pt-0 pb-1 flex items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Selecionar Plano:
                  </label>
                  <Select
                    value={selectedPlan.id}
                    onValueChange={(value) => {
                      const plan = plans.find(p => p.id === value)
                      if (plan) setSelectedPlan(plan)
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-teal-600" />
                            <span>
                              Semana de {format(new Date(plan.weekStartDate), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({format(new Date(plan.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div>
            {/* Plan Info Card */}
            <Card className="mb-6 hover:shadow-md transition-shadow">
              <CardHeader className="pb-0">
                <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                  Semana de {format(new Date(selectedPlan.weekStartDate), "dd 'de' MMMM", { locale: ptBR })}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Gerado em: {format(new Date(selectedPlan.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  {selectedPlan.agentName && ` • ${selectedPlan.agentName}`}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Tabs for Different Sections */}
            <Tabs defaultValue="supplements" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted">
                <TabsTrigger value="supplements" className="data-[state=active]:bg-purple-600 dark:data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <Pill className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="shopping" className="data-[state=active]:bg-sky-600 dark:data-[state=active]:bg-sky-500 data-[state=active]:text-white">
                  <ShoppingCart className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="meals" className="data-[state=active]:bg-orange-600 dark:data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  <UtensilsCrossed className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="workout" className="data-[state=active]:bg-emerald-600 dark:data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  <Dumbbell className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              {/* Section Title */}
              <div className="mt-4 mb-2">
                <h3 className="text-lg font-semibold text-foreground">{getSectionTitle(activeTab)}</h3>
              </div>

              {/* Supplementation Tab */}
              <TabsContent value="supplements" className="mt-0 space-y-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-foreground">Estratégia de Suplementação</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {selectedPlan.supplementationStrategy.overview}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPlan.supplementationStrategy.supplements?.map((supplement: any, index: number) => (
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

                    {selectedPlan.supplementationStrategy.hormonalSupport &&
                     selectedPlan.supplementationStrategy.hormonalSupport.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <h4 className="font-semibold text-base text-foreground mb-4">Suporte Hormonal</h4>
                          <div className="space-y-3">
                            {selectedPlan.supplementationStrategy.hormonalSupport.map((hormone: any, index: number) => (
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

                    {selectedPlan.supplementationStrategy.nextExamRecommendations &&
                     selectedPlan.supplementationStrategy.nextExamRecommendations.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <h4 className="font-semibold text-base text-foreground mb-4">Exames Recomendados para o Próximo Ciclo</h4>
                          <ul className="space-y-2.5">
                            {selectedPlan.supplementationStrategy.nextExamRecommendations.map((exam: string, index: number) => (
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

              {/* Shopping List Tab */}
              <TabsContent value="shopping" className="mt-0">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-foreground">Lista de Compras</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1 leading-relaxed">{selectedPlan.shoppingList.overview}</CardDescription>
                    {selectedPlan.shoppingList.estimatedCost && (
                      <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-lg space-y-2">
                        <p className="text-sm text-sky-900 dark:text-sky-100 leading-relaxed font-medium">
                          {selectedPlan.shoppingList.estimatedCost}
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetCompletedShoppingItems}
                        className="gap-2 text-muted-foreground hover:text-foreground h-8"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline text-xs">Resetar Lista</span>
                      </Button>
                    </div>
                    {selectedPlan.shoppingList.categories?.map((category: any, index: number) => (
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
                                className={`p-4 border rounded-lg transition-all ${
                                  isCompleted
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
                                        className={`font-semibold text-sm cursor-pointer ${
                                          isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                                        }`}
                                      >
                                        {item.item}
                                      </label>
                                      {item.priority && !isCompleted && (
                                        <Badge
                                          className={`text-xs ml-2 ${
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
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        {index < selectedPlan.shoppingList.categories.length - 1 && <Separator className="mt-6" />}
                      </div>
                    ))}

                    {selectedPlan.shoppingList.tips && selectedPlan.shoppingList.tips.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div className="border border-sky-200 dark:border-sky-800 rounded-lg p-4 bg-card hover:bg-sky-50/30 dark:hover:bg-sky-950/30 transition-colors">
                          <h4 className="font-semibold text-base text-foreground mb-3">Dicas de Compra</h4>
                          <ul className="space-y-2">
                            {selectedPlan.shoppingList.tips.map((tip: string, index: number) => (
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

              {/* Meal Plan Tab */}
              <TabsContent value="meals" className="mt-0">
                <MealPlanNavigator mealPlan={selectedPlan.mealPlan} />
              </TabsContent>

              {/* Workout Plan Tab */}
              <TabsContent value="workout" className="mt-0">
                <WorkoutPlanNavigator workoutPlan={selectedPlan.workoutPlan} />
              </TabsContent>
            </Tabs>

            {/* Disclaimer */}
            <Card className="mt-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <p className="text-sm text-foreground leading-relaxed">
                  <strong className="text-amber-700 dark:text-amber-400">⚠️ Aviso Importante:</strong> Este plano semanal é educacional e <strong>NÃO substitui acompanhamento médico, nutricional ou de educador físico profissional</strong>. Sempre consulte profissionais de saúde antes de iniciar qualquer suplementação, mudança alimentar ou programa de exercícios.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
