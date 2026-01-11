/**
 * Metric Edit Dialog
 * Edit existing calculated metric in Cérebro Lógico
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Metric {
  slug: string
  name: string
  formula: string
  targetMin: string | null
  targetMax: string | null
  riskInsight: string | null
  sourceRef: string | null
}

interface Props {
  metric: Metric | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function MetricEditDialog({ metric, open, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<Metric>({
    slug: '',
    name: '',
    formula: '',
    targetMin: null,
    targetMax: null,
    riskInsight: null,
    sourceRef: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (metric) {
      setFormData(metric)
    }
  }, [metric])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/medical-knowledge/metrics/${formData.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Métrica atualizada com sucesso')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Erro ao atualizar métrica')
      }
    } catch (error) {
      console.error('Error updating metric:', error)
      toast.error('Erro ao atualizar métrica')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Métrica Calculada</DialogTitle>
          <DialogDescription>
            Atualize as informações da métrica {metric?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Slug (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (identificador)</Label>
            <Input id="slug" value={formData.slug} disabled />
          </div>

          {/* Formula */}
          <div className="space-y-2">
            <Label htmlFor="formula">Fórmula *</Label>
            <Input
              id="formula"
              value={formData.formula}
              onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
              placeholder="Ex: biomarker_a / biomarker_b"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use slugs dos biomarcadores na fórmula
            </p>
          </div>

          {/* Target Range */}
          <div className="space-y-2">
            <Label>Faixa Alvo</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetMin">Mínimo</Label>
                <Input
                  id="targetMin"
                  type="number"
                  step="0.01"
                  value={formData.targetMin || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, targetMin: e.target.value || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetMax">Máximo</Label>
                <Input
                  id="targetMax"
                  type="number"
                  step="0.01"
                  value={formData.targetMax || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, targetMax: e.target.value || null })
                  }
                />
              </div>
            </div>
          </div>

          {/* Risk Insight */}
          <div className="space-y-2">
            <Label htmlFor="riskInsight">Insight de Risco</Label>
            <Textarea
              id="riskInsight"
              value={formData.riskInsight || ''}
              onChange={(e) => setFormData({ ...formData, riskInsight: e.target.value || null })}
              rows={3}
              placeholder="O que valores fora do alvo podem indicar?"
            />
          </div>

          {/* Source Reference */}
          <div className="space-y-2">
            <Label htmlFor="sourceRef">Referência</Label>
            <Input
              id="sourceRef"
              value={formData.sourceRef || ''}
              onChange={(e) => setFormData({ ...formData, sourceRef: e.target.value || null })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
