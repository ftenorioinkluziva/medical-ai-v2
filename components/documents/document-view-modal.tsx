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
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Processado</Badge>
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
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-teal-600" />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl truncate">{document.fileName}</DialogTitle>
              <DialogDescription className="mt-1">
                Enviado em {format(new Date(document.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(document.processingStatus)}
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="h-[calc(90vh-180px)]">
          <div className="px-6 py-4 space-y-6 max-w-full">
            {/* Metadata Section */}
            <div className="max-w-full">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                INFORMAÇÕES DO DOCUMENTO
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Status */}
                <div className="flex items-start gap-2">
                  {getStatusIcon(document.processingStatus)}
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-medium">
                      {document.processingStatus === 'completed' ? 'Processado' :
                       document.processingStatus === 'failed' ? 'Falhou' : 'Processando'}
                    </p>
                  </div>
                </div>

                {/* Type */}
                <div className="flex items-start gap-2">
                  <FileType className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Tipo</p>
                    <p className="text-sm font-medium">
                      {getDocumentTypeLabel(document.documentType)}
                    </p>
                  </div>
                </div>

                {/* Size */}
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Tamanho</p>
                    <p className="text-sm font-medium">
                      {formatFileSize(document.fileSize)}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Data de Upload</p>
                    <p className="text-sm font-medium">
                      {format(new Date(document.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* MIME Type */}
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Formato</p>
                    <p className="text-sm font-medium truncate">
                      {document.mimeType}
                    </p>
                  </div>
                </div>

                {/* Modules */}
                {modulesCount > 0 && (
                  <div className="flex items-start gap-2">
                    <Database className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Módulos Estruturados</p>
                      <p className="text-sm font-medium">
                        {modulesCount} módulo{modulesCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Structured Data Section */}
            {document.structuredData && modulesCount > 0 && (
              <>
                <Separator />
                <div className="max-w-full">
                  <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    DADOS ESTRUTURADOS
                  </h3>
                  <StructuredDataDisplay modules={document.structuredData.modules} />
                </div>
              </>
            )}

          </div>
        </ScrollArea>

        <Separator />

        {/* Footer Actions */}
        <div className="px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
