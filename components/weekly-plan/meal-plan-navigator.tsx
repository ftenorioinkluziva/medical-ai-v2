'use client'

/**
 * Meal Plan Navigator Component
 * Tabbed interface for browsing weekly meals by day
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunrise,
  Moon,
  Apple,
  Flame,
  ChefHat,
  Dumbbell
} from 'lucide-react'

interface MealDefinition {
  name: string
  ingredients: string[]
  instructions: string
  calories: string
  macros?: {
    fats: string
    carbs: string
    protein: string
  }
}

interface MealPlanNavigatorProps {
  mealPlan: {
    overview: string
    daily_calories_avg: string
    weekly_plan: Array<{
      day: string
      meals: {
        breakfast: MealDefinition
        morning_snack: MealDefinition
        lunch: MealDefinition
        afternoon_snack: MealDefinition
        pre_workout: MealDefinition
        post_workout: MealDefinition
        dinner: MealDefinition
        supper: MealDefinition
      }
    }>
  }
}

export function MealPlanNavigator({ mealPlan }: MealPlanNavigatorProps) {
  // Get current day of week and pre-select it (0 = Monday, 6 = Sunday)
  const getCurrentDayIndex = () => {
    // Safety check: ensure weekly_plan array exists and has items
    if (!mealPlan?.weekly_plan || mealPlan.weekly_plan.length === 0) {
      return 0
    }

    const today = new Date().getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to Monday-based index (0 = Monday, 6 = Sunday)
    const mondayBasedIndex = today === 0 ? 6 : today - 1
    // Ensure index is within bounds of meal plan
    return Math.min(mondayBasedIndex, mealPlan.weekly_plan.length - 1)
  }

  const [selectedDayIndex, setSelectedDayIndex] = useState(getCurrentDayIndex())

  const handlePrevDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1)
    }
  }

  const handleNextDay = () => {
    if (selectedDayIndex < mealPlan.weekly_plan.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1)
    }
  }

  // Safety check: ensure we have meals and selected index is valid
  if (!mealPlan?.weekly_plan || mealPlan.weekly_plan.length === 0) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-orange-600" />
            Plano de Refeições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum plano de refeições disponível
          </p>
        </CardContent>
      </Card>
    )
  }

  const selectedDay = mealPlan.weekly_plan[selectedDayIndex]
  if (!selectedDay) return null

  const renderMealCard = (title: string, icon: any, meal: MealDefinition, colorClass: string) => {
    if (!meal) return null;

    // Map color class to specific tailwind colors
    const colors: Record<string, { border: string, text: string, bgTitle: string }> = {
      amber: { border: 'border-amber-200', text: 'text-amber-600', bgTitle: '' },
      emerald: { border: 'border-emerald-200', text: 'text-emerald-600', bgTitle: '' },
      sky: { border: 'border-sky-200', text: 'text-sky-600', bgTitle: '' },
      purple: { border: 'border-purple-200', text: 'text-purple-600', bgTitle: '' },
      rose: { border: 'border-rose-200', text: 'text-rose-600', bgTitle: '' },
      indigo: { border: 'border-indigo-200', text: 'text-indigo-600', bgTitle: '' },
      slate: { border: 'border-slate-200', text: 'text-slate-600', bgTitle: '' },
    }

    const theme = colors[colorClass] || colors.amber;
    if (!theme) return null;

    return (
      <Card className={`border-2 ${theme.border} bg-card hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-base font-semibold ${theme.text} flex items-center gap-2`}>
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-semibold text-foreground">{meal.name}</p>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {meal.calories && (
              <Badge variant="secondary" className="gap-1 font-normal">
                <Flame className="h-3 w-3" />
                {meal.calories}
              </Badge>
            )}
            {meal.macros && (
              <>
                {meal.macros.protein && <Badge variant="outline" className="font-normal">{meal.macros.protein} Proteína</Badge>}
                {meal.macros.carbs && <Badge variant="outline" className="font-normal">{meal.macros.carbs} Carbo</Badge>}
                {meal.macros.fats && <Badge variant="outline" className="font-normal">{meal.macros.fats} Gordura</Badge>}
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingredientes:</p>
            <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
              {meal.ingredients.map((ing: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`${theme.text} mt-0.5`}>•</span>
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          {meal.instructions && (
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <ChefHat className="h-3 w-3" /> Preparo:
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">{meal.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-orange-600" />
          Plano de Refeições
        </CardTitle>

        {mealPlan.daily_calories_avg && (
          <div className="mt-3 inline-block">
            <Badge variant="outline" className="text-orange-900 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 p-2 text-sm font-medium gap-2">
              <Flame className="h-4 w-4" />
              Média Diária: {mealPlan.daily_calories_avg}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Day Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Navigation Buttons - Side by side on mobile, flanking tabs on desktop */}
          <div className="flex gap-2 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevDay}
              disabled={selectedDayIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextDay}
              disabled={selectedDayIndex === mealPlan.weekly_plan.length - 1}
              className="flex-1"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevDay}
            disabled={selectedDayIndex === 0}
            className="gap-2 hidden sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {/* Day Tabs */}
          <div className="flex-1">
            <Tabs
              value={selectedDayIndex.toString()}
              onValueChange={(value) => setSelectedDayIndex(parseInt(value))}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-7 bg-muted">
                {mealPlan.weekly_plan.map((day, index) => (
                  <TabsTrigger
                    key={index}
                    value={index.toString()}
                    className="text-xs sm:text-sm data-[state=active]:!bg-orange-600 dark:data-[state=active]:!bg-orange-500 data-[state=active]:!text-white px-1"
                  >
                    {/* Show 1 letter on mobile, 3 letters on desktop */}
                    <span className="sm:hidden">{day.day.charAt(0)}</span>
                    <span className="hidden sm:inline">{day.day.split('-')[0].substring(0, 3)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Desktop Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
            disabled={selectedDayIndex === mealPlan.weekly_plan.length - 1}
            className="gap-2 hidden sm:flex"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Day Content */}
        <div className="border-2 border-orange-200 dark:border-orange-800 rounded-lg p-6 bg-gradient-to-br from-card to-orange-50/30 dark:to-orange-950/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">{selectedDay.day}</h3>
            <Badge className="bg-orange-600 text-white">
              Dia {selectedDayIndex + 1} de {mealPlan.weekly_plan.length}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">

            {/* Main Meals */}
            {renderMealCard("Café da Manhã", <Sunrise className="h-5 w-5" />, selectedDay.meals.breakfast, "amber")}
            {renderMealCard("Almoço", <Sun className="h-5 w-5" />, selectedDay.meals.lunch, "emerald")}

            {/* Snacks */}
            {renderMealCard("Lanche da Manhã", <Apple className="h-5 w-5" />, selectedDay.meals.morning_snack, "purple")}
            {renderMealCard("Lanche da Tarde", <Apple className="h-5 w-5" />, selectedDay.meals.afternoon_snack, "purple")}

            {/* Workout Nutrition */}
            {renderMealCard("Pré-Treino", <Dumbbell className="h-5 w-5" />, selectedDay.meals.pre_workout, "rose")}
            {renderMealCard("Pós-Treino", <Dumbbell className="h-5 w-5" />, selectedDay.meals.post_workout, "indigo")}

            {/* Ending Meals */}
            {renderMealCard("Jantar", <Moon className="h-5 w-5" />, selectedDay.meals.dinner, "sky")}
            {renderMealCard("Ceia", <Moon className="h-4 w-4" />, selectedDay.meals.supper, "slate")}

          </div>
        </div>
      </CardContent>
    </Card>
  )
}

