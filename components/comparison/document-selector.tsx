'use client'

/**
 * Document Selector Component
 * Select multiple documents for comparison
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, FileText, Calendar, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Document {
  id: string
  fileName: string
  fileType: string
  documentType: string
  createdAt: string
  structuredData: any
}

interface DocumentSelectorProps {
  selectedDocuments: string[]
  onSelectionChange: (documentIds: string[]) => void
}

export function DocumentSelector({ selectedDocuments, onSelectionChange }: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/documents')
      if (!response.ok) {
        throw new Error('Erro ao carregar documentos')
      }

      const data = await response.json()

      // Filter only documents with structured data
      const structuredDocs = (data.documents || []).filter(
        (doc: Document) => doc.structuredData && doc.structuredData.modules
      )

      setDocuments(structuredDocs)
    } catch (err) {
      console.error('Error loading documents:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDocument = (documentId: string) => {
    if (selectedDocuments.includes(documentId)) {
      onSelectionChange(selectedDocuments.filter((id) => id !== documentId))
    } else {
      onSelectionChange([...selectedDocuments, documentId])
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando documentos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
        <CardContent className="p-6">
          <p className="text-red-600 dark:text-red-400">Erro: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Nenhum documento encontrado</p>
          <p className="text-sm text-muted-foreground">
            Faça upload de exames médicos para começar a comparar
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Selecione os Documentos</span>
          {selectedDocuments.length > 0 && (
            <Badge variant="secondary">
              {selectedDocuments.length} selecionado{selectedDocuments.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Escolha pelo menos 2 documentos para comparar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {documents.map((doc) => {
              const isSelected = selectedDocuments.includes(doc.id)
              const modulesCount = doc.structuredData?.modules?.length || 0

              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDocument(doc.id)}
                  className={`
                    flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/80 hover:bg-muted'
                    }
                  `}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleDocument(doc.id)}
                    className="mt-1"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <h4 className="font-medium truncate">{doc.fileName}</h4>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(doc.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {modulesCount} módulo{modulesCount !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {doc.documentType.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
