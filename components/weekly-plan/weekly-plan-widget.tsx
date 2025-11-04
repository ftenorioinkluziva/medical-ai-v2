'use client'

/**
 * Weekly Plan Widget
 * Display the latest weekly plan on dashboard
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  ArrowRight,
  Sparkles,
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

export function WeeklyPlanWidget() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlan()
  }, [])

  const loadPlan = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/weekly-plan')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao carregar plano')
      }

      const data = await response.json()
      if (data.plans && data.plans.length > 0) {
        setPlan(data.plans[0]) // Get the most recent plan
      }
    } catch (err) {
      console.error('Error loading weekly plan:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando plano semanal...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !plan) {
    const isNoPlan = error && error.includes('Nenhum plano')

    return (
      <Card className={isNoPlan ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              className={`h-5 w-5 flex-shrink-0 ${isNoPlan ? 'text-blue-600' : 'text-red-600'}`}
            />
            <div className="flex-1">
              <p className={`font-medium ${isNoPlan ? 'text-blue-900' : 'text-red-900'}`}>
                {isNoPlan ? 'Nenhum plano semanal disponível' : 'Erro ao carregar plano'}
              </p>
              <p className={`text-sm mt-1 ${isNoPlan ? 'text-blue-700' : 'text-red-700'}`}>
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
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
          <Link href="/weekly-plan">
            <Button variant="ghost" size="sm" className="gap-2">
              Ver Completo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="supplements">
              <Pill className="h-4 w-4 mr-1" />
              {totalSupplements}
            </TabsTrigger>
            <TabsTrigger value="shopping">
              <ShoppingCart className="h-4 w-4 mr-1" />
              {totalCategories}
            </TabsTrigger>
            <TabsTrigger value="meals">
              <UtensilsCrossed className="h-4 w-4 mr-1" />
              {totalMeals}
            </TabsTrigger>
            <TabsTrigger value="workouts">
              <Dumbbell className="h-4 w-4 mr-1" />
              {totalWorkouts}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold">Suplementação</h4>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {plan.supplementationStrategy.overview}
                </p>
                <Badge className="mt-2">{totalSupplements} suplementos</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Compras</h4>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {plan.shoppingList.overview}
                </p>
                <Badge className="mt-2">{totalCategories} categorias</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold">Refeições</h4>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {plan.mealPlan.overview}
                </p>
                <Badge className="mt-2">{totalMeals} dias planejados</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Dumbbell className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Treinos</h4>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {plan.workoutPlan.overview}
                </p>
                <Badge className="mt-2">{totalWorkouts} treinos</Badge>
              </div>
            </div>

            <Link href="/weekly-plan">
              <Button className="w-full" size="lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Ver Plano Completo
              </Button>
            </Link>
          </TabsContent>

          {/* Supplements Preview */}
          <TabsContent value="supplements" className="mt-6">
            <div className="space-y-3">
              {plan.supplementationStrategy.supplements.slice(0, 3).map((supplement, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{supplement.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {supplement.dosage} - {supplement.timing}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{supplement.purpose}</p>
                </div>
              ))}
              {totalSupplements > 3 && (
                <Link href="/weekly-plan">
                  <Button variant="outline" className="w-full">
                    Ver todos os {totalSupplements} suplementos
                  </Button>
                </Link>
              )}
            </div>
          </TabsContent>

          {/* Shopping Preview */}
          <TabsContent value="shopping" className="mt-6">
            <div className="space-y-3">
              {plan.shoppingList.categories.slice(0, 2).map((category, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">{category.category}</h4>
                  <div className="flex flex-wrap gap-1">
                    {category.items.slice(0, 5).map((item, idx) => (
                      <Badge key={idx} variant="outline">
                        {item.item}
                      </Badge>
                    ))}
                    {category.items.length > 5 && <Badge variant="outline">+{category.items.length - 5}</Badge>}
                  </div>
                </div>
              ))}
              <Link href="/weekly-plan">
                <Button variant="outline" className="w-full">
                  Ver lista completa
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Meals Preview */}
          <TabsContent value="meals" className="mt-6">
            <div className="space-y-3">
              {plan.mealPlan.meals.slice(0, 3).map((day, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{day.day}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Plano completo de café, almoço e jantar
                  </p>
                </div>
              ))}
              <Link href="/weekly-plan">
                <Button variant="outline" className="w-full">
                  Ver cardápio completo
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Workouts Preview */}
          <TabsContent value="workouts" className="mt-6">
            <div className="space-y-3">
              {plan.workoutPlan.workouts.slice(0, 3).map((workout, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{workout.day}</h4>
                    <Badge>{workout.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Treino completo com exercícios</p>
                </div>
              ))}
              <Link href="/weekly-plan">
                <Button variant="outline" className="w-full">
                  Ver treinos completos
                </Button>
              </Link>
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
