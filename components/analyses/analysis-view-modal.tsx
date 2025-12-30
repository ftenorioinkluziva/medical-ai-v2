'use client'

/**
 * Analysis View Modal
 * Display full details of a saved analysis
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Brain, Calendar, Clock, FileText, Zap, Hash, Lightbulb, CalendarDays, Loader2, AlertTriangle, TrendingUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'

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
  const [isGeneratingRec, setIsGeneratingRec] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)

  if (!analysis) return null

  const handleGenerateRecommendations = async () => {
    try {
      setIsGeneratingRec(true)
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: analysis.id }),
      })

      if (!response.ok) {
        const data = await response.json()

        // Handle insufficient credits (402)
        if (response.status === 402) {
          const shortfall = data.details?.shortfall || 0
          toast.error(
            `${data.error}\n\nClique aqui para comprar créditos`,
            {
              duration: 8000,
              action: {
                label: 'Comprar',
                onClick: () => window.location.href = '/dashboard/credits'
              }
            }
          )
          return
        }

        throw new Error(data.error || 'Erro ao gerar recomendações')
      }

      toast.success('Recomendações geradas com sucesso!')
    } catch (error) {
      console.error('Error generating recommendations:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar recomendações')
    } finally {
      setIsGeneratingRec(false)
    }
  }

  const handleGenerateWeeklyPlan = async () => {
    try {
      setIsGeneratingPlan(true)
      const response = await fetch('/api/weekly-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: analysis.id }),
      })

      if (!response.ok) {
        const data = await response.json()

        // Handle insufficient credits (402)
        if (response.status === 402) {
          const shortfall = data.details?.shortfall || 0
          toast.error(
            `${data.error}\n\nClique aqui para comprar créditos`,
            {
              duration: 8000,
              action: {
                label: 'Comprar',
                onClick: () => window.location.href = '/dashboard/credits'
              }
            }
          )
          return
        }

        throw new Error(data.error || 'Erro ao gerar plano semanal')
      }

      toast.success('Plano semanal gerado com sucesso!')
    } catch (error) {
      console.error('Error generating weekly plan:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar plano semanal')
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg sm:text-xl lg:text-2xl truncate">{analysis.agentName}</DialogTitle>
                <DialogDescription className="mt-1 text-xs sm:text-sm">
                  {new Date(analysis.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {analysis.ragUsed && (
                <Badge variant="secondary" className="text-xs">RAG</Badge>
              )}
              <Badge variant="outline" className="text-xs">{analysis.modelUsed}</Badge>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="h-[calc(90vh-180px)]">
          <div className="px-4 py-3 sm:px-6 sm:py-4 space-y-4 sm:space-y-6">
            {/* Alert Card - Show if analysis contains critical information */}
            {(analysis.analysis.includes('ALTO RISCO') ||
              analysis.analysis.includes('⚠️') ||
              analysis.analysis.includes('ALERTA') ||
              analysis.analysis.includes('preocupante')) && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-3 sm:p-4 rounded-r-lg">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Atenção: Pontos Importantes
                    </h4>
                    <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                      Esta análise contém informações que requerem atenção especial.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Summary Card */}
            {analysis.documentIds && analysis.documentIds.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start gap-2 sm:gap-3">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-primary mb-1">
                      Análise Baseada em Dados
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Esta análise considerou{' '}
                      <strong className="text-primary">{analysis.documentIds.length}</strong>{' '}
                      documento(s){analysis.ragUsed && ' e referências médicas'}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                ANÁLISE COMPLETA
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none
                [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:text-foreground [&>h1]:border-b [&>h1]:pb-2
                [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:text-foreground
                [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mt-4 [&>h3]:mb-2 [&>h3]:text-foreground
                [&>p]:leading-7 [&>p]:mb-4 [&>p]:text-foreground
                [&>ul]:my-4 [&>ul]:ml-6 [&>ul]:list-disc [&>ul>li]:mb-2
                [&>ol]:my-4 [&>ol]:ml-6 [&>ol]:list-decimal [&>ol>li]:mb-2
                [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4
                [&>strong]:font-semibold [&>strong]:text-primary
                [&>em]:italic [&>em]:text-muted-foreground
                [&>code]:bg-muted [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono
                [&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-4
                [&>table]:w-full [&>table]:my-4 [&>table]:border-collapse
                [&>table>thead>tr]:border-b [&>table>thead>tr>th]:px-4 [&>table>thead>tr>th]:py-2 [&>table>thead>tr>th]:text-left [&>table>thead>tr>th]:font-semibold
                [&>table>tbody>tr]:border-b [&>table>tbody>tr:last-child]:border-0
                [&>table>tbody>tr>td]:px-4 [&>table>tbody>tr>td]:py-2
                [&>hr]:my-6 [&>hr]:border-muted
              ">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-transparent px-3 py-2 rounded">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="flex items-center gap-2 border-l-4 border-primary pl-3">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="flex items-center gap-2 text-primary">
                        {children}
                      </h3>
                    ),
                    strong: ({ children }) => {
                      const text = String(children)
                      // Destacar valores de testes funcionais
                      if (text.includes('kg') || text.includes('segundos') || text.includes('bpm')) {
                        return (
                          <strong className="inline-flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded font-semibold text-primary">
                            {children}
                          </strong>
                        )
                      }
                      // Destacar alertas
                      if (text.includes('ALTO RISCO') || text.includes('ALERTA') || text.includes('⚠️')) {
                        return (
                          <strong className="inline-flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded font-semibold text-red-700 border border-red-200">
                            {children}
                          </strong>
                        )
                      }
                      return <strong className="font-semibold text-primary">{children}</strong>
                    },
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="min-w-full divide-y divide-border border border-border rounded-lg overflow-hidden">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-muted">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-3 text-sm">
                        {children}
                      </td>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-muted/50 transition-colors">
                        {children}
                      </tr>
                    ),
                  }}
                >
                  {analysis.analysis}
                </ReactMarkdown>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3">
                AÇÕES
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleGenerateRecommendations}
                  disabled={isGeneratingRec}
                  className="flex-1"
                  variant="outline"
                  size="sm"
                >
                  {isGeneratingRec ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Gerando...</span>
                      <span className="sm:hidden">Gerando</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Gerar Recomendações</span>
                      <span className="sm:hidden">Recomendações</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGenerateWeeklyPlan}
                  disabled={isGeneratingPlan}
                  className="flex-1"
                  variant="outline"
                  size="sm"
                >
                  {isGeneratingPlan ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Gerando...</span>
                      <span className="sm:hidden">Gerando</span>
                    </>
                  ) : (
                    <>
                      <CalendarDays className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Gerar Plano Semanal</span>
                      <span className="sm:hidden">Plano Semanal</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Metadata Section */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3">
                METADADOS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
