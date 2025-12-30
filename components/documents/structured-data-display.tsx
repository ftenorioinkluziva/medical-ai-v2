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

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
      case 'normal':
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'abnormal':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return 'Normal'
      case 'abnormal':
        return 'Anormal'
      case 'critical':
        return 'Crítico'
      default:
        return status || 'N/A'
    }
  }

  return (
    <div className="space-y-4">
      {modules.map((module, index) => {
        const title = module.moduleName || module.type || `Módulo ${index + 1}`
        const hasParameters = module.parameters && Array.isArray(module.parameters) && module.parameters.length > 0
        const moduleStatus = module.status

        return (
          <Card key={index} className="overflow-hidden">
            {/* Module Header */}
            <div className="flex items-center justify-between p-4 bg-card border-b">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-foreground uppercase">{title}</h3>
                {module.category && (
                  <span className="text-sm text-muted-foreground">{module.category}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {moduleStatus && (
                  <Badge className={`${getStatusColor(moduleStatus)} flex items-center gap-1.5 px-3 py-1 font-semibold`}>
                    {getStatusIcon(moduleStatus)}
                    <span>{getStatusLabel(moduleStatus)}</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Summary Section */}
            {module.summary && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 dark:border-blue-600 p-4 mx-4 mt-4 rounded-r">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">{module.summary}</p>
                </div>
              </div>
            )}

            {/* Parameters Table */}
            {hasParameters && (
              <div className="px-4 pb-4 pt-4">
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="text-left py-3 px-4 text-xs font-bold text-foreground uppercase">Parâmetro</th>
                        <th className="text-center py-3 px-4 text-xs font-bold text-foreground uppercase">Valor</th>
                        <th className="text-center py-3 px-4 text-xs font-bold text-foreground uppercase">Unidade</th>
                        <th className="text-center py-3 px-4 text-xs font-bold text-foreground uppercase">Referência</th>
                        <th className="text-center py-3 px-4 text-xs font-bold text-foreground uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {module.parameters.map((param, paramIndex) => {
                        const isAbnormal = param.status && param.status !== 'normal'
                        const isCritical = param.status === 'critical'
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
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-foreground">{param.name}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-sm font-bold ${
                                isCritical ? 'text-red-700 dark:text-red-300' :
                                isAbnormal ? 'text-yellow-700 dark:text-yellow-300' :
                                'text-foreground'
                              }`}>
                                {param.value}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-xs text-muted-foreground">{param.unit || '-'}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-xs text-muted-foreground">{hasReference ? param.referenceRange : '-'}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isCritical ? (
                                <Badge className="bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700 inline-flex items-center gap-1 px-2 py-0.5">
                                  <AlertCircle className="h-3 w-3" />
                                  <span className="font-semibold text-xs">Crítico</span>
                                </Badge>
                              ) : isAbnormal ? (
                                <Badge className="bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700 inline-flex items-center gap-1 px-2 py-0.5">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span className="font-semibold text-xs">{getStatusLabel(param.status)}</span>
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700 inline-flex items-center gap-1 px-2 py-0.5">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span className="font-semibold text-xs">Normal</span>
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
