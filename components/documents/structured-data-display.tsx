/**
 * Structured Data Display Component
 * Renders structured medical data in a professional lab report format
 */

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, AlertTriangle, User, Building2 } from 'lucide-react'

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
        return <Activity className="h-4 w-4 text-gray-600" />
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

  const renderParametersTable = (parameters: Parameter[]) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase">Parâmetro</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-600 uppercase">Valor</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-600 uppercase">Unidade</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-600 uppercase">Referência</th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((param, index) => {
              const isAbnormal = param.status && param.status !== 'normal'
              const hasReference = param.referenceRange && param.referenceRange !== 'N/A'

              return (
                <tr
                  key={index}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${isAbnormal ? 'bg-red-50' : ''}`}
                >
                  <td className="py-3 px-3 text-sm font-medium text-gray-900">{param.name}</td>
                  <td className="py-3 px-3 text-sm font-semibold text-gray-900 text-center">{param.value}</td>
                  <td className="py-3 px-3 text-xs text-gray-600 text-center">{param.unit || '-'}</td>
                  <td className="py-3 px-3 text-xs text-gray-600 text-center">{hasReference ? param.referenceRange : '-'}</td>
                  <td className="py-3 px-3 text-center">
                    {isAbnormal ? (
                      <Badge variant="destructive" className="text-xs flex items-center gap-1 justify-center">
                        <AlertCircle className="h-3 w-3" />
                        {getStatusLabel(param.status)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
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
    )
  }

  return (
    <div className="space-y-6">
      {modules.map((module, index) => {
        const title = module.moduleName || module.type || `Módulo ${index + 1}`
        const hasParameters = module.parameters && Array.isArray(module.parameters) && module.parameters.length > 0
        const moduleStatus = module.status

        return (
          <div key={index} className="space-y-4">
            {/* Module Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900 uppercase">{title}</h3>
                {module.category && (
                  <span className="text-sm text-gray-600">{module.category}</span>
                )}
              </div>
              {moduleStatus && (
                <Badge variant={moduleStatus === 'abnormal' ? 'destructive' : 'outline'} className="flex items-center gap-1">
                  {getStatusIcon(moduleStatus)}
                  <span>{getStatusLabel(moduleStatus)}</span>
                </Badge>
              )}
            </div>

            {/* Summary */}
            {module.summary && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-gray-800 italic">{module.summary}</p>
              </div>
            )}

            {/* Parameters Table */}
            {hasParameters ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {renderParametersTable(module.parameters)}
              </div>
            ) : (
              /* Fallback for non-standard structure */
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto">
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
          </div>
        )
      })}
    </div>
  )
}
