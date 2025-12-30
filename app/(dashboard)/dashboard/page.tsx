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
import { RecommendationsWidget } from '@/components/recommendations/recommendations-widget'
import { WeeklyPlanWidget } from '@/components/weekly-plan/weekly-plan-widget'
import { DocumentUploadWidget } from '@/components/documents/document-upload-widget'
import { RecentDocumentsWidget } from '@/components/documents/recent-documents-widget'
import { RecentAnalysesWidget } from '@/components/analyses/recent-analyses-widget'
import { Loader2, User, ArrowRight } from 'lucide-react'

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
  const [refreshKey, setRefreshKey] = useState(0)

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

  const handleUploadComplete = () => {
    // Refresh the documents list by updating the key
    setRefreshKey((prev) => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
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
    <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
          Olá, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Aqui está um resumo da sua saúde e atividades recentes
        </p>
      </div>

            {/* Quick Actions */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="h-5 w-5 text-teal-600" />
            Perfil Médico
          </CardTitle>
          <CardDescription>
            Atualize sua jornada de saúde mantendo suas informações médicas precisas e atualizadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CTA Button */}
          <div className="pt-2">
            <Link href="/profile">
              <Button
                variant="outline"
                className="w-full justify-between group min-h-[44px]"
              >
                <span className="truncate">Atualizar Perfil Médico</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Documents and Analyses Section - 3 Column Grid*/}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DocumentUploadWidget onUploadComplete={handleUploadComplete} />
        <RecentDocumentsWidget key={refreshKey} limit={5} />
        <RecentAnalysesWidget limit={5} />
      </div>

      {/* Recommendations and Weekly Plan Section - 2 Column Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <RecommendationsWidget />
        <WeeklyPlanWidget />
      </div>


    </div>
  )
}
