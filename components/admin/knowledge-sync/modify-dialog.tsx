/**
 * Modify Suggestion Dialog Component
 * Allows editing suggested values before applying
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Suggestion {
  id: string
  suggestedData: {
    name: string
    slug?: string
    optimalMin?: number
    optimalMax?: number
    labMin?: number
    labMax?: number
    unit?: string
    sourceRef?: string
  }
}

interface Props {
  suggestion: Suggestion
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ModifySuggestionDialog({ suggestion, open, onOpenChange, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notes, setNotes] = useState('')

  // Form state initialized with suggested values
  const [formData, setFormData] = useState({
    name: suggestion.suggestedData.name || '',
    slug: suggestion.suggestedData.slug || '',
    optimalMin: suggestion.suggestedData.optimalMin?.toString() || '',
    optimalMax: suggestion.suggestedData.optimalMax?.toString() || '',
    labMin: suggestion.suggestedData.labMin?.toString() || '',
    labMax: suggestion.suggestedData.labMax?.toString() || '',
    unit: suggestion.suggestedData.unit || '',
    sourceRef: suggestion.suggestedData.sourceRef || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Build modified suggested data
      const modifiedData: any = {
        name: formData.name,
        slug: formData.slug || suggestion.suggestedData.slug,
        unit: formData.unit,
        sourceRef: formData.sourceRef,
      }

      // Add numeric values if provided
      if (formData.optimalMin) {
        modifiedData.optimalMin = parseFloat(formData.optimalMin)
      }
      if (formData.optimalMax) {
        modifiedData.optimalMax = parseFloat(formData.optimalMax)
      }
      if (formData.labMin) {
        modifiedData.labMin = parseFloat(formData.labMin)
      }
      if (formData.labMax) {
        modifiedData.labMax = parseFloat(formData.labMax)
      }

      const response = await fetch(
        `/api/admin/knowledge-sync/suggestions/${suggestion.id}/modify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            suggestedData: modifiedData,
            notes: notes || 'Valores modificados pelo administrador',
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        toast.success('Sugestão modificada com sucesso')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(data.error || 'Erro ao modificar sugestão')
      }
    } catch (error) {
      console.error('Error modifying suggestion:', error)
      toast.error('Erro ao modificar sugestão')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modificar Sugestão</DialogTitle>
          <DialogDescription>
            Ajuste os valores sugeridos antes de aplicar ao Cérebro Lógico
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Biomarcador</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (Identificador)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="vitamina_d3"
            />
          </div>

          {/* Optimal Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="optimalMin">Ótimo Mínimo</Label>
              <Input
                id="optimalMin"
                type="number"
                step="0.01"
                value={formData.optimalMin}
                onChange={(e) =>
                  setFormData({ ...formData, optimalMin: e.target.value })
                }
                placeholder="70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="optimalMax">Ótimo Máximo</Label>
              <Input
                id="optimalMax"
                type="number"
                step="0.01"
                value={formData.optimalMax}
                onChange={(e) =>
                  setFormData({ ...formData, optimalMax: e.target.value })
                }
                placeholder="90"
              />
            </div>
          </div>

          {/* Lab Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="labMin">Laboratorial Mínimo</Label>
              <Input
                id="labMin"
                type="number"
                step="0.01"
                value={formData.labMin}
                onChange={(e) =>
                  setFormData({ ...formData, labMin: e.target.value })
                }
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labMax">Laboratorial Máximo</Label>
              <Input
                id="labMax"
                type="number"
                step="0.01"
                value={formData.labMax}
                onChange={(e) =>
                  setFormData({ ...formData, labMax: e.target.value })
                }
                placeholder="100"
              />
            </div>
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label htmlFor="unit">Unidade de Medida</Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="ng/mL"
            />
          </div>

          {/* Source Reference */}
          <div className="space-y-2">
            <Label htmlFor="sourceRef">Referência da Fonte</Label>
            <Input
              id="sourceRef"
              value={formData.sourceRef}
              onChange={(e) =>
                setFormData({ ...formData, sourceRef: e.target.value })
              }
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas da Modificação</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva as mudanças realizadas..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Modificações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
