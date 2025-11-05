'use client'

/**
 * Agent Selector Component - Minimal Health Design
 * Select which health agent to use for analysis
 */

import { useState, useEffect } from 'react'
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface HealthAgent {
  id: string
  agentKey: string
  name: string
  title: string
  description: string
  color: string
  icon: string
  modelName: string
  isActive: boolean
}

const COLOR_CLASSES: Record<string, { bg: string; hover: string; border: string; text: string }> = {
  green: { bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-900' },
  purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', border: 'border-purple-200', text: 'text-purple-900' },
  orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', border: 'border-orange-200', text: 'text-orange-900' },
  blue: { bg: 'bg-sky-50', hover: 'hover:bg-sky-100', border: 'border-sky-200', text: 'text-sky-900' },
  pink: { bg: 'bg-pink-50', hover: 'hover:bg-pink-100', border: 'border-pink-200', text: 'text-pink-900' },
  yellow: { bg: 'bg-amber-50', hover: 'hover:bg-amber-100', border: 'border-amber-200', text: 'text-amber-900' },
  teal: { bg: 'bg-teal-50', hover: 'hover:bg-teal-100', border: 'border-teal-200', text: 'text-teal-900' },
}

const ICON_EMOJI: Record<string, string> = {
  leaf: '🌿',
  scale: '⚖️',
  carrot: '🥗',
  dumbbell: '💪',
  stethoscope: '🩺',
  sparkles: '✨',
}

export function AgentSelector({
  onSelectAgent,
  selectedAgentId,
}: {
  onSelectAgent: (agent: HealthAgent) => void
  selectedAgentId?: string
}) {
  const [agents, setAgents] = useState<HealthAgent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()

      if (data.success) {
        setAgents(data.agents)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-8 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center justify-center gap-4 text-gray-600">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm">Carregando especialistas...</p>
        </div>
      </Card>
    )
  }

  if (agents.length === 0) {
    return (
      <Card className="p-8 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center justify-center gap-4 text-gray-600">
          <div className="bg-teal-50 rounded-lg p-4">
            <Sparkles className="h-12 w-12 text-teal-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">Nenhum agente disponível</p>
            <p className="text-xs mt-1 text-gray-600">Contate o administrador</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Selecione um Especialista</h3>
        <p className="text-sm text-gray-600 mt-1">
          Escolha qual agente especializado você quer consultar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id
          const colors = COLOR_CLASSES[agent.color] || COLOR_CLASSES.teal
          const emoji = ICON_EMOJI[agent.icon] || '✨'

          return (
            <Card
              key={agent.id}
              className={`
                p-5 cursor-pointer transition-all border
                ${isSelected
                  ? `${colors.border} ${colors.bg} shadow-md ring-2 ring-teal-500 ring-offset-2`
                  : `border-gray-200 hover:border-${agent.color || 'teal'}-300 hover:shadow-md ${colors.hover}`
                }
              `}
              onClick={() => onSelectAgent(agent)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="text-4xl">{emoji}</div>
                  {isSelected && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-teal-600 text-white">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="text-xs font-medium">Selecionado</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                  <p className="text-sm mt-1 text-gray-700">
                    {agent.title}
                  </p>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{agent.modelName}</span>
                  <Badge variant="outline" className="text-xs">
                    {agent.agentKey}
                  </Badge>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
