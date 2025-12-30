'use client'

/**
 * Documents Page
 * View and manage all uploaded documents
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DocumentUpload } from '@/components/documents/document-upload'
import {
  Loader2,
  FileText,
  Calendar,
  Upload,
  Search,
  ArrowLeft,
  File,
  CheckCircle2,
  XCircle,
  Clock,
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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    loadDocuments()
  }, [refreshTrigger])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/documents')
      if (!response.ok) {
        throw new Error('Erro ao carregar documentos')
      }

      const data = await response.json()
      setDocuments(data.documents || [])
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
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Processado</Badge>
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>
      case 'processing':
        return <Badge variant="secondary">Processando</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando documentos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
            Meus Documentos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Gerencie e envie seus documentos médicos
          </p>
        </div>
      </div>

      {/* Upload Section */}

      <DocumentUpload onUploadComplete={handleUploadComplete} />


      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Documentos</CardDescription>
            <CardTitle className="text-3xl">{documents.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Processados</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {documents.filter((d) => d.processingStatus === 'completed').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Em Processamento</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {documents.filter((d) => d.processingStatus === 'processing').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Documentos</CardTitle>
          <CardDescription>Encontre documentos pelo nome do arquivo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do arquivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <p className="text-red-600 font-medium">{error}</p>
            <Button onClick={loadDocuments} variant="outline" className="mt-4">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'Nenhum documento encontrado' : 'Nenhum documento enviado'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Tente ajustar sua busca'
                : 'Envie seu primeiro documento médico para começar'}
            </p>
            {!searchQuery && (
              <Link href="/analyze">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar Primeiro Documento
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 items-start">
          {filteredDocuments.map((doc) => {
            const modulesCount = doc.structuredData?.modules?.length || 0

            return (
              <Link key={doc.id} href={`/documents/${doc.id}`} className="block">
                <Card className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer">
                  <CardContent className="p-3 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                      {/* Icon - Hidden on mobile to save space */}
                      <div className="hidden sm:block p-3 rounded-lg bg-primary/10 shrink-0">
                        <File className="h-6 w-6 text-primary" />
                      </div>

                      <div className="sm:flex-1 min-w-0 space-y-2">

                        {/* Title and Status */}
                        <div>
                          <div className="flex items-start gap-2 mb-1.5">
                            <div className="sm:hidden p-1.5 rounded bg-primary/10 shrink-0">
                              <File className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="font-semibold text-base sm:text-lg flex-1 leading-tight break-words">{doc.fileName}</div>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {getStatusIcon(doc.processingStatus)}
                            {getStatusBadge(doc.processingStatus)}
                            <Badge variant="outline" className="text-xs py-0">{doc.documentType || 'Documento'}</Badge>
                          </div>
                        </div>

                        {/* Metadata Grid - Responsive */}
                        <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground sm:text-xs sm:gap-3">
                          <div>
                            <p className="text-muted-foreground text-xs leading-tight">Tamanho</p>
                            <p className="font-medium text-xs sm:text-sm">{formatFileSize(doc.fileSize)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs leading-tight">Tipo</p>
                            <p className="font-medium text-xs sm:text-sm truncate">{doc.mimeType.split('/')[1]?.toUpperCase() || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs leading-tight">Módulos</p>
                            <p className="font-medium text-xs sm:text-sm">
                              {modulesCount > 0 ? modulesCount : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs flex items-center gap-1 leading-tight">
                              <Calendar className="h-3 w-3" />
                              Data
                            </p>
                            <p className="font-medium text-xs sm:text-sm">
                              {format(new Date(doc.createdAt), 'dd/MM/yy', { locale: ptBR })}
                            </p>
                          </div>
                        </div>

                        {/* View Button - Mobile */}
                        <div className="sm:hidden pt-1 flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-8"
                            asChild
                          >
                            <span>
                              <Eye className="h-3.5 w-3.5" />
                              Visualizar
                            </span>
                          </Button>
                        </div>
                      </div>

                      {/* View Button - Desktop */}
                      <div className="hidden sm:flex items-start shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          asChild
                        >
                          <span>
                            <Eye className="h-4 w-4" />
                            Visualizar
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Summary Footer */}
      {filteredDocuments.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-center text-muted-foreground">
              Mostrando {filteredDocuments.length} de {documents.length} documento
              {documents.length !== 1 ? 's' : ''}
              {searchQuery && ' (filtrado)'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
