'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, RotateCcw, Box, Brain, GraduationCap, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkflowColumn } from './workflow-column'
import { useRouter } from 'next/navigation'

interface Agent {
    id: string
    name: string
    title: string
    agentType: 'analysis' | 'product_generator'
    analysisRole: 'foundation' | 'specialized' | 'none'
    analysisOrder: number | null
    isActive: boolean
    contextConfig?: any
}

// Columns definition for ease of management
const COLUMNS = {
    foundation: 'foundation',
    specialized: 'specialized',
    products: 'products',
    unassigned: 'unassigned'
}

export function AnalysisWorkflowManager() {
    const router = useRouter()
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchAgents()
    }, [])

    const fetchAgents = async () => {
        try {
            const response = await fetch('/api/admin/workflow/agents')
            const data = await response.json()
            if (data.success) {
                // Ensure sorting on load
                const sorted = data.agents.sort((a: Agent, b: Agent) => (a.analysisOrder || 0) - (b.analysisOrder || 0))
                setAgents(sorted)
            } else {
                toast.error('Erro ao carregar agentes')
            }
        } catch (error) {
            console.error('Error fetching agents:', error)
            toast.error('Falha na comunicação com servidor')
        } finally {
            setLoading(false)
        }
    }

    // Helper to categorize agents into columns
    const getAgentsByColumn = () => {
        const foundation = agents
            .filter(a => a.agentType === 'analysis' && a.analysisRole === 'foundation')
            .sort((a, b) => (a.analysisOrder || 0) - (b.analysisOrder || 0))

        const specialized = agents
            .filter(a => a.agentType === 'analysis' && a.analysisRole === 'specialized')
            .sort((a, b) => (a.analysisOrder || 0) - (b.analysisOrder || 0))

        const products = agents
            .filter(a => a.agentType === 'product_generator' && a.isActive)
            .sort((a, b) => (a.analysisOrder || 0) - (b.analysisOrder || 0))

        const unassigned = agents
            .filter(a => a.analysisRole === 'none' || !a.isActive)
            .filter(a => {
                if (a.agentType === 'product_generator') return !a.isActive
                return a.analysisRole === 'none'
            })

        return { foundation, specialized, products, unassigned }
    }

    const { foundation, specialized, products, unassigned } = getAgentsByColumn()

    const handleSave = async () => {
        setSaving(true)
        try {
            // Apply final clean ordering before save
            // Recalculate orders based on current visual state

            // Re-fetch current state to ensure we capture all
            const currentFoundation = foundation
            const currentSpecialized = specialized
            const currentProducts = products
            const currentUnassigned = unassigned

            const updates = [
                ...currentFoundation.map((a, idx) => ({ ...a, analysisRole: 'foundation', analysisOrder: idx + 1 })),
                ...currentSpecialized.map((a, idx) => ({ ...a, analysisRole: 'specialized', analysisOrder: idx + 1 })),
                ...currentProducts.map((a, idx) => ({
                    ...a,
                    analysisOrder: idx + 1,
                    isActive: true,
                })),
                ...currentUnassigned.map((a) => ({
                    ...a,
                    analysisRole: a.agentType === 'analysis' ? 'none' : a.analysisRole,
                    analysisOrder: null,
                    isActive: false
                }))
            ]

            const payload = updates.map(a => ({
                id: a.id,
                analysisRole: a.analysisRole as any,
                analysisOrder: a.analysisOrder,
                isActive: a.isActive,
                contextConfig: a.contextConfig
            }))

            const response = await fetch('/api/admin/workflow/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: payload })
            })

            const data = await response.json()
            if (data.success) {
                toast.success(`Fluxo atualizado! ${data.count} agentes salvos.`)
                fetchAgents() // Refresh
            } else {
                throw new Error(data.error)
            }

        } catch (error) {
            console.error('Save error:', error)
            toast.error('Erro ao salvar alterações')
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = (id: string, currentStatus: boolean) => {
        setAgents(prev => prev.map(a =>
            a.id === id ? { ...a, isActive: !currentStatus } : a
        ))
    }

    const handleUpdateContext = (id: string, newConfig: any) => {
        setAgents(prev => prev.map(a =>
            a.id === id ? { ...a, contextConfig: newConfig } : a
        ))
        toast.success('Configuração de contexto atualizada (pendente de salvar)')
    }

    // --- New Movement Logic ---

    // Generic move up/down within the VISIBLE list the agent is currently in
    const moveAgentInList = (id: string, direction: 'up' | 'down') => {
        const agent = agents.find(a => a.id === id)
        if (!agent) return

        // 1. Identify which list this agent belongs to currently needs to match UI
        let list: Agent[] = []

        if (agent.agentType === 'product_generator' && agent.isActive) {
            list = products // Using the derived state directly
        } else if (agent.agentType === 'analysis' && agent.analysisRole === 'foundation') {
            list = foundation
        } else if (agent.agentType === 'analysis' && agent.analysisRole === 'specialized') {
            list = specialized
        } else {
            list = unassigned
        }

        const currentIndex = list.findIndex(a => a.id === id)
        if (currentIndex === -1) return

        // Create a copy of list to manipulate
        const newList = [...list]

        if (direction === 'up') {
            if (currentIndex <= 0) return // Can't move up
            // Swap in array
            const temp = newList[currentIndex]
            newList[currentIndex] = newList[currentIndex - 1]
            newList[currentIndex - 1] = temp
        } else {
            if (currentIndex === list.length - 1) return // Can't move down
            // Swap in array
            const temp = newList[currentIndex]
            newList[currentIndex] = newList[currentIndex + 1]
            newList[currentIndex + 1] = temp
        }

        // Re-assign execution order based on new array position
        // This ensures orders are always 1, 2, 3... correcting any previous nulls/zeros
        const updates = newList.map((a, index) => ({
            id: a.id,
            analysisOrder: index + 1
        }))

        // Merge updates into main state
        setAgents(prev => prev.map(a => {
            const update = updates.find(u => u.id === a.id)
            return update ? { ...a, analysisOrder: update.analysisOrder } : a
        }))
    }

    const handleMoveUp = (id: string) => moveAgentInList(id, 'up')
    const handleMoveDown = (id: string) => moveAgentInList(id, 'down')

    const handleChangeRole = (id: string, newRole: 'foundation' | 'specialized' | 'none') => {
        setAgents(prev => {
            return prev.map(a => {
                if (a.id === id) {
                    // Logic for Product Generators
                    if (a.agentType === 'product_generator') {
                        return {
                            ...a,
                            isActive: newRole !== 'none',
                            analysisOrder: 999 // Send to end of list initially
                        }
                    }

                    // Logic for Analysis agents
                    const targetListCount = prev.filter(p => p.agentType === 'analysis' && p.analysisRole === newRole).length
                    return {
                        ...a,
                        analysisRole: newRole as any,
                        analysisOrder: targetListCount + 1,
                        isActive: newRole !== 'none'
                    }
                }
                return a
            })
        })
    }


    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Editor de Fluxo de Análise
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Gerencie Analistas e Geradores de Produto. Use as setas para ordenar.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchAgents} disabled={saving} size="sm">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Resetar
                    </Button>
                    <Button onClick={handleSave} disabled={saving} size="sm">
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            {/* Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">

                {/* Col 1: Foundation */}
                <WorkflowColumn
                    id={COLUMNS.foundation}
                    title="1. Fundação"
                    description="Analistas sequenciais."
                    icon={GraduationCap}
                    color="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-800"
                    agents={foundation}
                    onToggleActive={handleToggleActive}
                    onUpdateContext={handleUpdateContext}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onChangeRole={handleChangeRole}
                />

                {/* Col 2: Specialized */}
                <WorkflowColumn
                    id={COLUMNS.specialized}
                    title="2. Especialistas"
                    description="Analistas paralelos."
                    icon={Brain}
                    color="border-purple-200 bg-purple-50/50 dark:bg-purple-950/10 dark:border-purple-800"
                    agents={specialized}
                    onToggleActive={handleToggleActive}
                    onUpdateContext={handleUpdateContext}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onChangeRole={handleChangeRole}
                />

                {/* Col 3: Products */}
                <WorkflowColumn
                    id={COLUMNS.products}
                    title="3. Produtos"
                    description="Geradores finais (Weekly, Recs)."
                    icon={FileText}
                    color="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10 dark:border-emerald-800"
                    agents={products}
                    onToggleActive={handleToggleActive}
                    onUpdateContext={handleUpdateContext}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onChangeRole={handleChangeRole}
                />

                {/* Col 4: Unassigned */}
                <WorkflowColumn
                    id={COLUMNS.unassigned}
                    title="Inativos"
                    description="Fora do fluxo."
                    icon={Box}
                    color="border-slate-200 bg-slate-50/50 dark:bg-slate-900/20 dark:border-slate-800"
                    agents={unassigned}
                    onToggleActive={handleToggleActive}
                    onUpdateContext={handleUpdateContext}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onChangeRole={handleChangeRole}
                />

            </div>
        </div>
    )
}
