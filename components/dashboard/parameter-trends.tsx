'use client'

/**
 * Parameter Trends Widget
 * Display health parameter trends over time
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TrendData {
  date: string
  value: number
  unit: string
  status: string
  referenceRange: string
}

interface ParameterTrendsProps {
  trends: Record<string, TrendData[]>
}

export function ParameterTrends({ trends }: ParameterTrendsProps) {
  const parameters = Object.keys(trends)

  if (parameters.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendências de Parâmetros
          </CardTitle>
          <CardDescription>Evolução dos principais indicadores</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            Envie mais documentos para visualizar tendências
          </p>
        </CardContent>
      </Card>
    )
  }

  // Select first 2 most important parameters with multiple data points
  const selectedParams = parameters
    .filter((param) => trends[param].length >= 2)
    .slice(0, 2)

  if (selectedParams.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendências de Parâmetros
          </CardTitle>
          <CardDescription>Evolução dos principais indicadores</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            Dados insuficientes para gráficos de tendência
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Tendências de Parâmetros
        </CardTitle>
        <CardDescription>Evolução dos principais indicadores ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {selectedParams.map((paramName) => {
          const data = trends[paramName].map((point) => ({
            date: format(new Date(point.date), 'dd/MM', { locale: ptBR }),
            value: point.value,
            fullDate: point.date,
          }))

          const unit = trends[paramName][0].unit
          const latestStatus = trends[paramName][trends[paramName].length - 1].status
          const firstValue = trends[paramName][0].value
          const lastValue = trends[paramName][trends[paramName].length - 1].value
          const percentChange = ((lastValue - firstValue) / firstValue) * 100

          return (
            <div key={paramName} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">{paramName}</h4>
                  <p className="text-xs text-muted-foreground">
                    Último: {lastValue} {unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={latestStatus === 'Normal' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {latestStatus}
                  </Badge>
                  {Math.abs(percentChange) > 5 && (
                    <Badge variant="outline" className="text-xs">
                      {percentChange > 0 ? '+' : ''}
                      {percentChange.toFixed(1)}%
                    </Badge>
                  )}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {paramName}
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0].value} {unit}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={latestStatus === 'Normal' ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    dot={{ fill: latestStatus === 'Normal' ? '#10b981' : '#ef4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )
        })}

        {parameters.length > 2 && (
          <p className="text-xs text-center text-muted-foreground">
            Mostrando 2 de {parameters.length} parâmetros com dados suficientes
          </p>
        )}
      </CardContent>
    </Card>
  )
}
