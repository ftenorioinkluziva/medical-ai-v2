'use client'

/**
 * Agent Analysis View
 * Display individual agent analysis
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Utensils, Dumbbell, Lightbulb, Target } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AgentAnalysisViewProps {
  analysis: {
    agentName: string
    agentTitle: string
    analysis: string
    insights?: any
    actionItems?: any
    createdAt: string
  }
  color: 'green' | 'orange' | 'blue'
}

const colorConfig = {
  green: {
    icon: Brain,
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50/50',
    textColor: 'text-green-900',
    badgeColor: 'bg-green-100 text-green-700',
    accentColor: 'bg-green-600',
  },
  orange: {
    icon: Utensils,
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-50/50',
    textColor: 'text-orange-900',
    badgeColor: 'bg-orange-100 text-orange-700',
    accentColor: 'bg-orange-600',
  },
  blue: {
    icon: Dumbbell,
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50/50',
    textColor: 'text-blue-900',
    badgeColor: 'bg-blue-100 text-blue-700',
    accentColor: 'bg-blue-600',
  },
}

export function AgentAnalysisView({ analysis, color }: AgentAnalysisViewProps) {
  const config = colorConfig[color]
  const Icon = config.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`${config.borderColor}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${config.bgColor}`}>
                <Icon className={`h-6 w-6 ${config.textColor}`} />
              </div>
              <div>
                <CardTitle className={config.textColor}>{analysis.agentName}</CardTitle>
                <CardDescription>{analysis.agentTitle}</CardDescription>
              </div>
            </div>
            <Badge className={config.badgeColor}>
              {format(new Date(analysis.createdAt), "dd/MM/yyyy")}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Completa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {analysis.analysis}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {analysis.insights && analysis.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              Insights Principais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.insights.map((insight: string, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 border border-amber-200 rounded-lg bg-amber-50/50"
                >
                  <div className={`shrink-0 h-6 w-6 rounded-full ${config.accentColor} text-white flex items-center justify-center text-xs font-bold`}>
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {analysis.actionItems && analysis.actionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Itens de Ação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.actionItems.map((item: string, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50/50"
                >
                  <div className="shrink-0 h-5 w-5 rounded border-2 border-blue-600 mt-0.5" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-xs text-center text-gray-600">
          ⚕️ Esta análise é gerada por IA especializada e é para fins educacionais.
          Não substitui consulta médica profissional.
        </p>
      </div>
    </div>
  )
}
