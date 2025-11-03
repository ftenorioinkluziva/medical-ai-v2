'use client'

/**
 * Dashboard Stats Cards
 * Display key metrics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Brain, TrendingUp, AlertCircle } from 'lucide-react'

interface StatsCardsProps {
  documentsCount: number
  analysesCount: number
  agentsUsedCount: number
  abnormalParametersCount: number
}

export function StatsCards({
  documentsCount,
  analysesCount,
  agentsUsedCount,
  abnormalParametersCount,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Documents Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Documentos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{documentsCount}</div>
          <p className="text-xs text-muted-foreground">
            Exames médicos enviados
          </p>
        </CardContent>
      </Card>

      {/* Analyses Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Análises</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analysesCount}</div>
          <p className="text-xs text-muted-foreground">
            Análises realizadas
          </p>
        </CardContent>
      </Card>

      {/* Agents Used Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agentes Usados</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{agentsUsedCount}</div>
          <p className="text-xs text-muted-foreground">
            Especialistas consultados
          </p>
        </CardContent>
      </Card>

      {/* Alerts Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{abnormalParametersCount}</div>
          <p className="text-xs text-muted-foreground">
            Valores fora do normal
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
