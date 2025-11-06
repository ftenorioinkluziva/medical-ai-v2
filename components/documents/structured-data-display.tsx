/**
 * Structured Data Display Component
 * Renders structured medical data in a user-friendly format
 */

import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Activity, AlertTriangle } from 'lucide-react'

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

  const renderParameterValue = (param: Parameter) => {
    const hasReference = param.referenceRange && param.referenceRange !== 'N/A'
    const isAbnormal = param.status && param.status !== 'normal'

    return (
      <div className={`grid grid-cols-[auto_1fr_auto] gap-3 py-3 px-3 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors ${isAbnormal ? 'bg-yellow-50/50' : ''}`}>
        {/* Icon + Name + Reference */}
        <div className="flex items-center justify-center flex-shrink-0">
          {getStatusIcon(param.status)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="font-semibold text-sm text-gray-900">{param.name}</p>
            {isAbnormal && (
              <Badge variant="outline" className={`text-xs ${getStatusColor(param.status)}`}>
                {getStatusLabel(param.status)}
              </Badge>
            )}
          </div>
          {hasReference && (
            <p className="text-xs text-gray-500 mt-0.5">
              Referência: {param.referenceRange}
            </p>
          )}
        </div>

        {/* Value */}
        <div className="flex items-center justify-end flex-shrink-0">
          <div className={`text-right px-3 py-1 rounded-md ${isAbnormal ? 'bg-white border border-yellow-300' : 'bg-gray-100'}`}>
            <span className="font-bold text-base text-gray-900">
              {param.value}
            </span>
            {param.unit && (
              <span className="text-xs text-gray-600 ml-1 font-normal">{param.unit}</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {modules.map((module, index) => {
        const title = module.moduleName || module.type || `Módulo ${index + 1}`
        const hasParameters = module.parameters && Array.isArray(module.parameters) && module.parameters.length > 0
        const moduleStatus = module.status

        return (
          <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
            {/* Module Header */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-3 border-b border-gray-200">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm text-gray-900 break-words">{title}</h4>
                  {moduleStatus && (
                    <Badge variant="outline" className={`${getStatusColor(moduleStatus)} flex-shrink-0`}>
                      {getStatusIcon(moduleStatus)}
                      <span className="ml-1">{getStatusLabel(moduleStatus)}</span>
                    </Badge>
                  )}
                </div>
                {module.category && (
                  <p className="text-xs text-gray-600 break-words">
                    <span className="font-medium">Categoria:</span> {module.category}
                  </p>
                )}
              </div>
            </div>

            {/* Module Content */}
            <div className="p-3 bg-white">
              {/* Summary */}
              {module.summary && (
                <Alert className="mb-3 border-teal-200 bg-teal-50">
                  <AlertDescription className="text-xs text-gray-700 break-words">
                    <span className="font-medium">Resumo:</span> {module.summary}
                  </AlertDescription>
                </Alert>
              )}

              {/* Parameters */}
              {hasParameters ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Parâmetros
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {module.parameters.length} exames
                    </Badge>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    {module.parameters.map((param, paramIndex) => (
                      <div key={paramIndex}>
                        {renderParameterValue(param)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Fallback for non-standard structure */
                <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono break-all">
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
          </div>
        )
      })}
    </div>
  )
}
