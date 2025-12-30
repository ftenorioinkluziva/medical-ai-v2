'use client'

/**
 * Structured Data Display Component
 * Renders structured medical data in a professional lab report format
 */

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

interface Parameter {
  name: string
  value: number | string
  unit?: string
  referenceRange?: string
  status?: 'normal' | 'abnormal' | 'critical'
}

interface Module {
  moduleName?: string
  type?: string
  category?: string
  status?: 'normal' | 'abnormal' | 'critical'
  summary?: string
  parameters?: Parameter[]
  [key: string]: any
}

interface StructuredDataDisplayProps {
  modules: Module[]
}

export function StructuredDataDisplay({ modules }: StructuredDataDisplayProps) {

  // Normalize status from schema values to display values
  const normalizeStatus = (status?: string): 'normal' | 'abnormal' | 'critical' | undefined => {
    const s = status?.toLowerCase()
    if (s === 'normal') return 'normal'
    if (s === 'high' || s === 'low' || s === 'borderline' || s === 'abnormal') return 'abnormal'
    if (s === 'critical') return 'critical'
    return undefined
  }

  const getStatusColor = (status?: string) => {
    const normalized = normalizeStatus(status)
    switch (normalized) {
      case 'normal':
        return 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
      case 'abnormal':
        return 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
      case 'critical':
        return 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700'
      default:
        return 'bg-muted text-foreground border-border'
    }
  }

  const getStatusIcon = (status?: string) => {
    const normalized = normalizeStatus(status)
    switch (normalized) {
      case 'normal':
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'abnormal':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusLabel = (status?: string) => {
    const s = status?.toLowerCase()
    if (s === 'normal') return 'Normal'
    if (s === 'high') return 'Alto'
    if (s === 'low') return 'Baixo'
    if (s === 'borderline') return 'Limítrofe'
    if (s === 'abnormal') return 'Anormal'
    if (s === 'critical') return 'Crítico'
    return status || 'N/A'
  }

  return (
    <div className="space-y-3">
      {modules.map((module, index) => {
        const title = module.moduleName || module.type || `Módulo ${index + 1}`
        const hasParameters = module.parameters && Array.isArray(module.parameters) && module.parameters.length > 0
        const moduleStatus = module.status

        return (
          <Card key={index} className="overflow-hidden">
            {/* Module Header - Minimal */}
            <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-muted/50 border-b">
              <h3 className="text-xs sm:text-sm font-bold text-foreground">{title}</h3>
              {moduleStatus && normalizeStatus(moduleStatus) !== 'normal' && (
                <Badge className={`${getStatusColor(moduleStatus)} px-1.5 py-0 text-xs font-semibold shrink-0`}>
                  {getStatusLabel(moduleStatus)}
                </Badge>
              )}
            </div>

            {/* Parameters - Responsive Layout */}
            {hasParameters && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-3 sm:pt-4">
                {/* Mobile: Minimal Card Layout */}
                <div className="sm:hidden space-y-2">
                  {module.parameters.map((param, paramIndex) => {
                    const normalized = normalizeStatus(param.status)
                    const isAbnormal = normalized === 'abnormal'
                    const isCritical = normalized === 'critical'

                    return (
                      <div
                        key={paramIndex}
                        className={`
                          rounded border-l-4 p-2 ${
                          isCritical ? 'bg-red-50/50 dark:bg-red-950/10 border-red-500' :
                          isAbnormal ? 'bg-yellow-50/50 dark:bg-yellow-950/10 border-yellow-500' :
                          'bg-card border-green-500'
                        }`}
                      >
                        {/* Parameter Name */}
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          {param.name}
                        </div>

                        {/* Value & Unit */}
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-lg font-bold ${
                            isCritical ? 'text-red-700 dark:text-red-300' :
                            isAbnormal ? 'text-yellow-700 dark:text-yellow-300' :
                            'text-foreground'
                          }`}>
                            {param.value}
                          </span>
                          {param.unit && (
                            <span className="text-xs text-muted-foreground">{param.unit}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop: Minimal Table Layout */}
                <div className="hidden sm:block rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="text-left py-1.5 px-2 text-xs font-bold text-foreground uppercase">Parâmetro</th>
                        <th className="text-right py-1.5 px-2 text-xs font-bold text-foreground uppercase">Valor</th>
                        <th className="text-left py-1.5 px-2 text-xs font-bold text-foreground uppercase">Unidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {module.parameters.map((param, paramIndex) => {
                        const normalized = normalizeStatus(param.status)
                        const isAbnormal = normalized === 'abnormal'
                        const isCritical = normalized === 'critical'

                        return (
                          <tr
                            key={paramIndex}
                            className={`
                              ${isCritical ? 'bg-red-50 dark:bg-red-950/10 border-l-4 border-l-red-500' :
                                isAbnormal ? 'bg-yellow-50 dark:bg-yellow-950/10 border-l-4 border-l-yellow-500' :
                                'bg-card border-l-4 border-l-green-500'} hover:bg-muted/50 transition-colors
                            `}
                          >
                            <td className="py-1.5 px-2">
                              <span className="text-xs font-medium text-foreground">{param.name}</span>
                            </td>
                            <td className="py-1.5 px-2 text-right">
                              <span className={`text-sm font-bold ${
                                isCritical ? 'text-red-700 dark:text-red-300' :
                                isAbnormal ? 'text-yellow-700 dark:text-yellow-300' :
                                'text-foreground'
                              }`}>
                                {param.value}
                              </span>
                            </td>
                            <td className="py-1.5 px-2">
                              <span className="text-xs text-muted-foreground">{param.unit || '-'}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Fallback for non-standard structure */}
            {!hasParameters && (
              <div className="p-4">
                <pre className="text-xs text-foreground whitespace-pre-wrap font-mono bg-muted p-3 rounded border">
                  {JSON.stringify(
                    Object.fromEntries(
                      Object.entries(module).filter(([key]) =>
                        !['moduleName', 'type', 'category', 'status', 'summary', 'parameters'].includes(key)
                      )
                    ),
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
