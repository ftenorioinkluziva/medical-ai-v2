/**
 * Suggestion Filters Component
 * Filters for suggestion list
 */

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface FiltersState {
  status: string
  priority: string
  targetType: string
  suggestionType: string
  isConflict: boolean
}

interface Props {
  filters: FiltersState
  setFilters: (filters: FiltersState) => void
}

export function SuggestionFilters({ filters, setFilters }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="applied">Aplicado</SelectItem>
                <SelectItem value="modified">Modificado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select
              value={filters.priority}
              onValueChange={(value) =>
                setFilters({ ...filters, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Type Filter */}
          <div className="space-y-2">
            <Label>Tipo de Alvo</Label>
            <Select
              value={filters.targetType}
              onValueChange={(value) =>
                setFilters({ ...filters, targetType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="biomarker">Biomarcador</SelectItem>
                <SelectItem value="protocol">Protocolo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Suggestion Type Filter */}
          <div className="space-y-2">
            <Label>Ação</Label>
            <Select
              value={filters.suggestionType}
              onValueChange={(value) =>
                setFilters({ ...filters, suggestionType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="biomarker_update">Atualizar Biomarcador</SelectItem>
                <SelectItem value="biomarker_create">Criar Biomarcador</SelectItem>
                <SelectItem value="protocol_update">Atualizar Protocolo</SelectItem>
                <SelectItem value="protocol_create">Criar Protocolo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conflict Filter */}
          <div className="space-y-2">
            <Label>Apenas Conflitos</Label>
            <div className="flex items-center h-10">
              <Switch
                checked={filters.isConflict}
                onCheckedChange={(checked) =>
                  setFilters({
                    ...filters,
                    isConflict: checked,
                    // When enabling conflict filter, automatically show all statuses
                    status: checked ? 'all' : filters.status,
                  })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
