'use client'

/**
 * Analysis Interface Component
 * Main interface for medical analysis
 */

import { useState, useEffect } from 'react'
import { Loader2, Send, FileText, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AnalysisChat } from './analysis-chat'
import { AnalysisSelector } from './analysis-selector'

interface AnalysisRequest {
  agentId: string
  documentIds?: string[]
  includeProfile?: boolean
  previousAnalysisIds?: string[]
}

interface Document {
  id: string
  fileName: string
  documentType: string
  createdAt: string
}

interface PreviousAnalysis {
  id: string
  agentId: string
  agentName: string
  agentColor: string
  createdAt: string
  documentIds: string[] | null
}

interface AnalysisResult {
  success: boolean
  analysis?: string
  analysisId?: string
  agent?: {
    id: string
    name: string
    title: string
    agentKey?: string
  }
  metadata?: any
  usage?: any
  error?: string
}

interface SelectedAnalysis {
  id: string
  agentId: string
  agentName: string
  agentTitle: string
  agentColor: string
  agentKey: string
  analysis: string
  createdAt: string
  documentIds: string[] | null
}

export function AnalysisInterface({
  selectedAgentId,
  selectedAgentName,
  selectedAgentColor,
  selectedAgentKey,
  onAnalysisComplete,
}: {
  selectedAgentId: string | null
  selectedAgentName?: string
  selectedAgentColor?: string
  selectedAgentKey?: string
  onAnalysisComplete?: (result: AnalysisResult) => void
}) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])
  const [includeProfile, setIncludeProfile] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const [selectedAnalysisForChat, setSelectedAnalysisForChat] = useState<SelectedAnalysis | null>(null)
  const [previousAnalyses, setPreviousAnalyses] = useState<PreviousAnalysis[]>([])
  const [selectedPreviousAnalysisIds, setSelectedPreviousAnalysisIds] = useState<string[]>([])
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true)

  // Load user documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch('/api/documents')
        if (response.ok) {
          const data = await response.json()
          setDocuments(data.documents || [])
        }
      } catch (error) {
        console.error('Error loading documents:', error)
      } finally {
        setIsLoadingDocuments(false)
      }
    }

    loadDocuments()
  }, [])

  // Load previous analyses (from other agents)
  useEffect(() => {
    const loadPreviousAnalyses = async () => {
      if (!selectedAgentId) {
        setIsLoadingAnalyses(false)
        return
      }

      try {
        const response = await fetch('/api/analyses/history')
        if (response.ok) {
          const data = await response.json()
          // Filter out analyses from the current agent
          const otherAgentAnalyses = (data.analyses || [])
            .filter((a: any) => a.agentId !== selectedAgentId)
            .map((a: any) => ({
              id: a.id,
              agentId: a.agentId,
              agentName: a.agentName,
              agentColor: a.agentColor || '#666',
              createdAt: a.createdAt,
              documentIds: a.documentIds,
            }))
          setPreviousAnalyses(otherAgentAnalyses)
        }
      } catch (error) {
        console.error('Error loading previous analyses:', error)
      } finally {
        setIsLoadingAnalyses(false)
      }
    }

    loadPreviousAnalyses()
  }, [selectedAgentId])

  const handleAnalyze = async () => {
    if (!selectedAgentId) return

    setIsAnalyzing(true)
    setResult(null)

    try {
      const response = await fetch(`/api/agents/${selectedAgentId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds: selectedDocumentIds,
          includeProfile,
          previousAnalysisIds: selectedPreviousAnalysisIds,
        } as AnalysisRequest),
      })

      const data = await response.json()

      // Handle insufficient credits (402) with helpful message
      if (response.status === 402 && data.details?.shortfall) {
        setResult({
          success: false,
          error: `${data.error}\n\n💡 Você pode comprar mais créditos em: /dashboard/credits`,
          insufficientCredits: true,
          details: data.details
        })
        return
      }

      setResult(data)

      if (data.success) {
        onAnalysisComplete?.(data)
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer análise',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleDocument = (docId: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    )
  }

  const togglePreviousAnalysis = (analysisId: string) => {
    setSelectedPreviousAnalysisIds((prev) =>
      prev.includes(analysisId) ? prev.filter((id) => id !== analysisId) : [...prev, analysisId]
    )
  }

  const canAnalyze = selectedAgentId && (selectedDocumentIds.length > 0 || includeProfile) && !isAnalyzing

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Solicitar Análise</h3>
            {selectedAgentName && (
              <p className="text-sm text-muted-foreground mt-1">
                Consultando: <span className="font-medium">{selectedAgentName}</span>
              </p>
            )}
          </div>

          {/* Document Selector */}
          <div className="space-y-2">
            <Label>Selecione os documentos para análise</Label>
            {isLoadingDocuments ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Carregando documentos...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum documento disponível</p>
                <p className="text-xs mt-1">Faça upload de documentos primeiro</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                    onClick={() => toggleDocument(doc.id)}
                  >
                    <Checkbox
                      id={`doc-${doc.id}`}
                      checked={selectedDocumentIds.includes(doc.id)}
                      onCheckedChange={() => toggleDocument(doc.id)}
                    />
                    <Label
                      htmlFor={`doc-${doc.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedDocumentIds.length} documento(s) selecionado(s)
            </p>
          </div>

          {/* Previous Analyses Selector (Optional) */}
          {previousAnalyses.length > 0 && (
            <div className="space-y-2">
              <Label>Incluir análises anteriores (opcional)</Label>
              <p className="text-xs text-muted-foreground">
                Selecione análises de outros agentes para enriquecer o contexto
              </p>
              {isLoadingAnalyses ? (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm">Carregando análises...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {previousAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                      onClick={() => togglePreviousAnalysis(analysis.id)}
                    >
                      <Checkbox
                        id={`analysis-${analysis.id}`}
                        checked={selectedPreviousAnalysisIds.includes(analysis.id)}
                        onCheckedChange={() => togglePreviousAnalysis(analysis.id)}
                      />
                      <Label
                        htmlFor={`analysis-${analysis.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: analysis.agentColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{analysis.agentName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(analysis.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {selectedPreviousAnalysisIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedPreviousAnalysisIds.length} análise(s) selecionada(s)
                </p>
              )}
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-profile"
                checked={includeProfile}
                onCheckedChange={(checked) => setIncludeProfile(checked as boolean)}
              />
              <Label
                htmlFor="include-profile"
                className="text-sm font-normal cursor-pointer"
              >
                Incluir meu perfil médico
              </Label>
            </div>
          </div>

          {/* Analyze Button */}
          <Button
            className="w-full"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Solicitar Análise
              </>
            )}
          </Button>

          {!selectedAgentId && (
            <p className="text-sm text-center text-muted-foreground">
              Selecione um especialista para continuar
            </p>
          )}
        </div>
      </Card>

      {/* Analysis Result */}
      {result && (
        <Card className={`p-6 ${result.success ? 'bg-muted/50' : 'bg-red-50 border-red-200'}`}>
          {result.success && result.analysis ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-3">Análise Completa</h4>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {result.analysis}
                    </div>
                  </div>
                </div>
              </div>

              {result.metadata && (
                <div className="border-t pt-4 text-xs text-muted-foreground">
                  <p>Tempo de processamento: {result.metadata.processingTimeMs}ms</p>
                  {result.usage && (
                    <p>Tokens utilizados: {result.usage.totalTokens}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-900">
              <p className="font-medium">Erro na análise</p>
              <p className="text-xs mt-1">{result.error}</p>
            </div>
          )}
        </Card>
      )}

      {/* Chat with Agent (only show after successful analysis) */}
      {result?.success && result?.analysisId && selectedAgentName && (
        <AnalysisChat
          analysisId={result.analysisId}
          agentName={selectedAgentName}
          agentColor={selectedAgentColor || 'teal'}
          agentInitial={selectedAgentKey?.substring(0, 2).toUpperCase() || 'AI'}
          className="mt-6"
        />
      )}

      {/* Or select an existing analysis to chat with */}
      {!result?.analysisId && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Ou escolha uma análise anterior para conversar com o especialista
            </p>
          </div>
          <AnalysisSelector
            onSelectAnalysis={(analysis) => setSelectedAnalysisForChat(analysis)}
          />
          {selectedAnalysisForChat && (
            <AnalysisChat
              analysisId={selectedAnalysisForChat.id}
              agentName={selectedAnalysisForChat.agentName}
              agentColor={selectedAnalysisForChat.agentColor}
              agentInitial={selectedAnalysisForChat.agentKey.substring(0, 2).toUpperCase()}
            />
          )}
        </div>
      )}

      {/* Disclaimer */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-xs text-yellow-900">
          <strong>⚠️ Aviso Importante:</strong> Esta análise é gerada por IA para fins educacionais
          e <strong>NÃO substitui consulta médica profissional</strong>. Sempre consulte um profissional
          de saúde qualificado para interpretação médica definitiva.
        </p>
      </Card>
    </div>
  )
}
