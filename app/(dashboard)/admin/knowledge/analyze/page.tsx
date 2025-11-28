'use client'

/**
 * Knowledge Base Analysis Page
 * Analyzes chunks distribution and helps optimize maxChunks configuration
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Loader2,
  ArrowLeft,
  Database,
  FileText,
  BarChart3,
  TrendingUp,
  Info,
  Check,
  AlertCircle,
  Save,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface KnowledgeStats {
  totalArticles: number
  totalChunks: number
  avgChunksPerArticle: number
  minChunksPerArticle: number
  maxChunksPerArticle: number
}

interface ArticleDistribution {
  title: string
  chunk_count: number
  avg_chunk_length: number
}

interface Recommendations {
  conservative: number
  balanced: number
  comprehensive: number
  current: number
  estimatedArticlesWithCurrent: number
}

interface AnalysisData {
  stats: KnowledgeStats
  distribution: ArticleDistribution[]
  recommendations: Recommendations
}

export default function KnowledgeAnalyzePage() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [simulatedChunks, setSimulatedChunks] = useState(20)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadAnalysis()
  }, [])

  const loadAnalysis = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/knowledge/analyze')
      if (!response.ok) {
        throw new Error('Erro ao carregar análise')
      }

      const result = await response.json()
      setData(result)
      setSimulatedChunks(result.recommendations.current)
    } catch (err) {
      console.error('Error loading analysis:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const getEstimatedArticles = (chunks: number) => {
    if (!data) return 0
    return Math.floor(chunks / data.stats.avgChunksPerArticle)
  }

  const getEstimatedChars = (chunks: number) => {
    if (!data) return 0
    const avgChunkSize = data.distribution.reduce((sum, d) => sum + d.avg_chunk_length, 0) / data.distribution.length
    return Math.round(chunks * avgChunkSize)
  }

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true)

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'knowledge.maxChunks',
          value: simulatedChunks,
          description: 'Maximum number of knowledge base chunks to include in analysis',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save configuration')
      }

      toast.success('Configuração salva com sucesso! A próxima análise usará o novo valor.')
      await loadAnalysis() // Reload to get updated current value
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Erro ao salvar configuração')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Analisando knowledge base...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Link href="/admin/knowledge">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error || 'Erro ao carregar dados'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/knowledge">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Análise da Knowledge Base</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Otimize a configuração de chunks para análises médicas
          </p>
        </div>
        <Button onClick={loadAnalysis} variant="outline" className="gap-2">
          <Database className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Artigos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{data.stats.totalArticles}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Chunks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{data.stats.totalChunks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média de Chunks/Artigo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{data.stats.avgChunksPerArticle}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Range de Chunks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold">
                {data.stats.minChunksPerArticle} - {data.stats.maxChunksPerArticle}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Configuration Alert */}
      <Card className={
        data.recommendations.estimatedArticlesWithCurrent < 3
          ? 'border-red-200 bg-red-50'
          : data.recommendations.estimatedArticlesWithCurrent < 5
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-green-200 bg-green-50'
      }>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
              data.recommendations.estimatedArticlesWithCurrent < 3
                ? 'text-red-600'
                : data.recommendations.estimatedArticlesWithCurrent < 5
                ? 'text-yellow-600'
                : 'text-green-600'
            }`} />
            <div>
              <p className="font-semibold mb-1">
                Configuração Atual: {data.recommendations.current} chunks
              </p>
              <p className="text-sm">
                Com esta configuração, você está usando conhecimento de aproximadamente{' '}
                <strong>{data.recommendations.estimatedArticlesWithCurrent} artigo(s)</strong> por análise.
                {data.recommendations.estimatedArticlesWithCurrent < 3 && (
                  <span className="text-red-700">
                    {' '}⚠️ Isso é muito baixo! Você está desperdiçando a maior parte do conhecimento disponível.
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Conservador
            </CardTitle>
            <CardDescription>Foco em alta relevância</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-blue-600">{data.recommendations.conservative}</p>
                <p className="text-sm text-muted-foreground">chunks recomendados</p>
              </div>
              <div className="text-sm space-y-1">
                <p>• ~{getEstimatedArticles(data.recommendations.conservative)} artigos cobertos</p>
                <p>• ~{(getEstimatedChars(data.recommendations.conservative) / 1000).toFixed(0)}K caracteres</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Balanceado (Recomendado)
            </CardTitle>
            <CardDescription>Melhor custo-benefício</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-green-600">{data.recommendations.balanced}</p>
                <p className="text-sm text-muted-foreground">chunks recomendados</p>
              </div>
              <div className="text-sm space-y-1">
                <p>• ~{getEstimatedArticles(data.recommendations.balanced)} artigos cobertos</p>
                <p>• ~{(getEstimatedChars(data.recommendations.balanced) / 1000).toFixed(0)}K caracteres</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Comprehensivo
            </CardTitle>
            <CardDescription>Máximo contexto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-purple-600">{data.recommendations.comprehensive}</p>
                <p className="text-sm text-muted-foreground">chunks recomendados</p>
              </div>
              <div className="text-sm space-y-1">
                <p>• ~{getEstimatedArticles(data.recommendations.comprehensive)} artigos cobertos</p>
                <p>• ~{(getEstimatedChars(data.recommendations.comprehensive) / 1000).toFixed(0)}K caracteres</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulator */}
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Configuração</CardTitle>
          <CardDescription>
            Simule diferentes valores de maxChunks para ver o impacto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="chunks">Número de Chunks (maxChunks)</Label>
              <Input
                id="chunks"
                type="number"
                min="1"
                max="500"
                value={simulatedChunks}
                onChange={(e) => setSimulatedChunks(parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSimulatedChunks(data.recommendations.conservative)}
              >
                Conservador
              </Button>
              <Button
                variant="outline"
                onClick={() => setSimulatedChunks(data.recommendations.balanced)}
              >
                Balanceado
              </Button>
              <Button
                variant="outline"
                onClick={() => setSimulatedChunks(data.recommendations.comprehensive)}
              >
                Comprehensivo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Artigos Cobertos</p>
              <p className="text-2xl font-bold">~{getEstimatedArticles(simulatedChunks)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Caracteres Estimados</p>
              <p className="text-2xl font-bold">~{(getEstimatedChars(simulatedChunks) / 1000).toFixed(0)}K</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">% da Base</p>
              <p className="text-2xl font-bold">
                {((getEstimatedArticles(simulatedChunks) / data.stats.totalArticles) * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">
                💡 Valor Atual na Configuração: <strong>{data.recommendations.current} chunks</strong>
              </p>
              <p className="text-xs">
                As próximas análises usarão este valor. Ajuste acima e clique em &quot;Aplicar Configuração&quot;.
              </p>
            </div>
            <Button
              onClick={handleSaveConfig}
              disabled={isSaving || simulatedChunks === data.recommendations.current}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Aplicar Configuração
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Chunks por Artigo</CardTitle>
          <CardDescription>
            Top 20 artigos ordenados por quantidade de chunks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Título do Artigo</TableHead>
                <TableHead className="text-right">Chunks</TableHead>
                <TableHead className="text-right">Tamanho Médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.distribution.slice(0, 20).map((article, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="max-w-md truncate">{article.title}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={
                      article.chunk_count > 50 ? 'destructive' :
                      article.chunk_count > 20 ? 'default' :
                      'secondary'
                    }>
                      {article.chunk_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {article.avg_chunk_length} chars
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.distribution.length > 20 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Mostrando 20 de {data.distribution.length} artigos
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
