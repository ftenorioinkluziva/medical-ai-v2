'use client'

/**
 * Complete Analysis View
 * Main component for multi-agent analysis workflow
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentSelector } from './document-selector'
import { AnalysisProgress } from './analysis-progress'
import { CompleteAnalysesList } from './complete-analyses-list'
import { toast } from 'sonner'
import { Loader2, Sparkles, FileText, History } from 'lucide-react'

interface CompleteAnalysisViewProps {
  userId: string
}

export function CompleteAnalysisView({ userId }: CompleteAnalysisViewProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleStartAnalysis = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('Selecione pelo menos um documento')
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/analyses/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds: selectedDocuments,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao iniciar análise')
      }

      setCurrentAnalysisId(data.completeAnalysis.id)

      toast.success('Análise completa iniciada!', {
        description: 'Aguarde enquanto processamos seus documentos',
      })

      // Refresh the list after completion
      setTimeout(() => {
        setRefreshKey(prev => prev + 1)
        setSelectedDocuments([])
        setCurrentAnalysisId(null)
      }, 60000) // Estimativa de 60s para completar
    } catch (error) {
      console.error('Error starting analysis:', error)
      toast.error('Erro ao iniciar análise', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Tabs defaultValue="new" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="new" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Nova Análise
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-2">
          <History className="h-4 w-4" />
          Histórico
        </TabsTrigger>
      </TabsList>

      {/* Nova Análise */}
      <TabsContent value="new" className="space-y-6 mt-6">
        {/* Informações sobre a análise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Análise Médica Completa
            </CardTitle>
            <CardDescription>
              Análise integrada por múltiplos especialistas: Medicina Integrativa, Nutrição e Fisiologia do Exercício
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border border-green-200 rounded-lg bg-green-50/50">
                <h3 className="font-semibold text-green-900 mb-2">1. Medicina Integrativa</h3>
                <p className="text-sm text-green-700">
                  Análise holística e fundacional de toda a saúde do paciente
                </p>
              </div>
              <div className="p-4 border border-orange-200 rounded-lg bg-orange-50/50">
                <h3 className="font-semibold text-orange-900 mb-2">2. Nutrição</h3>
                <p className="text-sm text-orange-700">
                  Insights complementares sobre metabolismo e nutrição
                </p>
              </div>
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50">
                <h3 className="font-semibold text-blue-900 mb-2">3. Fisiologia do Exercício</h3>
                <p className="text-sm text-blue-700">
                  Análise específica de performance e capacidade física
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 border border-purple-200 rounded-lg bg-purple-50/50">
              <h3 className="font-semibold text-purple-900 mb-2">✨ Resultados Integrados</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Síntese consolidada das 3 análises</li>
                <li>• Recomendações integradas sem repetição</li>
                <li>• Plano semanal consistente e acionável</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Selecione os Documentos
            </CardTitle>
            <CardDescription>
              Escolha um ou mais documentos médicos para análise completa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentSelector
              selectedDocuments={selectedDocuments}
              onSelectionChange={setSelectedDocuments}
              disabled={isAnalyzing}
            />

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedDocuments.length > 0
                  ? `${selectedDocuments.length} documento${selectedDocuments.length > 1 ? 's' : ''} selecionado${selectedDocuments.length > 1 ? 's' : ''}`
                  : 'Nenhum documento selecionado'}
              </p>
              <Button
                size="lg"
                onClick={handleStartAnalysis}
                disabled={selectedDocuments.length === 0 || isAnalyzing}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Iniciar Análise Completa
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progresso da Análise Atual */}
        {currentAnalysisId && (
          <AnalysisProgress analysisId={currentAnalysisId} />
        )}
      </TabsContent>

      {/* Histórico */}
      <TabsContent value="history" className="mt-6">
        <CompleteAnalysesList key={refreshKey} />
      </TabsContent>
    </Tabs>
  )
}
