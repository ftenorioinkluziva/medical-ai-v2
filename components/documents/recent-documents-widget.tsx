'use client'

/**
 * Recent Documents Widget
 * Displays a compact list of recently uploaded documents
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DocumentViewModal } from './document-view-modal'
import {
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
  Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Document {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  documentType: string
  processingStatus: string
  extractedText: string | null
  structuredData: any
  createdAt: string
}

interface RecentDocumentsWidgetProps {
  limit?: number
  onDocumentsLoad?: (count: number) => void
  patientId?: string
  userName?: string
}

export function RecentDocumentsWidget({ limit = 5, onDocumentsLoad, patientId, userName }: RecentDocumentsWidgetProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [patientId])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const endpoint = patientId
        ? `/api/documents?patientId=${patientId}&limit=${limit}`
        : `/api/documents?limit=${limit}`

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Erro ao carregar documentos')
      }

      const data = await response.json()
      const recentDocs = (data.documents || []).slice(0, limit)
      setDocuments(recentDocs)
      onDocumentsLoad?.(data.documents?.length || 0)
    } catch (err) {
      console.error('Error loading documents:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
      case 'failed':
        return <XCircle className="h-3.5 w-3.5 text-red-600" />
      case 'processing':
        return <Clock className="h-3.5 w-3.5 text-yellow-600" />
      default:
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600 text-xs">Pronto</Badge>
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Erro</Badge>
      case 'processing':
        return <Badge variant="secondary" className="text-xs">Processando</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      lab_report: 'Exame Lab.',
      bioimpedance: 'Bioimpedância',
      medical_report: 'Relatório',
      prescription: 'Receita',
      imaging: 'Imagem',
      other: 'Outro',
    }
    return types[type] || type
  }

  const getDocumentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      lab_report: '🧪',
      bioimpedance: '⚡',
      medical_report: '📋',
      prescription: '💊',
      imaging: '🔬',
      other: '📄',
    }
    return icons[type] || '📄'
  }

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      lab_report: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      bioimpedance: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      medical_report: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      prescription: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      imaging: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
      other: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
    }
    return colors[type] || colors.other
  }

  const getParametersCount = (doc: Document) => {
    if (!doc.structuredData?.modules) return 0
    let count = 0
    doc.structuredData.modules.forEach((module: any) => {
      count += module.parameters?.length || 0
    })
    return count
  }

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedDocument(null), 300)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i]
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-teal-600" />
          Documentos Recentes
        </CardTitle>
        <CardDescription>
          Seus últimos documentos enviados
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-teal-600" />
              <p className="text-sm text-muted-foreground">Carregando documentos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircle className="h-8 w-8 mx-auto mb-3 text-red-500" />
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <Button onClick={loadDocuments} variant="outline" size="sm">
              Tentar Novamente
            </Button>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-muted-foreground mb-1 font-medium">
              Nenhum documento enviado ainda
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Envie seu primeiro documento usando o widget ao lado
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[320px] overflow-y-auto overflow-x-hidden">
            {documents.map((doc) => {
              const paramsCount = getParametersCount(doc)
              return (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border border-border hover:border-sky-300 hover:bg-sky-50/50 transition-all dark:hover:bg-sky-900/20 cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon with type color */}
                    <div className={`p-2 rounded-lg shrink-0 text-xl ${getDocumentTypeColor(doc.documentType)}`}>
                      {getDocumentTypeIcon(doc.documentType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Title with status */}
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-sm font-semibold text-foreground truncate flex-1 leading-tight group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors"
                          onClick={() => handleViewDocument(doc)}
                        >
                          {doc.fileName}
                        </p>
                        {getStatusIcon(doc.processingStatus)}
                      </div>

                      {/* Parameters info */}
                      {paramsCount > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="font-medium">{paramsCount} parâmetros extraídos</span>
                        </div>
                      )}

                      {/* Metadata row */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {getDocumentTypeLabel(doc.documentType)}
                        </Badge>
                        <span>•</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span className="truncate">
                          {format(new Date(doc.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      </div>

                      {/* Action button */}
                      <div className="pt-1">
                        <Link href={`/analyze?documentId=${doc.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1.5 text-sky-600 hover:text-sky-700 hover:bg-sky-100 dark:hover:bg-sky-900/30"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="h-3 w-3" />
                            Analisar
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* View All Link */}
            <div className="pt-2">
              <Link href="/documents">
                <Button
                  variant="outline"
                  className="w-full justify-between group"
                  size="sm"
                >
                  Ver Todos os Documentos
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

      {/* Document View Modal */}
      <DocumentViewModal
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userName={userName}
      />
    </>
  )
}
