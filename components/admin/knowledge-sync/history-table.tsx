/**
 * Sync History Table Component
 * Displays audit log of synchronization actions
 */

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AuditLog {
  id: string
  action: string
  targetType: string | null
  targetSlug: string | null
  changes: any
  notes: string | null
  createdAt: string
  performedBy: string | null
}

interface Props {
  refreshTrigger: number
}

export function SyncHistory({ refreshTrigger }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadHistory()
  }, [refreshTrigger])

  const loadHistory = async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/admin/knowledge-sync/history?limit=50')

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLogs(data.logs)
          setTotal(data.total)
        }
      }
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'biomarker_created':
        return <Badge className="bg-green-500">Criado</Badge>
      case 'biomarker_updated':
        return <Badge className="bg-blue-500">Atualizado</Badge>
      case 'biomarker_reverted':
        return <Badge className="bg-orange-500">Revertido</Badge>
      case 'biomarker_deleted':
        return <Badge className="bg-red-500">Deletado</Badge>
      case 'protocol_created':
        return <Badge className="bg-green-500">Criado</Badge>
      case 'protocol_updated':
        return <Badge className="bg-blue-500">Atualizado</Badge>
      default:
        return <Badge variant="secondary">{action}</Badge>
    }
  }

  const renderChanges = (log: AuditLog) => {
    if (!log.changes) return '-'

    const { before, after } = log.changes

    if (!before) {
      return <span className="text-green-600">Novo registro criado</span>
    }

    if (!after) {
      return <span className="text-red-600">Registro removido</span>
    }

    const changedFields = []

    if (before.optimalMin !== after.optimalMin) {
      changedFields.push(`Ótimo Mín: ${before.optimalMin} → ${after.optimalMin}`)
    }

    if (before.optimalMax !== after.optimalMax) {
      changedFields.push(`Ótimo Máx: ${before.optimalMax} → ${after.optimalMax}`)
    }

    if (before.labMin !== after.labMin) {
      changedFields.push(`Lab Mín: ${before.labMin} → ${after.labMin}`)
    }

    if (before.labMax !== after.labMax) {
      changedFields.push(`Lab Máx: ${before.labMax} → ${after.labMax}`)
    }

    return changedFields.length > 0 ? changedFields.join(', ') : 'Sem mudanças'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando histórico...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>Nenhuma ação registrada ainda</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            {total} registro{total !== 1 ? 's' : ''} no histórico
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Alvo</TableHead>
                <TableHead>Mudanças</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    {log.targetType ? (
                      <Badge variant="outline">{log.targetType}</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.targetSlug || '-'}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-sm">
                    {renderChanges(log)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {log.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
