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
        return <Clock className="h-4 w-4 text-gray-600" />
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

  const filteredDocuments = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8" />
              Meus Documentos
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Gerencie todos os seus documentos médicos enviados
          </p>
        </div>
        <Link href="/analyze">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Enviar Novo
          </Button>
        </Link>
      </div>

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
        <div className="grid gap-4">
          {filteredDocuments.map((doc) => {
            const modulesCount = doc.structuredData?.modules?.length || 0

            return (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <File className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{doc.fileName}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              {getStatusIcon(doc.processingStatus)}
                              {getStatusBadge(doc.processingStatus)}
                              <Badge variant="outline">{doc.documentType || 'Documento'}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Tamanho</p>
                            <p className="font-medium">{formatFileSize(doc.fileSize)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Tipo</p>
                            <p className="font-medium truncate">{doc.mimeType}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Módulos</p>
                            <p className="font-medium">
                              {modulesCount > 0 ? `${modulesCount} módulo${modulesCount !== 1 ? 's' : ''}` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Data
                            </p>
                            <p className="font-medium">
                              {format(new Date(doc.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
