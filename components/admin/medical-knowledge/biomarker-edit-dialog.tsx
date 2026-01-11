/**
 * Biomarker Edit Dialog
 * Edit existing biomarker in Cérebro Lógico
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

interface Biomarker {
  slug: string
  name: string
  category: string | null
  unit: string | null
  optimalMin: string | null
  optimalMax: string | null
  labMin: string | null
  labMax: string | null
  clinicalInsight: string | null
  metaphor: string | null
  sourceRef: string | null
}

interface Props {
  biomarker: Biomarker | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BiomarkerEditDialog({ biomarker, open, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<Biomarker>({
    slug: '',
    name: '',
    category: null,
    unit: null,
    optimalMin: null,
    optimalMax: null,
    labMin: null,
    labMax: null,
    clinicalInsight: null,
    metaphor: null,
    sourceRef: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (biomarker) {
      setFormData(biomarker)
    }
  }, [biomarker])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/medical-knowledge/biomarkers/${formData.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Biomarcador atualizado com sucesso')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Erro ao atualizar biomarcador')
      }
    } catch (error) {
      console.error('Error updating biomarker:', error)
      toast.error('Erro ao atualizar biomarcador')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Biomarcador</DialogTitle>
          <DialogDescription>
            Atualize as informações do biomarcador {biomarker?.name}
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

          {/* Category and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={formData.unit || ''}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value || null })}
              />
            </div>
          </div>

          {/* Optimal Range */}
          <div className="space-y-2">
            <Label>Faixa Ótima (Funcional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="optimalMin">Mínimo</Label>
                <Input
                  id="optimalMin"
                  type="number"
                  step="0.01"
                  value={formData.optimalMin || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, optimalMin: e.target.value || null })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optimalMax">Máximo</Label>
                <Input
                  id="optimalMax"
                  type="number"
                  step="0.01"
                  value={formData.optimalMax || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, optimalMax: e.target.value || null })
                  }
                />
              </div>
            </div>
          </div>

          {/* Lab Range */}
          <div className="space-y-2">
            <Label>Faixa Laboratorial</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labMin">Mínimo</Label>
                <Input
                  id="labMin"
                  type="number"
                  step="0.01"
                  value={formData.labMin || ''}
                  onChange={(e) => setFormData({ ...formData, labMin: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labMax">Máximo</Label>
                <Input
                  id="labMax"
                  type="number"
                  step="0.01"
                  value={formData.labMax || ''}
                  onChange={(e) => setFormData({ ...formData, labMax: e.target.value || null })}
                />
              </div>
            </div>
          </div>

          {/* Clinical Insight */}
          <div className="space-y-2">
            <Label htmlFor="clinicalInsight">Interpretação Clínica</Label>
            <Textarea
              id="clinicalInsight"
              value={formData.clinicalInsight || ''}
              onChange={(e) =>
                setFormData({ ...formData, clinicalInsight: e.target.value || null })
              }
              rows={3}
            />
          </div>

          {/* Metaphor */}
          <div className="space-y-2">
            <Label htmlFor="metaphor">Metáfora</Label>
            <Textarea
              id="metaphor"
              value={formData.metaphor || ''}
              onChange={(e) => setFormData({ ...formData, metaphor: e.target.value || null })}
              rows={2}
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
