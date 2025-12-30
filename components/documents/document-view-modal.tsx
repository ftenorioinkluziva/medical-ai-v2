'use client'

/**
 * Document View Modal
 * Display full document details and extracted text
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { StructuredDataDisplay } from './structured-data-display'
import {
  FileText,
  Calendar,
  Database,
  FileType,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Hash,
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

interface DocumentViewModalProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentViewModal({ document, isOpen, onClose }: DocumentViewModalProps) {
  if (!document) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600 dark:bg-green-700">Processado</Badge>
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>
      case 'processing':
        return <Badge variant="secondary">Processando</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      lab_report: 'Exame Laboratorial',
      bioimpedance: 'Bioimpedância',
      medical_report: 'Relatório Médico',
      prescription: 'Receita',
      imaging: 'Exame de Imagem',
      other: 'Outro',
    }
    return types[type] || type
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const modulesCount = document.structuredData?.modules?.length || 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] p-0">
        {/* Compact Header */}
        <DialogHeader className="px-4 pt-4 pb-3 sm:px-6 border-b">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base sm:text-lg truncate">{document.fileName}</DialogTitle>
                <DialogDescription className="text-xs flex items-center gap-2 mt-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(document.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  <span>•</span>
                  {getDocumentTypeLabel(document.documentType)}
                </DialogDescription>
              </div>
            </div>
            {getStatusBadge(document.processingStatus)}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="p-4 sm:p-6">
            {/* Structured Data - Main Content */}
            {document.structuredData && modulesCount > 0 ? (
              <StructuredDataDisplay modules={document.structuredData.modules} />
            ) : (
              /* No Structured Data - Show Message */
              <div className="text-center py-12">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Sem Dados Estruturados</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Este documento não possui dados estruturados (parâmetros de exames).
                  {document.processingStatus === 'completed' && (
                    <span className="block mt-2">
                      O documento foi processado, mas não foram identificados parâmetros estruturáveis.
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-4 py-3 sm:px-6 flex justify-end">
          <Button variant="outline" onClick={onClose} size="sm">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
