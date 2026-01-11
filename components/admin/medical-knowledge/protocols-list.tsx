/**
 * Protocols List Component
 * Displays protocols from Cérebro Lógico
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCcw, FileText, Filter, Pencil } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProtocolEditDialog } from './protocol-edit-dialog'

interface Protocol {
  id: string
  triggerCondition: string
  type: string
  title: string
  description: string
  dosage: string | null
  sourceRef: string | null
  createdAt: Date
}

interface Props {
  searchQuery: string
}

export function ProtocolsList({ searchQuery }: Props) {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleEdit = (protocol: Protocol) => {
    setEditingProtocol(protocol)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    loadProtocols()
  }

  useEffect(() => {
    loadProtocols()
  }, [searchQuery, selectedType])

  const loadProtocols = async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedType !== 'all') params.append('type', selectedType)
      params.append('limit', '50')

      const response = await fetch(`/api/admin/medical-knowledge/protocols?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setProtocols(data.protocols || [])
        setTotal(data.total || 0)
        setTypes(data.types || [])
      }
    } catch (error) {
      console.error('Error loading protocols:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando protocolos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (protocols.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center">
              <p className="font-medium">Nenhum protocolo encontrado</p>
              <p className="text-sm mt-1">
                Protocolos são ações recomendadas baseadas em condições específicas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group by type
  const protocolsByType = protocols.reduce((acc, proto) => {
    const type = proto.type || 'Outros'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(proto)
    return acc
  }, {} as Record<string, Protocol[]>)

  return (
    <div className="space-y-4">
      {/* Header with filters and refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {total} protocolo{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
        </p>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button variant="outline" size="sm" onClick={loadProtocols}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Protocols List grouped by type */}
      {Object.entries(protocolsByType).map(([type, typeProtocols]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {type}
              </Badge>
              <span className="text-muted-foreground text-sm font-normal">
                ({typeProtocols.length} protocolo{typeProtocols.length !== 1 ? 's' : ''})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeProtocols.map((proto) => (
                <div key={proto.id} className="border rounded-lg p-4 space-y-3">
                  {/* Title */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-lg flex-1">{proto.title}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(proto)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Trigger Condition */}
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                    <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                      ⚡ Condição de Ativação:
                    </p>
                    <code className="text-sm font-mono text-yellow-900 dark:text-yellow-100">
                      {proto.triggerCondition}
                    </code>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">{proto.description}</p>

                  {/* Dosage */}
                  {proto.dosage && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                      <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-1">
                        💊 Dosagem:
                      </p>
                      <p className="text-sm text-green-900 dark:text-green-100">{proto.dosage}</p>
                    </div>
                  )}

                  {/* Source Reference */}
                  {proto.sourceRef && (
                    <p className="text-xs text-muted-foreground">
                      Fonte: {proto.sourceRef}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit Dialog */}
      <ProtocolEditDialog
        protocol={editingProtocol}
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
