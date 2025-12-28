'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, TrendingUp, CreditCard, Activity } from 'lucide-react'

interface Stats {
  totalCreditsInCirculation: number
  potentialTokensFromCredits: number
  apiMonthlyLimit: number
  tokensUsedLast30Days: number
  totalAnalysesLast30Days: number
  usagePercent: number
  potentialUsagePercent: number
  alertThreshold: boolean
}

export function CreditStatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/credits/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Carregando estatísticas...</p>
  if (!stats) return <p>Erro ao carregar dados</p>

  return (
    <div className="space-y-4">
      {stats.alertThreshold && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Alerta:</strong> Créditos vendidos atingiram {stats.potentialUsagePercent.toFixed(1)}%
            do limite da API. Considere aumentar o limite ou pausar vendas.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Créditos Vendidos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCreditsInCirculation.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.potentialTokensFromCredits.toLocaleString('pt-BR')} tokens potenciais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uso Real (30d)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.tokensUsedLast30Days / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAnalysesLast30Days} análises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Limite API</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.apiMonthlyLimit / 1000000).toFixed(0)}M
            </div>
            <p className="text-xs text-muted-foreground">
              tokens/mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uso Potencial</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.alertThreshold ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.potentialUsagePercent.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              do limite mensal
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
