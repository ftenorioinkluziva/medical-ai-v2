'use client'

/**
 * Recent Documents Widget - Minimal Health Design
 * Display last uploaded documents
 */

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, ArrowRight, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Document {
  id: string
  fileName: string
  documentType: string
  createdAt: string
  structuredData?: any
}

interface RecentDocumentsProps {
  documents: Document[]
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  if (documents.length === 0) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-teal-600" />
            Últimos Documentos
          </CardTitle>
          <CardDescription>Seus exames mais recentes</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="bg-muted rounded-lg p-4 mb-4 inline-block">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Você ainda não enviou nenhum documento
          </p>
          <Link href="/analyze">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              Enviar Primeiro Documento
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-teal-600" />
              Últimos Documentos
            </CardTitle>
            <CardDescription>Seus exames mais recentes</CardDescription>
          </div>
          <Link href="/documents">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Ver Todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => {
            const modulesCount = doc.structuredData?.modules?.length || 0

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-teal-200 hover:bg-teal-50/30 transition-all"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="bg-teal-50 p-2 rounded-lg shrink-0">
                    <FileText className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate text-foreground">{doc.fileName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      {modulesCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {modulesCount} módulo{modulesCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
