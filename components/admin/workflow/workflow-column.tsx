'use client'

import { AgentCard } from './agent-card'
import { cn } from '@/lib/utils'

interface WorkflowColumnProps {
    id: string
    title: string
    description?: string
    icon?: React.ElementType
    color?: string
    agents: any[]
    onToggleActive: (id: string, currentStatus: boolean) => void
    onUpdateContext: (id: string, newConfig: any) => void
    onMoveUp: (id: string) => void
    onMoveDown: (id: string) => void
    onChangeRole: (id: string, newRole: 'foundation' | 'specialized' | 'none') => void
}

export function WorkflowColumn({
    id,
    title,
    description,
    icon: Icon,
    color = 'bg-slate-100', // default color
    agents,
    onToggleActive,
    onUpdateContext,
    onMoveUp,
    onMoveDown,
    onChangeRole
}: WorkflowColumnProps) {

    return (
        <div className="flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <div className={cn("p-4 border-b", color)}>
                <div className="flex items-center gap-2 mb-1">
                    {Icon && <Icon className="h-5 w-5 opacity-70" />}
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <span className="ml-auto text-xs font-medium bg-background/50 px-2 py-0.5 rounded-full">
                        {agents.length}
                    </span>
                </div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-muted/20 p-3">
                <div className="min-h-[100px] flex flex-col gap-3">
                    {agents.map((agent, index) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            isFirst={index === 0}
                            isLast={index === agents.length - 1}
                            onToggleActive={onToggleActive}
                            onUpdateContext={onUpdateContext}
                            onMoveUp={onMoveUp}
                            onMoveDown={onMoveDown}
                            onChangeRole={onChangeRole}
                        />
                    ))}
                    {agents.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-sm text-muted-foreground italic">
                            Sem agentes nesta etapa
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
