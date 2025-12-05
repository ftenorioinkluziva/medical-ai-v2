'use client'

/**
 * Synthesis View
 * Display consolidated synthesis from multiple analyses
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, AlertTriangle, Target, Lightbulb } from 'lucide-react'

interface SynthesisViewProps {
  synthesis: {
    executiveSummary: string
    keyFindings: string[]
    criticalAlerts: string[]
    mainRecommendations: string[]
  }
}

export function SynthesisView({ synthesis }: SynthesisViewProps) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="h-5 w-5" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {synthesis.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Principais Achados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {synthesis.keyFindings.map((finding, index) => (
              <div
                key={index}
                className="flex gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors"
              >
                <Badge className="shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <p className="text-sm text-gray-700">{finding}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {synthesis.criticalAlerts && synthesis.criticalAlerts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {synthesis.criticalAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4 border border-red-300 rounded-lg bg-red-50 items-start"
                >
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900 font-medium">{alert}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Recommendations */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Lightbulb className="h-5 w-5 text-green-600" />
            Recomendações Prioritárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {synthesis.mainRecommendations.map((rec, index) => (
              <div
                key={index}
                className="flex gap-3 p-4 border border-green-200 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors"
              >
                <div className="shrink-0 h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-xs text-center text-gray-600">
          ⚕️ Esta síntese integra análises de múltiplos especialistas e é para fins educacionais.
          Não substitui consulta médica profissional.
        </p>
      </div>
    </div>
  )
}
