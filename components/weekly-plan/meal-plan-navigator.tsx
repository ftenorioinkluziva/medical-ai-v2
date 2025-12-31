'use client'

/**
 * Meal Plan Navigator Component
 * Tabbed interface for browsing weekly meals by day
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Clock,
  Flame,
} from 'lucide-react'

interface MealPlanNavigatorProps {
  mealPlan: {
    overview: string
    dailyCalories?: string
    macros?: {
      protein?: string
      carbs?: string
      fats?: string
    }
    meals: Array<{
      day: string
      breakfast: {
        name: string
        ingredients: string[]
        calories?: string
        prepTime?: string
      }
      lunch: {
        name: string
        ingredients: string[]
        calories?: string
        prepTime?: string
      }
      dinner: {
        name: string
        ingredients: string[]
        calories?: string
        prepTime?: string
      }
      snacks?: Array<{
        name: string
        timing: string
        calories?: string
      }>
    }>
    mealPrepTips?: string[]
  }
}

export function MealPlanNavigator({ mealPlan }: MealPlanNavigatorProps) {
  // Get current day of week and pre-select it (0 = Monday, 6 = Sunday)
  const getCurrentDayIndex = () => {
    // Safety check: ensure meals array exists and has items
    if (!mealPlan?.meals || mealPlan.meals.length === 0) {
      return 0
    }

    const today = new Date().getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to Monday-based index (0 = Monday, 6 = Sunday)
    const mondayBasedIndex = today === 0 ? 6 : today - 1
    // Ensure index is within bounds of meal plan
    return Math.min(mondayBasedIndex, mealPlan.meals.length - 1)
  }

  const [selectedDayIndex, setSelectedDayIndex] = useState(getCurrentDayIndex())

  const handlePrevDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1)
    }
  }

  const handleNextDay = () => {
    if (selectedDayIndex < mealPlan.meals.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1)
    }
  }

  // Safety check: ensure we have meals and selected index is valid
  if (!mealPlan?.meals || mealPlan.meals.length === 0) {
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

  const selectedDay = mealPlan.meals[selectedDayIndex]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-orange-600" />
          Plano de Refeições
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {mealPlan.overview}
        </CardDescription>
        {(mealPlan.dailyCalories || mealPlan.macros) && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-2 dark:bg-orange-900/30 dark:border-orange-600">
            {mealPlan.dailyCalories && (
              <p className="text-sm text-orange-900 font-medium dark:text-orange-300">
                {mealPlan.dailyCalories} calorias/dia
              </p>
            )}
            {mealPlan.macros && (
              <div className="flex gap-3 flex-wrap text-sm text-orange-900 dark:text-orange-300">
                {mealPlan.macros.protein && (
                  <span>Proteína: {mealPlan.macros.protein}</span>
                )}
                {mealPlan.macros.carbs && (
                  <span>• Carbos: {mealPlan.macros.carbs}</span>
                )}
                {mealPlan.macros.fats && (
                  <span>• Gorduras: {mealPlan.macros.fats}</span>
                )}
              </div>
            )}
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
              disabled={selectedDayIndex === mealPlan.meals.length - 1}
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
                {mealPlan.meals.map((day, index) => (
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
            disabled={selectedDayIndex === mealPlan.meals.length - 1}
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
              Dia {selectedDayIndex + 1} de {mealPlan.meals.length}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Breakfast Card */}
            <Card className="border-2 border-amber-200 bg-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-amber-600 flex items-center gap-2">
                  <Sunrise className="h-5 w-5" />
                  Café da Manhã
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold text-foreground">{selectedDay.breakfast.name}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {selectedDay.breakfast.calories && (
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {selectedDay.breakfast.calories}
                    </span>
                  )}
                  {selectedDay.breakfast.prepTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedDay.breakfast.prepTime}
                    </span>
                  )}
                </div>
                <Separator />
                <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                  {selectedDay.breakfast.ingredients.map((ing: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Lunch Card */}
            <Card className="border-2 border-emerald-200 bg-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-emerald-600 flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Almoço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold text-foreground">{selectedDay.lunch.name}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {selectedDay.lunch.calories && (
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {selectedDay.lunch.calories}
                    </span>
                  )}
                  {selectedDay.lunch.prepTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedDay.lunch.prepTime}
                    </span>
                  )}
                </div>
                <Separator />
                <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                  {selectedDay.lunch.ingredients.map((ing: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">•</span>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Dinner Card */}
            <Card className="border-2 border-sky-200 bg-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-sky-600 flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Jantar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold text-foreground">{selectedDay.dinner.name}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {selectedDay.dinner.calories && (
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {selectedDay.dinner.calories}
                    </span>
                  )}
                  {selectedDay.dinner.prepTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedDay.dinner.prepTime}
                    </span>
                  )}
                </div>
                <Separator />
                <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                  {selectedDay.dinner.ingredients.map((ing: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-sky-600 mt-0.5">•</span>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Snacks Card */}
            {selectedDay.snacks && selectedDay.snacks.length > 0 && (
              <Card className="border-2 border-purple-200 bg-card hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-purple-600 flex items-center gap-2">
                    <Apple className="h-5 w-5" />
                    Lanches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDay.snacks.map((snack: any, i: number) => (
                    <div key={i} className="pb-3 last:pb-0 border-b last:border-0">
                      <p className="font-semibold text-foreground text-sm">{snack.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {snack.timing}
                        </span>
                        {snack.calories && (
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {snack.calories}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Meal Prep Tips */}
        {mealPlan.mealPrepTips && mealPlan.mealPrepTips.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-card hover:bg-orange-50/30 dark:hover:bg-orange-950/30 transition-colors">
              <h4 className="font-semibold text-base text-foreground mb-3">Dicas de Meal Prep</h4>
              <ul className="space-y-2">
                {mealPlan.mealPrepTips.map((tip: string, index: number) => (
                  <li key={index} className="text-sm text-foreground flex items-start gap-2.5 leading-relaxed">
                    <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
