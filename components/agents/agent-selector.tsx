'use client'

/**
 * Agent Selector Component
 * Select which health agent to use for analysis
 */

import { useState, useEffect } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
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

const COLOR_CLASSES: Record<string, string> = {
  green: 'bg-green-100 border-green-300 text-green-900 hover:bg-green-200',
  purple: 'bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200',
  orange: 'bg-orange-100 border-orange-300 text-orange-900 hover:bg-orange-200',
  blue: 'bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200',
  pink: 'bg-pink-100 border-pink-300 text-pink-900 hover:bg-pink-200',
  yellow: 'bg-yellow-100 border-yellow-300 text-yellow-900 hover:bg-yellow-200',
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
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Carregando agentes...</p>
        </div>
      </Card>
    )
  }

  if (agents.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <Sparkles className="h-12 w-12" />
          <div className="text-center">
            <p className="text-sm font-medium">Nenhum agente disponível</p>
            <p className="text-xs mt-1">Contate o administrador</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Selecione um Especialista</h3>
        <p className="text-sm text-muted-foreground">
          Escolha qual agente especializado você quer consultar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id
          const colorClass = COLOR_CLASSES[agent.color] || COLOR_CLASSES.blue
          const emoji = ICON_EMOJI[agent.icon] || '✨'

          return (
            <Card
              key={agent.id}
              className={`
                p-5 cursor-pointer transition-all border-2
                ${isSelected ? `ring-2 ring-offset-2 ${colorClass?.replace('hover:', '') || ''}` : colorClass || ''}
              `}
              onClick={() => onSelectAgent(agent)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{emoji}</div>
                  {isSelected && (
                    <Badge className="bg-primary">Selecionado</Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold">{agent.name}</h4>
                  <p className="text-sm mt-1 opacity-90">
                    {agent.title}
                  </p>
                </div>

                <p className="text-xs opacity-75 line-clamp-2">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between text-xs opacity-60">
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
