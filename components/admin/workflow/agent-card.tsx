'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, Settings2, Mic } from 'lucide-react'
import { ContextSettingsDialog } from './context-settings-dialog'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Agent {
    id: string
    name: string
    title: string
    agentType: 'analysis' | 'product_generator'
    analysisRole: 'foundation' | 'specialized' | 'none'
    isActive: boolean
    contextConfig?: any
}

interface AgentCardProps {
    agent: Agent
    isFirst: boolean
    isLast: boolean
    onToggleActive: (id: string, currentStatus: boolean) => void
    onUpdateContext: (id: string, newConfig: any) => void
    onMoveUp: (id: string) => void
    onMoveDown: (id: string) => void
    onChangeRole: (id: string, newRole: 'foundation' | 'specialized' | 'none') => void
}

export function AgentCard({
    agent,
    isFirst,
    isLast,
    onToggleActive,
    onUpdateContext,
    onMoveUp,
    onMoveDown,
    onChangeRole
}: AgentCardProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const isProduct = agent.agentType === 'product_generator'

    // Helper for role labels
    const getRoleLabel = (role: string) => {
        if (role === 'foundation') return 'Fundação'
        if (role === 'specialized') return 'Especialista'
        if (isProduct && role !== 'none') return 'Produto'
        return 'Inativo'
    }

    return (
        <div className="touch-none">
            <Card className={`mb-3 hover:shadow-md transition-all ${!agent.isActive ? 'opacity-70 bg-muted/50' : ''} ${isProduct ? 'border-l-4 border-l-emerald-400' : ''}`}>
                <CardContent className="p-3 flex items-center gap-3">

                    {/* Reorder Controls */}
                    <div className="flex flex-col gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                            disabled={isFirst}
                            onClick={() => onMoveUp(agent.id)}
                            title="Mover para cima"
                        >
                            <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                            disabled={isLast}
                            onClick={() => onMoveDown(agent.id)}
                            title="Mover para baixo"
                        >
                            <ArrowDown className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* Icon Placeholder or Agent Icon */}
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${agent.isActive ? (isProduct ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary') : 'bg-muted text-muted-foreground'}`}>
                        <Mic className="h-5 w-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                            {!agent.isActive && <Badge variant="outline" className="text-[10px] h-5 px-1 py-0">Inativo</Badge>}
                            {isProduct && <Badge variant="secondary" className="text-[10px] h-5 px-1 py-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Gerador</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{agent.title}</p>
                    </div>

                    {/* Role Selector */}
                    <div className="w-[130px]">
                        <Select
                            value={agent.analysisRole}
                            onValueChange={(val: any) => onChangeRole(agent.id, val)}
                            disabled={isProduct && agent.isActive} // Lock role if active product generator (can only toggle active)
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue>{getRoleLabel(agent.analysisRole)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {!isProduct && (
                                    <>
                                        <SelectItem value="foundation">Fundação</SelectItem>
                                        <SelectItem value="specialized">Especialista</SelectItem>
                                    </>
                                )}
                                {isProduct && (
                                    <SelectItem value="specialized">Ativo (Produto)</SelectItem>
                                )}
                                <SelectItem value="none">Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Visual Indicators for Context (Mini Badges) */}
                    <div className="hidden sm:flex gap-1">
                        {agent.contextConfig?.includeMedicalProfile && <div className="w-2 h-2 rounded-full bg-blue-400" title="Perfil Médico" />}
                        {agent.contextConfig?.includeDocuments && <div className="w-2 h-2 rounded-full bg-amber-400" title="Documentos" />}
                        {agent.contextConfig?.includeRagContext && <div className="w-2 h-2 rounded-full bg-emerald-400" title="RAG" />}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Context Settings Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => setIsSettingsOpen(true)}
                            title="Configurar Contexto"
                        >
                            <Settings2 className="h-4 w-4" />
                        </Button>

                        <Switch
                            checked={agent.isActive}
                            onCheckedChange={() => onToggleActive(agent.id, agent.isActive)}
                        />
                    </div>
                </CardContent>
            </Card>

            <ContextSettingsDialog
                agentName={agent.name}
                config={agent.contextConfig || {
                    includeMedicalProfile: true,
                    includeDocuments: true,
                    includeStructuredData: true,
                    includeRagContext: true,
                    includePreviousAnalysis: true
                }}
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={(newConfig) => onUpdateContext(agent.id, newConfig)}
            />
        </div>
    )
}
