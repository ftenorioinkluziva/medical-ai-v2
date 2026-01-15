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
  green: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-900 dark:text-emerald-100' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', hover: 'hover:bg-purple-100 dark:hover:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-900 dark:text-purple-100' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', hover: 'hover:bg-orange-100 dark:hover:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-900 dark:text-orange-100' },
  blue: { bg: 'bg-sky-50 dark:bg-sky-950/20', hover: 'hover:bg-sky-100 dark:hover:bg-sky-950/30', border: 'border-sky-200 dark:border-sky-800', text: 'text-sky-900 dark:text-sky-100' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-950/20', hover: 'hover:bg-pink-100 dark:hover:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-900 dark:text-pink-100' },
  yellow: { bg: 'bg-amber-50 dark:bg-amber-950/20', hover: 'hover:bg-amber-100 dark:hover:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-900 dark:text-amber-100' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-950/20', hover: 'hover:bg-teal-100 dark:hover:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800', text: 'text-teal-900 dark:text-teal-100' },
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
  analysisRole,
}: {
  onSelectAgent: (agent: HealthAgent) => void
  selectedAgentId?: string
  analysisRole?: 'foundation' | 'specialized' | 'none'
}) {
  const [agents, setAgents] = useState<HealthAgent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [analysisRole])

  const fetchAgents = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ type: 'analysis' })
      if (analysisRole) {
        params.set('analysisRole', analysisRole)
      }
      const response = await fetch(`/api/agents?${params.toString()}`)
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
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
          <p className="text-sm">Carregando especialistas...</p>
        </div>
      </Card>
    )
  }

  if (agents.length === 0) {
    return (
      <Card className="p-8 hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <div className="bg-teal-50 dark:bg-teal-950/20 rounded-lg p-4">
            <Sparkles className="h-12 w-12 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Nenhum agente disponível</p>
            <p className="text-xs mt-1 text-muted-foreground">Contate o administrador</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Selecione um Especialista</h3>
        <p className="text-sm text-muted-foreground mt-1">
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
                  ? `${colors.border} ${colors.bg} shadow-md ring-2 ring-teal-500 dark:ring-teal-400 ring-offset-2 dark:ring-offset-background`
                  : `border-border hover:border-${agent.color || 'teal'}-300 dark:hover:border-${agent.color || 'teal'}-700 hover:shadow-md ${colors.hover}`
                }
              `}
              onClick={() => onSelectAgent(agent)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="text-4xl">{emoji}</div>
                  {isSelected && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-teal-600 dark:bg-teal-500 text-white">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="text-xs font-medium">Selecionado</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-foreground">{agent.name}</h4>
                  <p className="text-sm mt-1 text-foreground">
                    {agent.title}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
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
