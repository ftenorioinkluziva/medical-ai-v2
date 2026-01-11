/**
 * Metrics List Component
 * Displays calculated metrics from Cérebro Lógico
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCcw, Calculator, Pencil } from 'lucide-react'
import { MetricEditDialog } from './metric-edit-dialog'

interface Metric {
  slug: string
  name: string
  formula: string
  targetMin: string | null
  targetMax: string | null
  riskInsight: string | null
  sourceRef: string | null
}

interface Props {
  searchQuery: string
}

export function MetricsList({ searchQuery }: Props) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleEdit = (metric: Metric) => {
    setEditingMetric(metric)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    loadMetrics()
  }

  useEffect(() => {
    loadMetrics()
  }, [searchQuery])

  const loadMetrics = async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      params.append('limit', '50')

      const response = await fetch(`/api/admin/medical-knowledge/metrics?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics || [])
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando métricas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (metrics.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <Calculator className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-center">
              <p className="font-medium">Nenhuma métrica calculada encontrada</p>
              <p className="text-sm mt-1">
                Métricas são fórmulas matemáticas aplicadas aos biomarcadores
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} métrica{total !== 1 ? 's' : ''} calculada{total !== 1 ? 's' : ''}
        </p>

        <Button variant="outline" size="sm" onClick={loadMetrics}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Metrics List */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {metrics.map(metric => (
              <div key={metric.slug} className="border rounded-lg p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{metric.name}</h4>
                    <Badge variant="outline" className="text-xs mt-1">
                      {metric.slug}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(metric)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                {/* Formula */}
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Fórmula:</p>
                  <code className="text-sm font-mono">{metric.formula}</code>
                </div>

                {/* Target Range */}
                {(metric.targetMin || metric.targetMax) && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Alvo:</span>
                    <div className="flex items-center gap-1">
                      {metric.targetMin && (
                        <Badge variant="secondary">≥ {metric.targetMin}</Badge>
                      )}
                      {metric.targetMin && metric.targetMax && (
                        <span className="text-muted-foreground">e</span>
                      )}
                      {metric.targetMax && (
                        <Badge variant="secondary">≤ {metric.targetMax}</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Risk Insight */}
                {metric.riskInsight && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                    <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                      ⚠️ Insight de Risco:
                    </p>
                    <p className="text-sm text-yellow-900 dark:text-yellow-100">
                      {metric.riskInsight}
                    </p>
                  </div>
                )}

                {/* Source */}
                {metric.sourceRef && (
                  <p className="text-xs text-muted-foreground">
                    Fonte: {metric.sourceRef}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <MetricEditDialog
        metric={editingMetric}
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
