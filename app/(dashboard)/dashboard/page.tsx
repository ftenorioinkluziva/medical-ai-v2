'use client'

/**
 * Dashboard Page - Minimal Health Design
 * Clean, professional dashboard with focus on usability
 */

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentDocuments } from '@/components/dashboard/recent-documents'
import { HealthAlerts } from '@/components/dashboard/health-alerts'
import { RecommendationsWidget } from '@/components/recommendations/recommendations-widget'
import { WeeklyPlanWidget } from '@/components/weekly-plan/weekly-plan-widget'
import { Loader2, User, CheckCircle, Circle, ArrowRight } from 'lucide-react'

interface DashboardStats {
  documentsCount: number
  analysesCount: number
  agentsUsedCount: number
  abnormalParametersCount: number
  recentDocuments: any[]
  recentAnalyses: any[]
  healthMetrics: any[]
  parameterTrends: Record<string, any[]>
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard/stats')

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Erro ao carregar estatísticas do dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Olá, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-600 mt-1">
          Aqui está um resumo da sua saúde e atividades recentes
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        documentsCount={stats.documentsCount}
        analysesCount={stats.analysesCount}
        agentsUsedCount={stats.agentsUsedCount}
        abnormalParametersCount={stats.abnormalParametersCount}
      />

      {/* Health Alerts */}
      {stats.healthMetrics && stats.healthMetrics.length > 0 && (
        <HealthAlerts metrics={stats.healthMetrics} />
      )}

      {/* Recommendations Widget */}
      <RecommendationsWidget />

      {/* Weekly Plan Widget */}
      <WeeklyPlanWidget />

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Documents */}
        <RecentDocuments documents={stats.recentDocuments} />

        {/* Quick Actions */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-teal-600" />
              Próximas Ações
            </CardTitle>
            <CardDescription>
              Continue sua jornada de saúde
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Action Items */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                {stats.documentsCount > 0 ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Upload de documentos</p>
                  <p className="text-xs text-gray-600">Envie seus exames médicos</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                {stats.analysesCount > 0 ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Consultar especialistas</p>
                  <p className="text-xs text-gray-600">Obtenha análises personalizadas</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                {stats.documentsCount >= 2 ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Acompanhar evolução</p>
                  <p className="text-xs text-gray-600">Compare seus resultados</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="w-full justify-between group"
                >
                  Atualizar Perfil Médico
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
