/**
 * Knowledge Sync Stats Component
 * Displays statistics about synchronization status
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react'

interface SyncStats {
  suggestions: {
    total: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    byType: Record<string, number>
    conflicts: number
  }
  articles: {
    total: number
    analyzed: number
    unanalyzed: number
    analysisCoverage: number
  }
  audit: {
    byAction: Record<string, number>
  }
}

interface Props {
  stats: SyncStats | null
  isLoading: boolean
}

export function KnowledgeSyncStats({ stats, isLoading }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pending Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes
          </CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? '...' : stats?.suggestions.byStatus.pending || 0}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Aguardando revisão
          </p>
        </CardContent>
      </Card>

      {/* Applied Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Aplicadas
          </CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? '...' : stats?.suggestions.byStatus.applied || 0}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Já sincronizadas
          </p>
        </CardContent>
      </Card>

      {/* Conflicts */}
      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Conflitos
          </CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? '...' : stats?.suggestions.conflicts || 0}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Requerem atenção
          </p>
        </CardContent>
      </Card>

      {/* Article Coverage */}
      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cobertura
          </CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? '...' : `${stats?.articles.analysisCoverage || 0}%`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {isLoading
              ? '...'
              : `${stats?.articles.analyzed || 0}/${stats?.articles.total || 0} artigos`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
