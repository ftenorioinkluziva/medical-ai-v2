'use client'

/**
 * Health Alerts Widget - Minimal Health Design
 * Display abnormal health parameters
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface HealthMetric {
  documentId: string
  documentName: string
  parameter: string
  value: string
  unit: string
  status: string
  date: string
}

interface HealthAlertsProps {
  metrics: HealthMetric[]
}

export function HealthAlerts({ metrics }: HealthAlertsProps) {
  if (metrics.length === 0) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Alertas de Saúde
          </CardTitle>
          <CardDescription>Valores que requerem atenção</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="bg-emerald-50 rounded-lg p-4 mb-4 inline-block">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-emerald-600 mb-1">Tudo Ótimo!</p>
          <p className="text-xs text-gray-600">
            Todos os parâmetros estão dentro do normal
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Alertas de Saúde
        </CardTitle>
        <CardDescription>
          {metrics.length} parâmetro{metrics.length !== 1 ? 's' : ''} fora do normal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.slice(0, 5).map((metric, index) => {
            const isHigh = metric.status.toLowerCase().includes('alto') || metric.status.toLowerCase().includes('elevado')
            const isLow = metric.status.toLowerCase().includes('baixo')

            return (
              <div
                key={`${metric.documentId}-${metric.parameter}-${index}`}
                className="flex items-start justify-between p-3 rounded-lg border border-orange-200 bg-orange-50/30"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${isHigh ? 'bg-red-100' : 'bg-orange-100'}`}>
                    {isHigh ? (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : isLow ? (
                      <TrendingDown className="h-4 w-4 text-orange-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900">{metric.parameter}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-semibold ${isHigh ? 'text-red-600' : 'text-orange-600'}`}>
                        {metric.value} {metric.unit}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${isHigh ? 'border-red-300 text-red-600' : 'border-orange-300 text-orange-600'}`}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(metric.date), "dd 'de' MMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}

          {metrics.length > 5 && (
            <p className="text-xs text-center text-gray-500 mt-2 py-2 bg-gray-50 rounded-lg">
              + {metrics.length - 5} outro{metrics.length - 5 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
