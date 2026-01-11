/**
 * Protocol Edit Dialog
 * Edit existing protocol in Cérebro Lógico
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

interface Protocol {
  id: string
  triggerCondition: string
  type: string
  title: string
  description: string
  dosage: string | null
  sourceRef: string | null
}

interface Props {
  protocol: Protocol | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ProtocolEditDialog({ protocol, open, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<Protocol>({
    id: '',
    triggerCondition: '',
    type: '',
    title: '',
    description: '',
    dosage: null,
    sourceRef: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (protocol) {
      setFormData(protocol)
    }
  }, [protocol])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/medical-knowledge/protocols/${formData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Protocolo atualizado com sucesso')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Erro ao atualizar protocolo')
      }
    } catch (error) {
      console.error('Error updating protocol:', error)
      toast.error('Erro ao atualizar protocolo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Protocolo</DialogTitle>
          <DialogDescription>
            Atualize as informações do protocolo {protocol?.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="Ex: Suplemento, Exame, Lifestyle"
              required
            />
          </div>

          {/* Trigger Condition */}
          <div className="space-y-2">
            <Label htmlFor="triggerCondition">Condição de Ativação *</Label>
            <Input
              id="triggerCondition"
              value={formData.triggerCondition}
              onChange={(e) => setFormData({ ...formData, triggerCondition: e.target.value })}
              placeholder="Ex: biomarker_slug < 50"
              required
            />
            <p className="text-xs text-muted-foreground">
              Condição lógica que ativa este protocolo
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Descreva a ação recomendada..."
              required
            />
          </div>

          {/* Dosage */}
          <div className="space-y-2">
            <Label htmlFor="dosage">Dosagem</Label>
            <Input
              id="dosage"
              value={formData.dosage || ''}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value || null })}
              placeholder="Ex: 2000 UI/dia"
            />
            <p className="text-xs text-muted-foreground">
              Quantidade recomendada (se aplicável)
            </p>
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
