'use client'

/**
 * Document Comparison Component
 * Compare parameters side by side with visual indicators
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DocumentComparisonProps {
  documentIds: string[]
}

interface Document {
  id: string
  fileName: string
  createdAt: string
  structuredData: any
}

interface ComparisonParameter {
  name: string
  values: {
    documentId: string
    value: string
    unit: string
    status: string
    referenceRange: string
  }[]
  trend?: 'up' | 'down' | 'stable'
  percentageChange?: number
}

export function DocumentComparison({ documentIds }: DocumentComparisonProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [comparisonData, setComparisonData] = useState<Map<string, ComparisonParameter[]>>(new Map())

  useEffect(() => {
    loadDocuments()
  }, [documentIds])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)

      // Fetch all selected documents
      const promises = documentIds.map((id) => fetch(`/api/documents/${id}`).then((r) => r.json()))
      const results = await Promise.all(promises)

      const docs = results.map((r) => r.document).filter(Boolean)

      // Sort by date (oldest first)
      docs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      setDocuments(docs)
      processComparison(docs)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processComparison = (docs: Document[]) => {
    const comparison = new Map<string, ComparisonParameter[]>()

    // Group parameters by module category
    docs.forEach((doc) => {
      if (!doc.structuredData?.modules) return

      doc.structuredData.modules.forEach((module: any) => {
        const category = module.category || 'Outros'

        if (!comparison.has(category)) {
          comparison.set(category, [])
        }

        const categoryParams = comparison.get(category)!

        // Process each parameter
        module.parameters?.forEach((param: any) => {
          let existing = categoryParams.find((p) => p.name === param.name)

          if (!existing) {
            existing = {
              name: param.name,
              values: [],
            }
            categoryParams.push(existing)
          }

          existing.values.push({
            documentId: doc.id,
            value: param.value,
            unit: param.unit || '',
            status: param.status || '',
            referenceRange: param.referenceRange || '',
          })
        })
      })
    })

    // Calculate trends
    comparison.forEach((params) => {
      params.forEach((param) => {
        if (param.values.length >= 2) {
          const firstValue = parseFloat(param.values[0].value)
          const lastValue = parseFloat(param.values[param.values.length - 1].value)

          if (!isNaN(firstValue) && !isNaN(lastValue) && firstValue !== 0) {
            const change = ((lastValue - firstValue) / firstValue) * 100
            param.percentageChange = change

            if (Math.abs(change) < 5) {
              param.trend = 'stable'
            } else if (change > 0) {
              param.trend = 'up'
            } else {
              param.trend = 'down'
            }
          }
        }
      })
    })

    setComparisonData(comparison)
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable', status?: string) => {
    if (!trend) return null

    // Check if trending in the right direction based on status
    const isGood =
      (trend === 'down' && status === 'Alto') ||
      (trend === 'up' && status === 'Baixo') ||
      trend === 'stable'

    if (trend === 'up') {
      return <TrendingUp className={`h-4 w-4 ${isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
    } else if (trend === 'down') {
      return <TrendingDown className={`h-4 w-4 ${isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getValueColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return 'text-emerald-600 dark:text-emerald-400'
      case 'alto':
      case 'elevado':
        return 'text-red-600 dark:text-red-400'
      case 'baixo':
        return 'text-orange-600 dark:text-orange-400'
      default:
        return 'text-foreground'
    }
  }

  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600 dark:text-teal-400" />
            <p className="text-sm text-muted-foreground">Processando comparação...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20 hover:shadow-md transition-shadow">
        <CardContent className="p-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">Erro ao carregar documentos para comparação</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Documents Header */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Documentos Comparados</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Comparando {documents.length} documento{documents.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <div key={doc.id} className="p-4 border border-border rounded-lg bg-card hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/30 dark:hover:bg-teal-950/30 transition-all">
                <Badge className="mb-3 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">#{index + 1}</Badge>
                <h4 className="font-semibold text-sm mb-1 truncate text-foreground">{doc.fileName}</h4>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Tables by Category */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Comparação de Parâmetros</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Visualize a evolução dos parâmetros ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Array.from(comparisonData.keys())[0]} className="w-full">
            <TabsList className="grid w-full bg-muted" style={{ gridTemplateColumns: `repeat(${comparisonData.size}, minmax(0, 1fr))` }}>
              {Array.from(comparisonData.keys()).map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-teal-600 dark:data-[state=active]:bg-teal-500 data-[state=active]:text-white"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {Array.from(comparisonData.entries()).map(([category, parameters]) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left p-4 font-semibold bg-teal-50 dark:bg-teal-950/20 text-foreground rounded-tl-lg">
                          Parâmetro
                        </th>
                        {documents.map((doc, index) => (
                          <th key={doc.id} className="text-center p-4 font-semibold bg-teal-50 dark:bg-teal-950/20 text-foreground">
                            <div className="text-sm font-semibold">#{index + 1}</div>
                            <div className="text-xs font-normal text-muted-foreground mt-1.5">
                              {format(new Date(doc.createdAt), 'dd/MM/yy')}
                            </div>
                          </th>
                        ))}
                        <th className="text-center p-4 font-semibold bg-teal-50 dark:bg-teal-950/20 text-foreground rounded-tr-lg">
                          Tendência
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parameters.map((param) => (
                        <tr key={param.name} className="border-b border-border hover:bg-teal-50/30 dark:hover:bg-teal-950/30 transition-colors">
                          <td className="p-4 font-semibold text-foreground">{param.name}</td>
                          {documents.map((doc) => {
                            const value = param.values.find((v) => v.documentId === doc.id)
                            return (
                              <td key={doc.id} className="text-center p-4">
                                {value ? (
                                  <div className="space-y-2">
                                    <div className={`font-semibold text-sm ${getValueColor(value.status)}`}>
                                      {value.value} {value.unit}
                                    </div>
                                    {value.status && (
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          value.status === 'Normal'
                                            ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                                            : value.status === 'Alto' || value.status === 'Elevado'
                                            ? 'border-red-600 dark:border-red-500 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30'
                                            : 'border-orange-600 dark:border-orange-500 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/30'
                                        }`}
                                      >
                                        {value.status}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </td>
                            )
                          })}
                          <td className="text-center p-4">
                            <div className="flex items-center justify-center gap-2">
                              {getTrendIcon(param.trend, param.values[param.values.length - 1]?.status)}
                              {param.percentageChange !== undefined && (
                                <span className="text-xs text-muted-foreground font-medium">
                                  {param.percentageChange > 0 ? '+' : ''}
                                  {param.percentageChange.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parameters.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-muted rounded-lg p-4 mb-4 inline-block">
                      <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Nenhum parâmetro encontrado nesta categoria
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
