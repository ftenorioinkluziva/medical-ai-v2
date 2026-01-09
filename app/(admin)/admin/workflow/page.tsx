
import { Metadata } from 'next'
import { requirePermission } from '@/lib/auth/session'
import { AnalysisWorkflowManager } from '@/components/admin/workflow/analysis-workflow-manager'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
    title: 'Fluxo de Análise | Admin',
    description: 'Gerenciar ordem e fluxo de execução dos agentes de IA',
}

export default async function AnalysisWorkflowPage() {
    await requirePermission('manage_agents')

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Fluxo de Análise</h2>
                    <p className="text-muted-foreground">
                        Configure a ordem de execução e o contexto dos agentes na Análise Completa.
                    </p>
                </div>
            </div>
            <Separator />
            <AnalysisWorkflowManager />
        </div>
    )
}
