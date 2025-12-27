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
        return 'bg-green-100 text-green-800 border-green-300'
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'abnormal':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-600" />
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
            <div className="flex items-center justify-between p-4 bg-white border-b">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900 uppercase">{title}</h3>
                {module.category && (
                  <span className="text-sm text-gray-500">{module.category}</span>
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
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mx-4 mt-4 rounded-r">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-800 leading-relaxed">{module.summary}</p>
                </div>
              </div>
            )}

            {/* Parameters Table */}
            {hasParameters && (
              <div className="px-4 pb-4 pt-4">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Parâmetro</th>
                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-700 uppercase">Valor</th>
                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-700 uppercase">Unidade</th>
                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-700 uppercase">Referência</th>
                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-700 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {module.parameters.map((param, paramIndex) => {
                        const isAbnormal = param.status && param.status !== 'normal'
                        const isCritical = param.status === 'critical'
                        const hasReference = param.referenceRange && param.referenceRange !== 'N/A'

                        return (
                          <tr
                            key={paramIndex}
                            className={`
                              ${isCritical ? 'bg-red-50' :
                                isAbnormal ? 'bg-yellow-50' :
                                'bg-white'} hover:bg-gray-50 transition-colors
                            `}
                          >
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-gray-900">{param.name}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-sm font-bold ${
                                isCritical ? 'text-red-700' :
                                isAbnormal ? 'text-yellow-700' :
                                'text-gray-900'
                              }`}>
                                {param.value}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-xs text-gray-600">{param.unit || '-'}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-xs text-gray-600">{hasReference ? param.referenceRange : '-'}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isCritical ? (
                                <Badge className="bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-1 px-2 py-0.5">
                                  <AlertCircle className="h-3 w-3" />
                                  <span className="font-semibold text-xs">Crítico</span>
                                </Badge>
                              ) : isAbnormal ? (
                                <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 inline-flex items-center gap-1 px-2 py-0.5">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span className="font-semibold text-xs">{getStatusLabel(param.status)}</span>
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 border border-green-300 inline-flex items-center gap-1 px-2 py-0.5">
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
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border">
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
