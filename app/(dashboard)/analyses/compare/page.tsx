'use client'

/**
 * Analyses Comparison Page
 * Compare multiple analyses to track treatment progress
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import ReactMarkdown from 'react-markdown'
import {
  Loader2,
  ArrowLeft,
  TrendingUp,
  Calendar,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'

interface Analysis {
  id: string
  analysis: string
  createdAt: string
  agentName: string
  agentTitle: string
  agentColor: string
}

export default function CompareAnalysesPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isComparing, setIsComparing] = useState(false)
  const [comparison, setComparison] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/analyses')
      if (!response.ok) {
        throw new Error('Erro ao carregar análises')
      }

      const data = await response.json()
      setAnalyses(data.analyses || [])
    } catch (err) {
      console.error('Error loading analyses:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAnalysis = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      setError('Selecione pelo menos 2 análises para comparar')
      return
    }

    try {
      setIsComparing(true)
      setError(null)
      setComparison(null)

      const response = await fetch('/api/analyses/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisIds: selectedIds,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao comparar análises')
      }

      const data = await response.json()
      setComparison(data.comparison)
    } catch (err) {
      console.error('Error comparing analyses:', err)
      setError(err instanceof Error ? err.message : 'Erro ao comparar análises')
    } finally {
      setIsComparing(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando análises...</p>
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
            <Link href="/analyses">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Comparar Análises</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Monitore seu progresso comparando análises ao longo do tempo
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {analyses.length < 2 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Análises insuficientes</h3>
            <p className="text-muted-foreground mb-6">
              Você precisa ter pelo menos 2 análises para poder compará-las
            </p>
            <Link href="/analyze">
              <Button>Criar Nova Análise</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Select analyses */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selecionar Análises</CardTitle>
                <CardDescription>
                  Escolha 2 ou mais análises para comparar
                  <span className="block mt-1 text-xs">
                    {selectedIds.length} selecionada(s)
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-h-[500px] overflow-y-auto space-y-2">
                  {analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedIds.includes(analysis.id) ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => toggleAnalysis(analysis.id)}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id={`analysis-${analysis.id}`}
                          checked={selectedIds.includes(analysis.id)}
                          onCheckedChange={() => toggleAnalysis(analysis.id)}
                        />
                        <Label
                          htmlFor={`analysis-${analysis.id}`}
                          className="flex-1 cursor-pointer space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <Stethoscope
                              className="h-4 w-4 flex-shrink-0"
                              style={{ color: analysis.agentColor }}
                            />
                            <p className="text-sm font-medium truncate">{analysis.agentName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(analysis.createdAt)}
                          </p>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <Button
                  className="w-full"
                  onClick={handleCompare}
                  disabled={selectedIds.length < 2 || isComparing}
                  size="lg"
                >
                  {isComparing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Comparando...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Comparar Análises
                    </>
                  )}
                </Button>

                {selectedIds.length < 2 && (
                  <p className="text-xs text-center text-muted-foreground">
                    Selecione pelo menos 2 análises
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right content - Comparison result */}
          <div className="lg:col-span-2">
            {comparison ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Análise Comparativa de Progresso
                  </CardTitle>
                  <CardDescription>
                    Comparação de {selectedIds.length} análises ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-5 mb-3" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-medium mt-4 mb-2" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                      }}
                    >
                      {comparison}
                    </ReactMarkdown>
                  </div>

                  <Separator />

                  {/* Disclaimer */}
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-yellow-900">
                        <strong>⚠️ Aviso Importante:</strong> Esta análise comparativa é educacional
                        e <strong>NÃO substitui consulta médica profissional</strong>. Sempre consulte
                        seu médico para interpretação definitiva e decisões sobre tratamento.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setComparison(null)
                        setSelectedIds([])
                      }}
                      className="flex-1"
                    >
                      Nova Comparação
                    </Button>
                    <Button
                      onClick={() => window.print()}
                      variant="outline"
                      className="flex-1"
                    >
                      Imprimir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex items-center justify-center min-h-[500px]">
                  <div className="text-center space-y-3 max-w-md">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Compare suas análises</h3>
                    <p className="text-muted-foreground text-sm">
                      Selecione 2 ou mais análises à esquerda e clique em "Comparar Análises" para
                      ver uma análise detalhada do seu progresso ao longo do tempo.
                    </p>
                    <div className="pt-4 space-y-2 text-left">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Identifica melhorias e progressos</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Destaca áreas que precisam atenção</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Fornece recomendações personalizadas</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
