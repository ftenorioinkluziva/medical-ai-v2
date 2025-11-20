'use client'

/**
 * Analysis Selector Component
 * Allows user to select an existing analysis to chat with
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, MessageCircle, Calendar, FileText } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Analysis {
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

interface AnalysisSelectorProps {
  onSelectAnalysis?: (analysis: Analysis | null) => void
  className?: string
}

export function AnalysisSelector({
  onSelectAnalysis,
  className = '',
}: AnalysisSelectorProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/analyses')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar análises')
      }

      setAnalyses(data.analyses || [])
    } catch (err) {
      console.error('Error loading analyses:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAnalysis = (analysisId: string) => {
    setSelectedAnalysisId(analysisId)
    const selected = analyses.find((a) => a.id === analysisId) || null
    onSelectAnalysis?.(selected)
  }

  const getAgentColor = (color: string) => {
    const colorMap: Record<string, string> = {
      green: 'bg-green-100 text-green-700 border-green-300',
      purple: 'bg-purple-100 text-purple-700 border-purple-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300',
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      teal: 'bg-teal-100 text-teal-700 border-teal-300',
    }
    return colorMap[color] || colorMap.teal
  }

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600 mr-2" />
          <span className="text-sm text-muted-foreground">Carregando análises...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`p-6 bg-red-50 border-red-200 ${className}`}>
        <p className="text-sm text-red-900">
          <strong>Erro:</strong> {error}
        </p>
      </Card>
    )
  }

  if (analyses.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">Nenhuma análise disponível</p>
          <p className="text-xs mt-1">Realize uma análise médica primeiro para conversar com o especialista</p>
        </div>
      </Card>
    )
  }

  const selectedAnalysis = analyses.find((a) => a.id === selectedAnalysisId)

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="analysis-select" className="text-base font-semibold">
            Selecione uma análise para conversar
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha uma das suas análises anteriores para tirar dúvidas com o especialista
          </p>
        </div>

        <Select value={selectedAnalysisId} onValueChange={handleSelectAnalysis}>
          <SelectTrigger id="analysis-select" className="w-full">
            <SelectValue placeholder="Selecione uma análise..." />
          </SelectTrigger>
          <SelectContent>
            {analyses.map((analysis) => (
              <SelectItem key={analysis.id} value={analysis.id}>
                <div className="flex items-center gap-2 py-1">
                  <Avatar className={`h-6 w-6 border ${getAgentColor(analysis.agentColor)}`}>
                    <AvatarFallback className={`text-xs ${getAgentColor(analysis.agentColor)}`}>
                      {analysis.agentKey.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{analysis.agentName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(analysis.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Selected Analysis Preview */}
        {selectedAnalysis && (
          <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className={`h-10 w-10 border-2 ${getAgentColor(selectedAnalysis.agentColor)}`}>
                <AvatarFallback className={getAgentColor(selectedAnalysis.agentColor)}>
                  {selectedAnalysis.agentKey.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{selectedAnalysis.agentName}</h4>
                <p className="text-xs text-muted-foreground">{selectedAnalysis.agentTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(selectedAnalysis.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {selectedAnalysis.documentIds && selectedAnalysis.documentIds.length > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{selectedAnalysis.documentIds.length} documento(s)</span>
                </div>
              )}
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground line-clamp-3">
                {selectedAnalysis.analysis.substring(0, 200)}...
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
