'use client'

/**
 * Agent Form Component
 * Form for creating/editing health agents
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, BookOpen, Lock, Unlock } from 'lucide-react'

interface AgentFormProps {
  agent?: any | null
  onSuccess: () => void
  onCancel: () => void
}

export function AgentForm({ agent, onSuccess, onCancel }: AgentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Array<{ category: string; label: string; count: number }>>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [formData, setFormData] = useState({
    agentKey: '',
    name: '',
    title: '',
    description: '',
    color: 'blue',
    icon: 'bot',
    systemPrompt: '',
    analysisPrompt: '',
    modelName: 'gemini-2.5-flash',
    temperature: 0.7,
    maxOutputTokens: 8000,
    isActive: true,
    requiresApproval: false,
    tags: '',
    knowledgeAccessType: 'full' as 'full' | 'restricted',
    allowedCategories: [] as string[],
    excludedArticleIds: [] as string[],
    includedArticleIds: [] as string[],
  })

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const response = await fetch('/api/admin/knowledge/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    if (agent) {
      setFormData({
        agentKey: agent.agentKey || '',
        name: agent.name || '',
        title: agent.title || '',
        description: agent.description || '',
        color: agent.color || 'blue',
        icon: agent.icon || 'bot',
        systemPrompt: agent.systemPrompt || '',
        analysisPrompt: agent.analysisPrompt || '',
        modelName: agent.modelName || 'gemini-2.5-flash',
        temperature: agent.modelConfig?.temperature || 0.7,
        maxOutputTokens: agent.modelConfig?.maxOutputTokens || 8000,
        isActive: agent.isActive !== undefined ? agent.isActive : true,
        requiresApproval: agent.requiresApproval || false,
        tags: agent.tags ? agent.tags.join(', ') : '',
        knowledgeAccessType: agent.knowledgeAccessType || 'full',
        allowedCategories: agent.allowedCategories || [],
        excludedArticleIds: agent.excludedArticleIds || [],
        includedArticleIds: agent.includedArticleIds || [],
      })
    }
  }, [agent])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategoryToggle = (category: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      allowedCategories: checked
        ? [...prev.allowedCategories, category]
        : prev.allowedCategories.filter((c) => c !== category),
    }))
  }

  const getTotalArticles = () => {
    if (formData.knowledgeAccessType === 'full') {
      return categories.reduce((sum, cat) => sum + cat.count, 0)
    }
    return categories
      .filter((cat) => formData.allowedCategories.includes(cat.category))
      .reduce((sum, cat) => sum + cat.count, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        agentKey: formData.agentKey.trim(),
        name: formData.name.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        color: formData.color,
        icon: formData.icon,
        systemPrompt: formData.systemPrompt.trim(),
        analysisPrompt: formData.analysisPrompt.trim(),
        modelName: formData.modelName,
        modelConfig: {
          temperature: parseFloat(formData.temperature.toString()),
          maxOutputTokens: parseInt(formData.maxOutputTokens.toString()),
        },
        isActive: formData.isActive,
        requiresApproval: formData.requiresApproval,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        knowledgeAccessType: formData.knowledgeAccessType,
        allowedCategories: formData.allowedCategories,
        excludedArticleIds: formData.excludedArticleIds,
        includedArticleIds: formData.includedArticleIds,
      }

      const url = agent
        ? `/api/admin/agents/${agent.id}`
        : '/api/admin/agents'

      const method = agent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar agente')
      }

      onSuccess()
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Erro ao salvar agente')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Informações Básicas</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="agentKey">Chave do Agente *</Label>
            <Input
              id="agentKey"
              placeholder="ex: integrativa"
              value={formData.agentKey}
              onChange={(e) => handleChange('agentKey', e.target.value)}
              required
              disabled={!!agent} // Can't change key after creation
            />
            <p className="text-xs text-muted-foreground">
              Identificador único (sem espaços)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="ex: Medicina Integrativa"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            placeholder="ex: Especialista em Medicina Integrativa e Longevidade"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição *</Label>
          <Textarea
            id="description"
            placeholder="Descrição detalhada do agente..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            rows={3}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <Select
              value={formData.color}
              onValueChange={(value) => handleChange('color', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Azul</SelectItem>
                <SelectItem value="green">Verde</SelectItem>
                <SelectItem value="purple">Roxo</SelectItem>
                <SelectItem value="orange">Laranja</SelectItem>
                <SelectItem value="red">Vermelho</SelectItem>
                <SelectItem value="pink">Rosa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Ícone</Label>
            <Input
              id="icon"
              placeholder="bot"
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Nome do ícone Lucide
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            placeholder="saúde, nutrição, hormonal (separado por vírgula)"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
          />
        </div>
      </div>

      {/* AI Configuration */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Configuração de IA</h3>

        <div className="space-y-2">
          <Label htmlFor="systemPrompt">System Prompt *</Label>
          <Textarea
            id="systemPrompt"
            placeholder="Você é um médico especialista em..."
            value={formData.systemPrompt}
            onChange={(e) => handleChange('systemPrompt', e.target.value)}
            required
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Define a personalidade e expertise do agente
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="analysisPrompt">Analysis Prompt *</Label>
          <Textarea
            id="analysisPrompt"
            placeholder="Analise os dados médicos fornecidos e..."
            value={formData.analysisPrompt}
            onChange={(e) => handleChange('analysisPrompt', e.target.value)}
            required
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Instruções específicas para análise de documentos
          </p>
        </div>
      </div>

      {/* Model Configuration */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Configuração do Modelo</h3>

        <div className="space-y-2">
          <Label htmlFor="modelName">Modelo</Label>
          <Select
            value={formData.modelName}
            onValueChange={(value) => handleChange('modelName', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
              <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</SelectItem>
              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={formData.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">0 = preciso, 2 = criativo</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxOutputTokens">Max Output Tokens</Label>
            <Input
              id="maxOutputTokens"
              type="number"
              step="100"
              min="1000"
              max="32000"
              value={formData.maxOutputTokens}
              onChange={(e) => handleChange('maxOutputTokens', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Knowledge Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Configuração de Conhecimento</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Defina quais artigos da base de conhecimento este agente pode acessar
        </p>

        {/* Access Type */}
        <RadioGroup
          value={formData.knowledgeAccessType}
          onValueChange={(value) => handleChange('knowledgeAccessType', value)}
        >
          <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="full" id="access-full" />
            <Label htmlFor="access-full" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Unlock className="h-4 w-4 text-green-600" />
                <span className="font-medium">Acesso Total</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Agente pode acessar toda a base de conhecimento ({categories.reduce((sum, cat) => sum + cat.count, 0)} artigos)
              </p>
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="restricted" id="access-restricted" />
            <Label htmlFor="access-restricted" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Acesso Restrito</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Agente acessa apenas categorias selecionadas
              </p>
            </Label>
          </div>
        </RadioGroup>

        {/* Categories Selection (only show if restricted) */}
        {formData.knowledgeAccessType === 'restricted' && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-base">Categorias Permitidas</Label>
              <span className="text-sm text-muted-foreground">
                {getTotalArticles()} artigos selecionados
              </span>
            </div>

            {isLoadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando categorias...
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria disponível. Adicione artigos à base de conhecimento primeiro.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {categories.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center space-x-2 p-3 border rounded-md hover:bg-background"
                  >
                    <Checkbox
                      id={`cat-${cat.category}`}
                      checked={formData.allowedCategories.includes(cat.category)}
                      onCheckedChange={(checked) =>
                        handleCategoryToggle(cat.category, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`cat-${cat.category}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{cat.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {cat.count} {cat.count === 1 ? 'artigo' : 'artigos'}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {formData.allowedCategories.length === 0 && !isLoadingCategories && categories.length > 0 && (
              <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
                ⚠️ Atenção: Nenhuma categoria selecionada. O agente não terá acesso a nenhum conhecimento.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Configurações</h3>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="isActive">Agente Ativo</Label>
            <p className="text-sm text-muted-foreground">
              Agente disponível para uso no sistema
            </p>
          </div>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="requiresApproval">Requer Aprovação</Label>
            <p className="text-sm text-muted-foreground">
              Análises precisam ser aprovadas antes de serem exibidas
            </p>
          </div>
          <Switch
            id="requiresApproval"
            checked={formData.requiresApproval}
            onCheckedChange={(checked) => handleChange('requiresApproval', checked)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>Salvar Agente</>
          )}
        </Button>
      </div>
    </form>
  )
}
