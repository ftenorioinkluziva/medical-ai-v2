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
import { DocumentUploadWidget } from '@/components/documents/document-upload-widget'
import { RecentDocumentsWidget } from '@/components/documents/recent-documents-widget'
import { RecentAnalysesWidget } from '@/components/analyses/recent-analyses-widget'
import { Loader2 } from 'lucide-react'
import {
  UserIcon,
  ArrowRightIcon,
  UploadIcon,
  FileTextIcon,
  BrainIcon
} from '@/components/ui/animated-icon'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardStats {
  documentsCount: number
  analysesCount: number
  agentsUsedCount: number
  abnormalParametersCount: number
  lastActivity: { date: string; type: 'document' | 'analysis' } | null
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
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Quick Actions Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-11 w-full" />
          </CardContent>
        </Card>

        {/* Content Skeleton */}
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
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

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg hover:border-teal-400 transition-all cursor-pointer group border-teal-200 dark:border-teal-900">
          <Link href="/profile">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900 group-hover:bg-teal-200 dark:group-hover:bg-teal-800 transition-colors">
                  <UserIcon size={24} className="text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Perfil Médico</CardTitle>
                  <CardDescription className="text-sm">
                    Atualize suas informações
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-teal-600 dark:text-teal-400 font-medium">
                <span>Atualizar agora</span>
                <ArrowRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer group border-purple-200 dark:border-purple-900">
          <Link href="/analyses/new">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                  <BrainIcon size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Nova Análise</CardTitle>
                  <CardDescription className="text-sm">
                    Análise completa de saúde
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-purple-600 dark:text-purple-400 font-medium">
                <span>Iniciar análise</span>
                <ArrowRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg hover:border-sky-400 transition-all cursor-pointer group border-sky-200 dark:border-sky-900">
          <Link href="/documents">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900 group-hover:bg-sky-200 dark:group-hover:bg-sky-800 transition-colors">
                  <FileTextIcon size={24} className="text-sky-600 dark:text-sky-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Documentos</CardTitle>
                  <CardDescription className="text-sm">
                    Gerenciar documentos médicos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-sky-600 dark:text-sky-400 font-medium">
                <span>Ver todos</span>
                <ArrowRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Empty States - Show when no data */}
      {stats.documentsCount === 0 && stats.analysesCount === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-teal-100 dark:bg-teal-900 mb-4">
              <UploadIcon size={48} className="text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Bem-vindo ao Medical AI</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Comece sua jornada de saúde fazendo upload do seu primeiro documento médico.
              Nossa IA analisará e fornecerá insights personalizados.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/profile">
                <Button variant="outline" className="gap-2">
                  <UserIcon size={16} />
                  Preencher Perfil
                </Button>
              </Link>
              <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                <UploadIcon size={16} />
                Fazer Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile: Tabs Layout */}
      {(stats.documentsCount > 0 || stats.analysesCount > 0) && (
        <div className="lg:hidden">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="upload" className="gap-1.5 text-xs sm:text-sm data-[state=active]:!bg-teal-600 dark:data-[state=active]:!bg-teal-500 data-[state=active]:!text-white">
                <UploadIcon size={16} className="shrink-0" />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-1.5 text-xs sm:text-sm data-[state=active]:!bg-sky-600 dark:data-[state=active]:!bg-sky-500 data-[state=active]:!text-white">
                <FileTextIcon size={16} className="shrink-0" />
                <span className="sm:hidden">Docs</span>
                <span className="hidden sm:inline">Documentos</span>
              </TabsTrigger>
              <TabsTrigger value="analyses" className="gap-1.5 text-xs sm:text-sm data-[state=active]:!bg-purple-600 dark:data-[state=active]:!bg-purple-500 data-[state=active]:!text-white">
                <BrainIcon size={16} className="shrink-0" />
                <span>Análises</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <DocumentUploadWidget onUploadComplete={handleUploadComplete} />
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              {stats.documentsCount > 0 ? (
                <RecentDocumentsWidget key={refreshKey} limit={5} userName={session?.user?.name} />
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FileTextIcon size={40} className="text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum documento ainda</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analyses" className="mt-4">
              {stats.analysesCount > 0 ? (
                <RecentAnalysesWidget limit={5} />
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <BrainIcon size={40} className="text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">Nenhuma análise ainda</p>
                    <Link href="/analyses/new">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Criar Primeira Análise
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Desktop: Grid Layout */}
      {(stats.documentsCount > 0 || stats.analysesCount > 0) && (
        <div className="hidden lg:block space-y-6">
          {/* Documents and Analyses Section - 3 Column Grid */}
          <div className="grid gap-4 grid-cols-3">
            <DocumentUploadWidget onUploadComplete={handleUploadComplete} />

            {stats.documentsCount > 0 ? (
              <RecentDocumentsWidget key={refreshKey} limit={5} userName={session?.user?.name} />
            ) : (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileTextIcon size={20} className="text-sky-600" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileTextIcon size={40} className="text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum documento ainda</p>
                </CardContent>
              </Card>
            )}

            {stats.analysesCount > 0 ? (
              <RecentAnalysesWidget limit={5} />
            ) : (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BrainIcon size={20} className="text-purple-600" />
                    Análises
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BrainIcon size={40} className="text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">Nenhuma análise ainda</p>
                  <Link href="/analyses/new">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Criar Primeira Análise
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
