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
            {/* Module Header - Compact */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 bg-muted/50 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-foreground">{title}</h3>
                {module.category && (
                  <span className="text-xs text-muted-foreground">• {module.category}</span>
                )}
              </div>
              {moduleStatus && (
                <Badge className={`${getStatusColor(moduleStatus)} flex items-center gap-1 px-2 py-0.5 text-xs font-semibold shrink-0 w-fit`}>
                  {getStatusIcon(moduleStatus)}
                  <span>{getStatusLabel(moduleStatus)}</span>
                </Badge>
              )}
            </div>

            {/* Summary Section - Compact */}
            {module.summary && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 dark:border-blue-600 p-2.5 sm:p-3 mx-3 sm:mx-4 mt-3 rounded-r">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">{module.summary}</p>
                </div>
              </div>
            )}

            {/* Parameters - Responsive Layout */}
            {hasParameters && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-3 sm:pt-4">
                {/* Mobile: Card Layout */}
                <div className="sm:hidden space-y-3">
                  {module.parameters.map((param, paramIndex) => {
                    const normalized = normalizeStatus(param.status)
                    const isAbnormal = normalized === 'abnormal'
                    const isCritical = normalized === 'critical'
                    const hasReference = param.referenceRange && param.referenceRange !== 'N/A'

                    return (
                      <div
                        key={paramIndex}
                        className={`
                          rounded-lg border-2 p-3 ${
                          isCritical ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700' :
                          isAbnormal ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-700' :
                          'bg-card border-border'
                        }`}
                      >
                        {/* Parameter Name & Status */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-foreground flex-1">{param.name}</h4>
                          {isCritical ? (
                            <Badge className="bg-red-600 text-white border-0 shrink-0">
                              Crítico
                            </Badge>
                          ) : isAbnormal ? (
                            <Badge className="bg-yellow-600 text-white border-0 shrink-0">
                              Anormal
                            </Badge>
                          ) : (
                            <Badge className="bg-green-600 text-white border-0 shrink-0">
                              Normal
                            </Badge>
                          )}
                        </div>

                        {/* Value & Unit */}
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className={`text-2xl font-bold ${
                            isCritical ? 'text-red-700 dark:text-red-300' :
                            isAbnormal ? 'text-yellow-700 dark:text-yellow-300' :
                            'text-foreground'
                          }`}>
                            {param.value}
                          </span>
                          {param.unit && (
                            <span className="text-sm text-muted-foreground">{param.unit}</span>
                          )}
                        </div>

                        {/* Reference Range */}
                        {hasReference && (
                          <div className="text-xs text-muted-foreground">
                            Referência: {param.referenceRange}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Desktop: Table Layout */}
                <div className="hidden sm:block rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="text-left py-2 px-3 text-xs font-bold text-foreground uppercase">Parâmetro</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-foreground uppercase">Valor</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-foreground uppercase">Unidade</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-foreground uppercase">Referência</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-foreground uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {module.parameters.map((param, paramIndex) => {
                        const normalized = normalizeStatus(param.status)
                        const isAbnormal = normalized === 'abnormal'
                        const isCritical = normalized === 'critical'
                        const hasReference = param.referenceRange && param.referenceRange !== 'N/A'

                        return (
                          <tr
                            key={paramIndex}
                            className={`
                              ${isCritical ? 'bg-red-50 dark:bg-red-950/20' :
                                isAbnormal ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                                'bg-card'} hover:bg-muted transition-colors
                            `}
                          >
                            <td className="py-2.5 px-3">
                              <span className="text-sm font-medium text-foreground">{param.name}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`text-sm font-bold ${
                                isCritical ? 'text-red-700 dark:text-red-300' :
                                isAbnormal ? 'text-yellow-700 dark:text-yellow-300' :
                                'text-foreground'
                              }`}>
                                {param.value}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-xs text-muted-foreground">{param.unit || '-'}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-xs text-muted-foreground">{hasReference ? param.referenceRange : '-'}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isCritical ? (
                                <Badge className="bg-red-600 text-white border-0">
                                  Crítico
                                </Badge>
                              ) : isAbnormal ? (
                                <Badge className="bg-yellow-600 text-white border-0">
                                  Anormal
                                </Badge>
                              ) : (
                                <Badge className="bg-green-600 text-white border-0">
                                  Normal
                                </Badge>
                              )}
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
