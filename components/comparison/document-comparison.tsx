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
      return <TrendingUp className={`h-4 w-4 ${isGood ? 'text-green-600' : 'text-red-600'}`} />
    } else if (trend === 'down') {
      return <TrendingDown className={`h-4 w-4 ${isGood ? 'text-green-600' : 'text-red-600'}`} />
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getValueColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return 'text-green-600'
      case 'alto':
      case 'elevado':
        return 'text-red-600'
      case 'baixo':
        return 'text-orange-600'
      default:
        return 'text-gray-900'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Processando comparação...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-600">Erro ao carregar documentos para comparação</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Documents Header */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Comparados</CardTitle>
          <CardDescription>
            Comparando {documents.length} documento{documents.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <div key={doc.id} className="p-4 border rounded-lg">
                <Badge className="mb-2">#{index + 1}</Badge>
                <h4 className="font-medium text-sm mb-1 truncate">{doc.fileName}</h4>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Tables by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Parâmetros</CardTitle>
          <CardDescription>
            Visualize a evolução dos parâmetros ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Array.from(comparisonData.keys())[0]} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${comparisonData.size}, minmax(0, 1fr))` }}>
              {Array.from(comparisonData.keys()).map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {Array.from(comparisonData.entries()).map(([category, parameters]) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold bg-gray-50">Parâmetro</th>
                        {documents.map((doc, index) => (
                          <th key={doc.id} className="text-center p-3 font-semibold bg-gray-50">
                            #{index + 1}
                            <div className="text-xs font-normal text-muted-foreground mt-1">
                              {format(new Date(doc.createdAt), 'dd/MM/yy')}
                            </div>
                          </th>
                        ))}
                        <th className="text-center p-3 font-semibold bg-gray-50">Tendência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parameters.map((param) => (
                        <tr key={param.name} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{param.name}</td>
                          {documents.map((doc) => {
                            const value = param.values.find((v) => v.documentId === doc.id)
                            return (
                              <td key={doc.id} className="text-center p-3">
                                {value ? (
                                  <div>
                                    <div className={`font-semibold ${getValueColor(value.status)}`}>
                                      {value.value} {value.unit}
                                    </div>
                                    {value.status && (
                                      <Badge
                                        variant="outline"
                                        className={`text-xs mt-1 ${
                                          value.status === 'Normal'
                                            ? 'border-green-600 text-green-600'
                                            : value.status === 'Alto' || value.status === 'Elevado'
                                            ? 'border-red-600 text-red-600'
                                            : 'border-orange-600 text-orange-600'
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
                          <td className="text-center p-3">
                            <div className="flex items-center justify-center gap-2">
                              {getTrendIcon(param.trend, param.values[param.values.length - 1]?.status)}
                              {param.percentageChange !== undefined && (
                                <span className="text-xs text-muted-foreground">
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
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum parâmetro encontrado nesta categoria
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
