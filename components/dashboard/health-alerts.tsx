'use client'

/**
 * Health Alerts Widget
 * Display abnormal health parameters
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-green-600" />
            Alertas de Saúde
          </CardTitle>
          <CardDescription>Valores que requerem atenção</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-green-600 mb-1">Tudo Ótimo!</p>
          <p className="text-xs text-muted-foreground">
            Todos os parâmetros estão dentro do normal
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
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
                className="flex items-start justify-between p-3 rounded-lg border border-orange-200 bg-orange-50/50"
              >
                <div className="flex items-start gap-3 flex-1">
                  {isHigh ? (
                    <TrendingUp className="h-5 w-5 text-red-600 mt-0.5" />
                  ) : isLow ? (
                    <TrendingDown className="h-5 w-5 text-orange-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{metric.parameter}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-semibold ${isHigh ? 'text-red-600' : 'text-orange-600'}`}>
                        {metric.value} {metric.unit}
                      </span>
                      <Badge
                        variant="outline"
                        className={isHigh ? 'border-red-600 text-red-600' : 'border-orange-600 text-orange-600'}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(metric.date), "dd 'de' MMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}

          {metrics.length > 5 && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              + {metrics.length - 5} outro{metrics.length - 5 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
