/**
 * Suggestion List Component
 * Displays filtered list of knowledge update suggestions
 */

import { useState, useEffect } from 'react'
import { SuggestionCard } from './suggestion-card'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

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

interface FiltersState {
  status: string
  priority: string
  targetType: string
  suggestionType: string
  isConflict: boolean
}

interface Props {
  filters: FiltersState
  refreshTrigger: number
  onRefresh: () => void
}

export function SuggestionList({ filters, refreshTrigger, onRefresh }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadSuggestions()
  }, [filters, refreshTrigger])

  const loadSuggestions = async () => {
    try {
      setIsLoading(true)

      // Build query params
      const params = new URLSearchParams()

      if (filters.status !== 'all') {
        params.append('status', filters.status)
      }

      if (filters.priority !== 'all') {
        params.append('priority', filters.priority)
      }

      if (filters.targetType !== 'all') {
        params.append('targetType', filters.targetType)
      }

      if (filters.suggestionType !== 'all') {
        params.append('suggestionType', filters.suggestionType)
      }

      if (filters.isConflict) {
        params.append('isConflict', 'true')
      }

      params.append('limit', '50')

      const response = await fetch(`/api/admin/knowledge-sync/suggestions?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSuggestions(data.suggestions)
          setTotal(data.total)
        }
      }
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando sugestões...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Nenhuma sugestão encontrada com os filtros selecionados
            </p>
            {filters.isConflict && (
              <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg max-w-md mx-auto">
                💡 Dica: Conflitos podem estar em qualquer status (Aplicado, Rejeitado, etc).
                Mude o filtro de Status para "Todos" para visualizar todos os conflitos.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} sugestão{total !== 1 ? 'ões' : ''} encontrada{total !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onActionComplete={onRefresh}
          />
        ))}
      </div>
    </div>
  )
}
