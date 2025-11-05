'use client'

/**
 * Dashboard Stats Cards - Minimal Health Design
 * Clean, functional display of key metrics
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Brain, TrendingUp, AlertCircle } from 'lucide-react'

interface StatsCardsProps {
  documentsCount: number
  analysesCount: number
  agentsUsedCount: number
  abnormalParametersCount: number
}

export function StatsCards({
  documentsCount,
  analysesCount,
  agentsUsedCount,
  abnormalParametersCount,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Documentos',
      value: documentsCount,
      description: 'Exames enviados',
      icon: FileText,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      title: 'Análises',
      value: analysesCount,
      description: 'Análises realizadas',
      icon: Brain,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      title: 'Especialistas',
      value: agentsUsedCount,
      description: 'Agentes consultados',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Alertas',
      value: abnormalParametersCount,
      description: 'Valores alterados',
      icon: AlertCircle,
      color: abnormalParametersCount > 0 ? 'text-orange-600' : 'text-gray-400',
      bg: abnormalParametersCount > 0 ? 'bg-orange-50' : 'bg-gray-50',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
