'use client'

/**
 * Document List Component
 * Displays user's uploaded documents
 */

import { useState, useEffect } from 'react'
import { FileText, Image, Loader2, Calendar, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DocumentDetails } from './document-details'
import type { StructuredMedicalDocument } from '@/lib/documents/structuring'

interface Document {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  documentType: string
  processingStatus: string
  createdAt: string
  extractedText?: string
  structuredData?: StructuredMedicalDocument
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  lab_report: 'Exame Laboratorial',
  bioimpedance: 'Bioimpedância',
  medical_report: 'Relatório Médico',
  prescription: 'Receita',
  imaging: 'Exame de Imagem',
  other: 'Outro',
}

export function DocumentList({ onSelectDocument, refreshTrigger }: {
  onSelectDocument?: (doc: Document) => void
  refreshTrigger?: number
}) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [refreshTrigger])

  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/documents')
      const data = await response.json()

      if (data.success) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (doc: Document) => {
    setSelectedId(doc.id)
    onSelectDocument?.(doc)
  }

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="h-5 w-5" />
    }
    return <FileText className="h-5 w-5" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600 dark:bg-green-700">Processado</Badge>
      case 'processing':
        return <Badge variant="default" className="bg-yellow-600 dark:bg-yellow-700">Processando</Badge>
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Carregando documentos...</p>
        </div>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <FileText className="h-12 w-12" />
          <div className="text-center">
            <p className="text-sm font-medium">Nenhum documento encontrado</p>
            <p className="text-xs mt-1">Faça upload do seu primeiro documento</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
        </h3>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className={`
              p-4 transition-colors hover:bg-muted/50
              ${selectedId === doc.id ? 'ring-2 ring-primary' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="text-muted-foreground mt-0.5">
                {getFileIcon(doc.mimeType)}
              </div>

              <div className="flex-1 min-w-0 space-y-2 cursor-pointer" onClick={() => handleSelect(doc)}>
                <div>
                  <p className="text-sm font-medium truncate">{doc.fileName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                    </Badge>
                    {getStatusBadge(doc.processingStatus)}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(doc.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setViewingDocument(doc)
                }}
                className="shrink-0"
              >
                <Eye className="h-4 w-4 mr-1" />
                Detalhes
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Document Details Modal */}
      {viewingDocument && (
        <DocumentDetails
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  )
}
