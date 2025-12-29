'use client'

/**
 * Pricing Configuration Component
 * Admin interface for managing model costs and profit margins
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  DollarSign,
  TrendingUp,
  Settings,
  Save,
  RefreshCw,
  Calculator,
} from 'lucide-react'

interface ModelCost {
  inputPer1M: number
  outputPer1M: number
  cachedInputPer1M: number
}

interface ModelCosts {
  [key: string]: ModelCost
}

export function PricingConfig() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modelCosts, setModelCosts] = useState<ModelCosts>({})
  const [usdToBrlRate, setUsdToBrlRate] = useState(5.0)
  const [creditPriceBrl, setCreditPriceBrl] = useState(0.50)

  useEffect(() => {
    loadPricing()
  }, [])

  async function loadPricing() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/pricing')
      if (!res.ok) throw new Error('Failed to load pricing')

      const data = await res.json()
      setModelCosts(data.modelCosts)
      setUsdToBrlRate(data.usdToBrlRate)
      setCreditPriceBrl(data.creditPriceBrl)
    } catch (error) {
      console.error('Failed to load pricing:', error)
      toast.error('Erro ao carregar configurações de preço')
    } finally {
      setLoading(false)
    }
  }

  async function savePricing() {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelCosts,
          usdToBrlRate,
          creditPriceBrl,
        }),
      })

      if (!res.ok) throw new Error('Failed to save pricing')

      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Failed to save pricing:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  // Calculate costs for typical operations
  const calculateOperationCost = (
    model: string,
    promptTokens: number,
    completionTokens: number,
    cachedTokens: number = 0
  ) => {
    const costs = modelCosts[model]
    if (!costs) return { costUsd: 0, costBrl: 0, revenue: 0, margin: 0 }

    const promptCostUsd = (promptTokens / 1_000_000) * costs.inputPer1M
    const completionCostUsd = (completionTokens / 1_000_000) * costs.outputPer1M
    const cachedCostUsd = (cachedTokens / 1_000_000) * costs.cachedInputPer1M
    const totalCostUsd = promptCostUsd + completionCostUsd + cachedCostUsd
    const totalCostBrl = totalCostUsd * usdToBrlRate

    const totalTokens = promptTokens + completionTokens + cachedTokens
    const credits = Math.ceil(totalTokens / 1000)
    const revenue = credits * creditPriceBrl

    const margin = revenue > 0 ? ((revenue - totalCostBrl) / revenue) * 100 : 0

    return {
      costUsd: totalCostUsd,
      costBrl: totalCostBrl,
      revenue,
      margin,
      credits,
    }
  }

  // Example operations for margin calculation
  const exampleOperations = {
    'gemini-2.5-flash': {
      name: 'Análise Completa (Flash)',
      promptTokens: 80000,
      completionTokens: 20000,
      cachedTokens: 0,
    },
    'gemini-2.5-pro': {
      name: 'Chat (Pro)',
      promptTokens: 15000,
      completionTokens: 1000,
      cachedTokens: 0,
    },
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Carregando configurações...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Exchange Rate & Credit Price */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Configurações Globais
          </CardTitle>
          <CardDescription>
            Taxa de câmbio e preço por crédito
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="usd-brl">Taxa USD → BRL</Label>
              <Input
                id="usd-brl"
                type="number"
                step="0.01"
                value={usdToBrlRate}
                onChange={(e) => setUsdToBrlRate(parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Taxa de câmbio para calcular custos em reais
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-price">Preço por Crédito (BRL)</Label>
              <Input
                id="credit-price"
                type="number"
                step="0.01"
                value={creditPriceBrl}
                onChange={(e) => setCreditPriceBrl(parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                1 crédito = 1.000 tokens • Atual: R$ {creditPriceBrl.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Custos dos Modelos (USD por 1M tokens)
          </CardTitle>
          <CardDescription>
            Preços da Google AI Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(modelCosts).map(([model, costs]) => (
            <div key={model} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{model}</h4>
                <Badge variant="outline">{model.includes('pro') ? 'Premium' : 'Standard'}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Input</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={costs.inputPer1M}
                    onChange={(e) =>
                      setModelCosts({
                        ...modelCosts,
                        [model]: { ...costs, inputPer1M: parseFloat(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Output</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={costs.outputPer1M}
                    onChange={(e) =>
                      setModelCosts({
                        ...modelCosts,
                        [model]: { ...costs, outputPer1M: parseFloat(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cached Input</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={costs.cachedInputPer1M}
                    onChange={(e) =>
                      setModelCosts({
                        ...modelCosts,
                        [model]: { ...costs, cachedInputPer1M: parseFloat(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>
              {model in exampleOperations && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{exampleOperations[model as keyof typeof exampleOperations].name}</p>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {(() => {
                    const example = exampleOperations[model as keyof typeof exampleOperations]
                    const calc = calculateOperationCost(
                      model,
                      example.promptTokens,
                      example.completionTokens,
                      example.cachedTokens
                    )
                    return (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Custo:</span>
                          <span className="ml-2 font-mono">R$ {calc.costBrl.toFixed(4)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Receita:</span>
                          <span className="ml-2 font-mono">R$ {calc.revenue.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Créditos:</span>
                          <span className="ml-2 font-mono">{calc.credits}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Margem:</span>
                          <span className={`ml-2 font-mono font-semibold ${calc.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calc.margin.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Profit Margin Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Resumo de Margens
          </CardTitle>
          <CardDescription>
            Análise de lucratividade por tipo de operação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(exampleOperations).map(([model, example]) => {
              const calc = calculateOperationCost(
                model,
                example.promptTokens,
                example.completionTokens,
                example.cachedTokens
              )
              return (
                <div key={model} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{example.name}</p>
                    <p className="text-sm text-muted-foreground">{model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {calc.margin.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      R$ {calc.revenue.toFixed(2)} - R$ {calc.costBrl.toFixed(4)} = R$ {(calc.revenue - calc.costBrl).toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePricing} disabled={saving} size="lg" className="gap-2">
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
