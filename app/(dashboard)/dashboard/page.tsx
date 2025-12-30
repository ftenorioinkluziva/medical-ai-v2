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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecommendationsWidget } from '@/components/recommendations/recommendations-widget'
import { WeeklyPlanWidget } from '@/components/weekly-plan/weekly-plan-widget'
import { DocumentUploadWidget } from '@/components/documents/document-upload-widget'
import { RecentDocumentsWidget } from '@/components/documents/recent-documents-widget'
import { RecentAnalysesWidget } from '@/components/analyses/recent-analyses-widget'
import { Loader2, User, ArrowRight, Upload, FileText, Brain, Lightbulb, Calendar } from 'lucide-react'

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

      {/* Mobile: Tabs Layout */}
      <div className="lg:hidden">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="upload" className="gap-1.5 text-xs sm:text-sm data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white">
              <Upload className="h-4 w-4 shrink-0" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5 text-xs sm:text-sm data-[state=active]:!bg-sky-600 dark:data-[state=active]:!bg-sky-500 data-[state=active]:!text-white">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="sm:hidden">Docs</span>
              <span className="hidden sm:inline">Documentos</span>
            </TabsTrigger>
            <TabsTrigger value="analyses" className="gap-1.5 text-xs sm:text-sm data-[state=active]:!bg-purple-600 dark:data-[state=active]:!bg-purple-500 data-[state=active]:!text-white">
              <Brain className="h-4 w-4 shrink-0" />
              <span>Análises</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <DocumentUploadWidget onUploadComplete={handleUploadComplete} />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <RecentDocumentsWidget key={refreshKey} limit={5} userName={session?.user?.name} />
          </TabsContent>

          <TabsContent value="analyses" className="mt-4">
            <RecentAnalysesWidget limit={5} />
          </TabsContent>
        </Tabs>

        <Tabs defaultValue="recommendations" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="recommendations" className="gap-1.5 text-xs sm:text-sm data-[state=active]:!bg-amber-600 dark:data-[state=active]:!bg-amber-500 data-[state=active]:!text-white">
              <Lightbulb className="h-4 w-4 shrink-0" />
              <span className="sm:hidden">Metas</span>
              <span className="hidden sm:inline">Recomendações</span>
            </TabsTrigger>
            <TabsTrigger value="weekly-plan" className="gap-1.5 text-xs sm:text-sm data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="sm:hidden">Plano</span>
              <span className="hidden sm:inline">Plano Semanal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="mt-4">
            <RecommendationsWidget />
          </TabsContent>

          <TabsContent value="weekly-plan" className="mt-4">
            <WeeklyPlanWidget />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden lg:block space-y-6">
        {/* Documents and Analyses Section - 3 Column Grid */}
        <div className="grid gap-4 grid-cols-3">
          <DocumentUploadWidget onUploadComplete={handleUploadComplete} />
          <RecentDocumentsWidget key={refreshKey} limit={5} userName={session?.user?.name} />
          <RecentAnalysesWidget limit={5} />
        </div>

        {/* Recommendations and Weekly Plan Section - 2 Column Grid */}
        <div className="grid gap-6 grid-cols-2">
          <RecommendationsWidget />
          <WeeklyPlanWidget />
        </div>
      </div>


    </div>
  )
}
