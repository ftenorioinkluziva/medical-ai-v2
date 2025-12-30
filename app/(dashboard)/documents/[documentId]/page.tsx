import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { documents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, User, Building2, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'
import { StructuredDataDisplay } from '@/components/documents/structured-data-display'

interface PageProps {
  params: Promise<{
    documentId: string
  }>
}

export default async function DocumentViewPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { documentId } = await params

  // Fetch document
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1)

  if (!document || document.userId !== session.user.id) {
    notFound()
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

  const modulesCount = document.structuredData?.modules?.length || 0

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/documents">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Documentos
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {document.fileName}
              </h1>
              <Badge variant="secondary" className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300">
                <FileText className="h-3 w-3 mr-1" />
                {getDocumentTypeLabel(document.documentType)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Patient and Lab Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Patient Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Informações do Paciente</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="text-sm font-medium text-foreground">{session.user.name}</p>
              </div>
              {/* Add more patient fields as needed */}
            </div>
          </Card>

          {/* Laboratory Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Informações do Documento</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Data de Upload</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(document.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={document.processingStatus === 'completed' ? 'default' : 'secondary'}>
                  {document.processingStatus === 'completed' ? 'Processado' : 'Processando'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Extracted Text Summary */}
        {document.extractedText && (
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Resumo Geral</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-6">
              {document.extractedText.substring(0, 500)}
              {document.extractedText.length > 500 && '...'}
            </p>
          </Card>
        )}

        {/* Exam Results */}
        {document.structuredData && modulesCount > 0 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Resultados dos Exames</h2>
            <StructuredDataDisplay modules={document.structuredData.modules} />
          </div>
        )}

        {/* Raw Text Fallback */}
        {(!document.structuredData || modulesCount === 0) && document.extractedText && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Texto Extraído</h2>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
              {document.extractedText}
            </pre>
          </Card>
        )}
      </div>
    </div>
  )
}
