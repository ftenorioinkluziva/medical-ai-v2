'use client'

/**
 * Workout Plan Navigator Component
 * Tabbed interface for browsing weekly workouts by day
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Activity,
  Wind,
  Coffee,
  CalendarX,
} from 'lucide-react'

interface WorkoutPlanNavigatorProps {
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
}

// All days of the week in Portuguese
const WEEK_DAYS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
]

const WEEK_DAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export function WorkoutPlanNavigator({ workoutPlan }: WorkoutPlanNavigatorProps) {
  // Get current day of week and pre-select it (0 = Monday, 6 = Sunday)
  const getCurrentDayIndex = () => {
    const today = new Date().getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to Monday-based index (0 = Monday, 6 = Sunday)
    return today === 0 ? 6 : today - 1
  }

  const [selectedDayIndex, setSelectedDayIndex] = useState(getCurrentDayIndex())

  // Map workouts to days
  const getDayWorkout = (dayName: string) => {
    return workoutPlan.workouts.find((workout) => workout.day.startsWith(dayName))
  }

  // Check if day is a rest day
  const isRestDay = (dayName: string) => {
    if (!workoutPlan.restDays) return false
    return workoutPlan.restDays.some((restDay) => restDay.startsWith(dayName))
  }

  const handlePrevDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1)
    }
  }

  const handleNextDay = () => {
    if (selectedDayIndex < 6) {
      setSelectedDayIndex(selectedDayIndex + 1)
    }
  }

  const selectedDayName = WEEK_DAYS[selectedDayIndex]
  const selectedWorkout = getDayWorkout(selectedDayName)
  const selectedIsRestDay = isRestDay(selectedDayName)

  const getIntensityColor = (intensity?: string) => {
    switch (intensity) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
      case 'low':
        return 'bg-muted text-foreground border-border'
      default:
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
    }
  }

  const getIntensityLabel = (intensity?: string) => {
    switch (intensity) {
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Média'
      case 'low':
        return 'Baixa'
      default:
        return intensity
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-emerald-600" />
          Plano de Treinamento
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {workoutPlan.overview}
        </CardDescription>
        {workoutPlan.weeklyGoal && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <p className="text-sm text-emerald-900 dark:text-emerald-100 font-medium">
              Meta: {workoutPlan.weeklyGoal}
            </p>
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
              disabled={selectedDayIndex === 6}
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
                {WEEK_DAYS_SHORT.map((day, index) => (
                  <TabsTrigger
                    key={index}
                    value={index.toString()}
                    className="text-xs sm:text-sm data-[state=active]:!bg-emerald-600 dark:data-[state=active]:!bg-emerald-500 data-[state=active]:!text-white px-1"
                  >
                    {/* Show 1 letter on mobile, full abbreviation on desktop */}
                    <span className="sm:hidden">{day.charAt(0)}</span>
                    <span className="hidden sm:inline">{day}</span>
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
            disabled={selectedDayIndex === 6}
            className="gap-2 hidden sm:flex"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Day Content */}
        <div className="border-2 border-emerald-200 dark:border-emerald-800 rounded-lg p-6 bg-gradient-to-br from-card to-emerald-50/30 dark:to-emerald-950/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">{selectedDayName}</h3>
              {selectedWorkout && (
                <p className="text-sm text-muted-foreground mt-1">{selectedWorkout.type}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-emerald-600 text-white">
                Dia {selectedDayIndex + 1} de 7
              </Badge>
              {selectedWorkout && (
                <>
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedWorkout.duration}
                  </Badge>
                  {selectedWorkout.intensity && (
                    <Badge className={getIntensityColor(selectedWorkout.intensity)}>
                      <Flame className="h-3 w-3 mr-1" />
                      {getIntensityLabel(selectedWorkout.intensity)}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Rest Day Message */}
          {selectedIsRestDay && !selectedWorkout && (
            <Card className="border-2 border-sky-200 dark:border-sky-800 bg-card">
              <CardContent className="p-8 text-center">
                <div className="bg-sky-50 dark:bg-sky-950/20 rounded-lg p-4 mb-4 inline-block">
                  <Coffee className="h-12 w-12 text-sky-600 dark:text-sky-400" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Dia de Descanso</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Este é um dia de recuperação. Aproveite para descansar seus músculos e permitir que seu corpo se recupere adequadamente.
                </p>
              </CardContent>
            </Card>
          )}

          {/* No Workout Message */}
          {!selectedWorkout && !selectedIsRestDay && (
            <Card className="border-2 border-border bg-card">
              <CardContent className="p-8 text-center">
                <div className="bg-muted rounded-lg p-4 mb-4 inline-block">
                  <CalendarX className="h-12 w-12 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Sem treino programado</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Não há treino programado para este dia. Você pode aproveitar para descansar ou realizar atividades leves.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Workout Content */}
          {selectedWorkout && (
            <div className="space-y-4">
              {/* Warmup */}
              {selectedWorkout.warmup && (
                <Card className="border-2 border-amber-200 bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-amber-600 flex items-center gap-2">
                      <Wind className="h-5 w-5" />
                      Aquecimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">{selectedWorkout.warmup}</p>
                  </CardContent>
                </Card>
              )}

              {/* Exercises */}
              <Card className="border-2 border-emerald-200 bg-card hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-emerald-600 flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Exercícios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="p-4 bg-muted rounded-lg border border-border hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-all"
                    >
                      <p className="font-semibold text-sm text-foreground mb-2">{exercise.name}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {exercise.sets && (
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {exercise.sets} séries
                          </span>
                        )}
                        {exercise.reps && (
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {exercise.reps} reps
                          </span>
                        )}
                        {exercise.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {exercise.duration}
                          </span>
                        )}
                      </div>
                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">{exercise.notes}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Cooldown */}
              {selectedWorkout.cooldown && (
                <Card className="border-2 border-sky-200 bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-sky-600 flex items-center gap-2">
                      <Wind className="h-5 w-5" />
                      Alongamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">{selectedWorkout.cooldown}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Progression Tips */}
        {workoutPlan.progressionTips && workoutPlan.progressionTips.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 bg-card hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-colors">
              <h4 className="font-semibold text-base text-foreground mb-3">Dicas de Progressão</h4>
              <ul className="space-y-2">
                {workoutPlan.progressionTips.map((tip: string, index: number) => (
                  <li key={index} className="text-sm text-foreground flex items-start gap-2.5 leading-relaxed">
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
  )
}
