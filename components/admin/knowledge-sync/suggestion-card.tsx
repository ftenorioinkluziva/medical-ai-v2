/**
 * Suggestion Card Component
 * Displays a single knowledge update suggestion
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, Edit, RotateCcw, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'
import { ModifySuggestionDialog } from './modify-dialog'

interface Suggestion {
  id: string
  articleTitle: string
  suggestionType: string
  targetType: string
  targetSlug: string | null
  suggestedData: any
  currentData: any | null
  aiConfidence: string
  aiReasoning: string
  priority: string
  isConflict: boolean
  status: string
  createdAt: string
}

interface Props {
  suggestion: Suggestion
  onActionComplete: () => void
}

export function SuggestionCard({ suggestion, onActionComplete }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false)

  const handleApprove = async () => {
    if (!confirm('Deseja aprovar e aplicar esta sugestão ao Cérebro Lógico?')) {
      return
    }

    try {
      setIsProcessing(true)

      const response = await fetch(`/api/admin/knowledge-sync/suggestions/${suggestion.id}/approve`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Sugestão aplicada ao Cérebro Lógico com sucesso')
        onActionComplete()
      } else {
        toast.error(data.error || 'Erro ao aplicar sugestão')
      }
    } catch (error) {
      console.error('Error approving suggestion:', error)
      toast.error('Erro ao aplicar sugestão')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    const notes = prompt('Motivo da rejeição (opcional):')
    if (notes === null) return // User cancelled

    try {
      setIsProcessing(true)

      const response = await fetch(`/api/admin/knowledge-sync/suggestions/${suggestion.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Sugestão rejeitada')
        onActionComplete()
      } else {
        toast.error(data.error || 'Erro ao rejeitar sugestão')
      }
    } catch (error) {
      console.error('Error rejecting suggestion:', error)
      toast.error('Erro ao rejeitar sugestão')
    } finally {
      setIsProcessing(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      case 'low':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'applied':
        return 'bg-blue-100 text-blue-800'
      case 'modified':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderValueComparison = () => {
    if (suggestion.suggestionType.includes('create')) {
      // New creation - show suggested values
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">Valores Sugeridos:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {suggestion.suggestedData.optimalMin !== undefined && (
              <div>
                <span className="text-muted-foreground">Ótimo Mín:</span>
                <span className="ml-2 font-medium text-green-600">
                  {suggestion.suggestedData.optimalMin} {suggestion.suggestedData.unit}
                </span>
              </div>
            )}
            {suggestion.suggestedData.optimalMax !== undefined && (
              <div>
                <span className="text-muted-foreground">Ótimo Máx:</span>
                <span className="ml-2 font-medium text-green-600">
                  {suggestion.suggestedData.optimalMax} {suggestion.suggestedData.unit}
                </span>
              </div>
            )}
            {suggestion.suggestedData.labMin !== undefined && (
              <div>
                <span className="text-muted-foreground">Lab Mín:</span>
                <span className="ml-2 font-medium text-green-600">
                  {suggestion.suggestedData.labMin} {suggestion.suggestedData.unit}
                </span>
              </div>
            )}
            {suggestion.suggestedData.labMax !== undefined && (
              <div>
                <span className="text-muted-foreground">Lab Máx:</span>
                <span className="ml-2 font-medium text-green-600">
                  {suggestion.suggestedData.labMax} {suggestion.suggestedData.unit}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }

    // Update - show comparison
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Comparação de Valores:</p>
        <div className="grid grid-cols-1 gap-3 text-sm">
          {suggestion.suggestedData.optimalMin !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ótimo Mín:</span>
              <div className="flex items-center gap-2">
                <span className="text-red-600">
                  {suggestion.currentData?.optimalMin || 'N/A'}
                </span>
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium text-green-600">
                  {suggestion.suggestedData.optimalMin}
                </span>
              </div>
            </div>
          )}
          {suggestion.suggestedData.optimalMax !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ótimo Máx:</span>
              <div className="flex items-center gap-2">
                <span className="text-red-600">
                  {suggestion.currentData?.optimalMax || 'N/A'}
                </span>
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium text-green-600">
                  {suggestion.suggestedData.optimalMax}
                </span>
              </div>
            </div>
          )}
          {suggestion.suggestedData.labMin !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Lab Mín:</span>
              <div className="flex items-center gap-2">
                <span className="text-red-600">
                  {suggestion.currentData?.labMin || 'N/A'}
                </span>
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium text-green-600">
                  {suggestion.suggestedData.labMin}
                </span>
              </div>
            </div>
          )}
          {suggestion.suggestedData.labMax !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Lab Máx:</span>
              <div className="flex items-center gap-2">
                <span className="text-red-600">
                  {suggestion.currentData?.labMax || 'N/A'}
                </span>
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium text-green-600">
                  {suggestion.suggestedData.labMax}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={suggestion.isConflict ? 'border-yellow-500 border-2' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getPriorityColor(suggestion.priority)}>
                {suggestion.priority.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(suggestion.status)}>
                {suggestion.status}
              </Badge>
              {suggestion.isConflict && (
                <Badge variant="outline" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Conflito
                </Badge>
              )}
              <Badge variant="outline">
                {suggestion.targetType}
              </Badge>
            </div>
            <CardTitle className="text-lg">
              {suggestion.suggestedData.name || suggestion.targetSlug}
            </CardTitle>
            <CardDescription className="mt-1">
              Fonte: {suggestion.articleTitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Value Comparison */}
        {renderValueComparison()}

        {/* AI Reasoning */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Raciocínio da IA:</p>
          <p className="text-sm text-muted-foreground">{suggestion.aiReasoning}</p>
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Confiança:</span>
          <Badge variant={suggestion.aiConfidence === 'high' ? 'default' : 'secondary'}>
            {suggestion.aiConfidence}
          </Badge>
        </div>
      </CardContent>

      {suggestion.status === 'pending' && (
        <CardFooter className="gap-2">
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 gap-2"
            variant="default"
          >
            <Check className="h-4 w-4" />
            Aprovar
          </Button>
          <Button
            onClick={() => setIsModifyDialogOpen(true)}
            disabled={isProcessing}
            className="flex-1 gap-2"
            variant="outline"
          >
            <Edit className="h-4 w-4" />
            Modificar
          </Button>
          <Button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 gap-2"
            variant="destructive"
          >
            <X className="h-4 w-4" />
            Rejeitar
          </Button>
        </CardFooter>
      )}

      <ModifySuggestionDialog
        suggestion={suggestion}
        open={isModifyDialogOpen}
        onOpenChange={setIsModifyDialogOpen}
        onSuccess={onActionComplete}
      />
    </Card>
  )
}
