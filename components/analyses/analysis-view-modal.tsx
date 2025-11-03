'use client'

/**
 * Analysis View Modal
 * Display full details of a saved analysis
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Brain, Calendar, Clock, FileText, Zap, Hash } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Analysis {
  id: string
  agentId: string
  agentName: string
  agentKey: string
  prompt: string
  analysis: string
  modelUsed: string
  tokensUsed: number | null
  processingTimeMs: number | null
  ragUsed: boolean
  documentIds: string[] | null
  createdAt: string
}

interface AnalysisViewModalProps {
  analysis: Analysis | null
  isOpen: boolean
  onClose: () => void
}

export function AnalysisViewModal({ analysis, isOpen, onClose }: AnalysisViewModalProps) {
  if (!analysis) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <DialogTitle className="text-2xl">{analysis.agentName}</DialogTitle>
              <DialogDescription className="mt-1">
                Análise realizada em {new Date(analysis.createdAt).toLocaleString('pt-BR')}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {analysis.ragUsed && (
                <Badge variant="secondary">RAG Ativo</Badge>
              )}
              <Badge variant="outline">{analysis.modelUsed}</Badge>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="h-[calc(90vh-180px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Prompt Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PERGUNTA
              </h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">{analysis.prompt}</p>
              </div>
            </div>

            <Separator />

            {/* Analysis Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                ANÁLISE
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
              </div>
            </div>

            <Separator />

            {/* Metadata Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                METADADOS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Date */}
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="text-sm font-medium">
                      {new Date(analysis.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Horário</p>
                    <p className="text-sm font-medium">
                      {new Date(analysis.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Processing Time */}
                {analysis.processingTimeMs && (
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Processamento</p>
                      <p className="text-sm font-medium">
                        {(analysis.processingTimeMs / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                )}

                {/* Tokens */}
                {analysis.tokensUsed && (
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tokens</p>
                      <p className="text-sm font-medium">
                        {analysis.tokensUsed.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Documents */}
                {analysis.documentIds && analysis.documentIds.length > 0 && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Documentos</p>
                      <p className="text-sm font-medium">
                        {analysis.documentIds.length}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
