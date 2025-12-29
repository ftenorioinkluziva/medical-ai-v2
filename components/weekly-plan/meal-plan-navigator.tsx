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

  const selectedDay = mealPlan.meals[selectedDayIndex]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-orange-600" />
          Plano de Refeições
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-1 leading-relaxed">
          {mealPlan.overview}
        </CardDescription>
        {(mealPlan.dailyCalories || mealPlan.macros) && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
            {mealPlan.dailyCalories && (
              <p className="text-sm text-orange-900 font-medium">
                {mealPlan.dailyCalories} calorias/dia
              </p>
            )}
            {mealPlan.macros && (
              <div className="flex gap-3 flex-wrap text-sm text-orange-900">
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
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevDay}
            disabled={selectedDayIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex-1">
            <Tabs
              value={selectedDayIndex.toString()}
              onValueChange={(value) => setSelectedDayIndex(parseInt(value))}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-7 bg-gray-100">
                {mealPlan.meals.map((day, index) => (
                  <TabsTrigger
                    key={index}
                    value={index.toString()}
                    className="text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                  >
                    {day.day.split('-')[0].substring(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
            disabled={selectedDayIndex === mealPlan.meals.length - 1}
            className="gap-2"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Day Content */}
        <div className="border-2 border-orange-200 rounded-lg p-6 bg-gradient-to-br from-white to-orange-50/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">{selectedDay.day}</h3>
            <Badge className="bg-orange-600 text-white text-sm">
              Dia {selectedDayIndex + 1} de {mealPlan.meals.length}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Breakfast Card */}
            <Card className="border-2 border-amber-200 bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-amber-600 flex items-center gap-2">
                  <Sunrise className="h-5 w-5" />
                  Café da Manhã
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold text-gray-900">{selectedDay.breakfast.name}</p>
                <div className="flex gap-3 text-xs text-gray-600">
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
                <ul className="text-sm text-gray-600 space-y-1 leading-relaxed">
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
            <Card className="border-2 border-emerald-200 bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-emerald-600 flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Almoço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold text-gray-900">{selectedDay.lunch.name}</p>
                <div className="flex gap-3 text-xs text-gray-600">
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
                <ul className="text-sm text-gray-600 space-y-1 leading-relaxed">
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
            <Card className="border-2 border-sky-200 bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-sky-600 flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Jantar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-semibold text-gray-900">{selectedDay.dinner.name}</p>
                <div className="flex gap-3 text-xs text-gray-600">
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
                <ul className="text-sm text-gray-600 space-y-1 leading-relaxed">
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
              <Card className="border-2 border-purple-200 bg-white hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-purple-600 flex items-center gap-2">
                    <Apple className="h-5 w-5" />
                    Lanches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDay.snacks.map((snack: any, i: number) => (
                    <div key={i} className="pb-3 last:pb-0 border-b last:border-0">
                      <p className="font-semibold text-gray-900 text-sm">{snack.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
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
            <div className="border border-orange-200 rounded-lg p-4 bg-white hover:bg-orange-50/30 transition-colors">
              <h4 className="font-semibold text-base text-gray-900 mb-3">Dicas de Meal Prep</h4>
              <ul className="space-y-2">
                {mealPlan.mealPrepTips.map((tip: string, index: number) => (
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
  )
}
