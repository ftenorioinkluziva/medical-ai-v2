'use client'

/**
 * Dashboard Page
 * Main dashboard with health analytics and widgets
 */

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentDocuments } from '@/components/dashboard/recent-documents'
import { HealthAlerts } from '@/components/dashboard/health-alerts'
import { ParameterTrends } from '@/components/dashboard/parameter-trends'
import { RecommendationsWidget } from '@/components/recommendations/recommendations-widget'
import { Loader2, Sparkles, GitCompare, User } from 'lucide-react'

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
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando dashboard...</p>
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
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta, {session?.user?.name}!
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        documentsCount={stats.documentsCount}
        analysesCount={stats.analysesCount}
        agentsUsedCount={stats.agentsUsedCount}
        abnormalParametersCount={stats.abnormalParametersCount}
      />

      {/* Parameter Trends Chart */}
      {stats.documentsCount > 0 && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <ParameterTrends trends={stats.parameterTrends} />
          <HealthAlerts metrics={stats.healthMetrics} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle>Nova Análise</CardTitle>
            </div>
            <CardDescription>
              Consulte especialistas em IA sobre seus exames e dados de saúde
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analyze">
              <Button className="w-full" size="lg">
                Iniciar Análise
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-25 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitCompare className="h-6 w-6 text-blue-600" />
              <CardTitle>Comparar Exames</CardTitle>
            </div>
            <CardDescription>
              Compare seus exames ao longo do tempo para acompanhar evolução
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/compare">
              <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50" size="lg">
                Comparar Documentos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Widget */}
      <RecommendationsWidget />

      {/* Recent Documents */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentDocuments documents={stats.recentDocuments} />

        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Perfil Médico
                </CardTitle>
                <CardDescription>Suas informações de saúde</CardDescription>
              </div>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Mantenha seu perfil atualizado para análises mais precisas
                </p>
                <Link href="/profile">
                  <Button variant="outline" className="w-full">
                    Completar Perfil Médico
                  </Button>
                </Link>
              </div>

              <div className="pt-4 border-t space-y-2">
                <h4 className="text-sm font-medium">Próximas Ações</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`h-2 w-2 rounded-full ${stats.documentsCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <p className="text-muted-foreground">Upload de documentos</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`h-2 w-2 rounded-full ${stats.analysesCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <p className="text-muted-foreground">Consultar especialistas</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`h-2 w-2 rounded-full ${stats.documentsCount >= 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <p className="text-muted-foreground">Comparar evolução</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
