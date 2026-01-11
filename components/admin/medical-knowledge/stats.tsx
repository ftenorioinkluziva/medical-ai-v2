/**
 * Medical Knowledge Stats Component
 * Displays statistics about Cérebro Lógico
 */

import { Card } from '@/components/ui/card'
import { Activity, Calculator, FileText, CheckCircle2 } from 'lucide-react'

interface Stats {
  biomarkers: number
  metrics: number
  protocols: number
  syncedBiomarkers?: number
  syncCoverage?: number
}

interface Props {
  stats: Stats
  isLoading: boolean
}

export function MedicalKnowledgeStats({ stats, isLoading }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Biomarcadores</p>
            <p className="text-2xl font-bold">
              {isLoading ? '...' : stats.biomarkers}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Calculator className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Métricas Calculadas</p>
            <p className="text-2xl font-bold">
              {isLoading ? '...' : stats.metrics}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Protocolos</p>
            <p className="text-2xl font-bold">
              {isLoading ? '...' : stats.protocols}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sincronizados</p>
            <p className="text-2xl font-bold">
              {isLoading ? '...' : `${stats.syncCoverage || 0}%`}
            </p>
            {!isLoading && stats.syncedBiomarkers !== undefined && (
              <p className="text-xs text-muted-foreground">
                {stats.syncedBiomarkers} de {stats.biomarkers}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
