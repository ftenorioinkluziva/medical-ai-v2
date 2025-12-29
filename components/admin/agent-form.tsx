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
import { Loader2, BookOpen, Lock, Unlock, Sparkles, XCircle, CheckCircle2 } from 'lucide-react'

interface AgentFormProps {
  agent?: any | null
  onSuccess: () => void
  onCancel: () => void
}

export function AgentForm({ agent, onSuccess, onCancel }: AgentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authors, setAuthors] = useState<Array<{ author: string; count: number }>>([])
  const [categories, setCategories] = useState<Array<{ category: string; label: string; count: number }>>([])
  const [subcategories, setSubcategories] = useState<Array<{ subcategory: string; count: number }>>([])
  const [isLoadingFilters, setIsLoadingFilters] = useState(false)

  // Prompt Generation States
  const [isGeneratingSystemPrompt, setIsGeneratingSystemPrompt] = useState(false)
  const [isGeneratingAnalysisPrompt, setIsGeneratingAnalysisPrompt] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [generateStats, setGenerateStats] = useState<{
    articlesAnalyzed?: number
    processingTimeMs?: number
    categoriesIncluded?: string[]
  } | null>(null)
  // Model limits configuration (from official Gemini API docs)
  const modelLimits: Record<string, { maxOutputTokens: number; contextWindow: string; description: string }> = {
    // Gemini 3 Series
    'gemini-3-pro-preview': { maxOutputTokens: 65536, contextWindow: '1M', description: 'Melhor modelo disponível' },

    // Gemini 2.5 Series
    'gemini-2.5-flash': { maxOutputTokens: 65536, contextWindow: '1M', description: 'Rápido e econômico' },
    'gemini-2.5-flash-lite': { maxOutputTokens: 65536, contextWindow: '1M', description: 'Mais rápido que Flash' },
    'gemini-2.5-pro': { maxOutputTokens: 65536, contextWindow: '1M', description: 'Mais capaz que Flash' },

    // Gemini 2.0 Series
    'gemini-2.0-flash': { maxOutputTokens: 8192, contextWindow: '1M', description: 'Alternativa estável' },

    // Gemini 1.5 Series
    'gemini-1.5-flash': { maxOutputTokens: 8192, contextWindow: '1M', description: 'Geração anterior' },
    'gemini-1.5-pro': { maxOutputTokens: 8192, contextWindow: '2M', description: 'Context estendido' },
  }

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
    maxOutputTokens: 8192,
    topP: undefined as number | undefined,
    topK: undefined as number | undefined,
    presencePenalty: 0,
    frequencyPenalty: 0,
    isActive: true,
    requiresApproval: false,
    tags: '',
    knowledgeAccessType: 'full' as 'full' | 'restricted',
    allowedAuthors: [] as string[],
    allowedCategories: [] as string[],
    allowedSubcategories: [] as string[],
    excludedArticleIds: [] as string[],
    includedArticleIds: [] as string[],
  })

  // Load filters (authors, categories, subcategories) on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        setIsLoadingFilters(true)

        // Load all filters in parallel
        const [authorsRes, categoriesRes, subcategoriesRes] = await Promise.all([
          fetch('/api/admin/knowledge/authors'),
          fetch('/api/admin/knowledge/categories'),
          fetch('/api/admin/knowledge/subcategories'),
        ])

        if (authorsRes.ok) {
          const data = await authorsRes.json()
          setAuthors(data.authors || [])
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data.categories || [])
        }

        if (subcategoriesRes.ok) {
          const data = await subcategoriesRes.json()
          setSubcategories(data.subcategories || [])
        }
      } catch (error) {
        console.error('Error loading filters:', error)
      } finally {
        setIsLoadingFilters(false)
      }
    }

    loadFilters()
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
        maxOutputTokens: agent.modelConfig?.maxOutputTokens || 8192,
        topP: agent.modelConfig?.topP,
        topK: agent.modelConfig?.topK,
        presencePenalty: agent.modelConfig?.presencePenalty || 0,
        frequencyPenalty: agent.modelConfig?.frequencyPenalty || 0,
        isActive: agent.isActive !== undefined ? agent.isActive : true,
        requiresApproval: agent.requiresApproval || false,
        tags: agent.tags ? agent.tags.join(', ') : '',
        knowledgeAccessType: agent.knowledgeAccessType || 'full',
        allowedAuthors: agent.allowedAuthors || [],
        allowedCategories: agent.allowedCategories || [],
        allowedSubcategories: agent.allowedSubcategories || [],
        excludedArticleIds: agent.excludedArticleIds || [],
        includedArticleIds: agent.includedArticleIds || [],
      })
    }
  }, [agent])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAuthorToggle = (author: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      allowedAuthors: checked
        ? [...prev.allowedAuthors, author]
        : prev.allowedAuthors.filter((a) => a !== author),
    }))
  }

  const handleCategoryToggle = (category: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      allowedCategories: checked
        ? [...prev.allowedCategories, category]
        : prev.allowedCategories.filter((c) => c !== category),
    }))
  }

  const handleSubcategoryToggle = (subcategory: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      allowedSubcategories: checked
        ? [...prev.allowedSubcategories, subcategory]
        : prev.allowedSubcategories.filter((s) => s !== subcategory),
    }))
  }

  // Generate System Prompt with AI
  const handleGenerateSystemPrompt = async () => {
    // Validar campos obrigatórios
    if (!formData.name || !formData.title || !formData.description) {
      setGenerateError('Preencha Nome, Título e Descrição antes de gerar o prompt')
      return
    }

    // Validar configuração de conhecimento
    if (
      formData.knowledgeAccessType === 'restricted' &&
      formData.allowedAuthors.length === 0 &&
      formData.allowedCategories.length === 0 &&
      formData.allowedSubcategories.length === 0
    ) {
      setGenerateError('Configure pelo menos um filtro de conhecimento (autor, categoria ou subcategoria)')
      return
    }

    setIsGeneratingSystemPrompt(true)
    setGenerateError(null)
    setGenerateStats(null)

    try {
      const response = await fetch('/api/admin/agents/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'system',
          agentData: {
            name: formData.name,
            title: formData.title,
            description: formData.description,
            knowledgeAccessType: formData.knowledgeAccessType,
            allowedAuthors: formData.allowedAuthors,
            allowedCategories: formData.allowedCategories,
            allowedSubcategories: formData.allowedSubcategories,
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        handleChange('systemPrompt', result.prompt)
        setGenerateStats(result.stats)
        // Auto-clear stats after 10 seconds
        setTimeout(() => setGenerateStats(null), 10000)
      } else {
        setGenerateError(result.error || 'Erro ao gerar prompt')
      }
    } catch (error) {
      setGenerateError(
        error instanceof Error ? error.message : 'Erro ao gerar prompt'
      )
    } finally {
      setIsGeneratingSystemPrompt(false)
    }
  }

  // Generate Analysis Prompt with AI
  const handleGenerateAnalysisPrompt = async () => {
    // Validar campos obrigatórios
    if (!formData.name || !formData.title || !formData.description) {
      setGenerateError('Preencha Nome, Título e Descrição antes de gerar o prompt')
      return
    }

    // Validar configuração de conhecimento
    if (
      formData.knowledgeAccessType === 'restricted' &&
      formData.allowedAuthors.length === 0 &&
      formData.allowedCategories.length === 0 &&
      formData.allowedSubcategories.length === 0
    ) {
      setGenerateError('Configure pelo menos um filtro de conhecimento (autor, categoria ou subcategoria)')
      return
    }

    setIsGeneratingAnalysisPrompt(true)
    setGenerateError(null)
    setGenerateStats(null)

    try {
      const response = await fetch('/api/admin/agents/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'analysis',
          agentData: {
            name: formData.name,
            title: formData.title,
            description: formData.description,
            knowledgeAccessType: formData.knowledgeAccessType,
            allowedAuthors: formData.allowedAuthors,
            allowedCategories: formData.allowedCategories,
            allowedSubcategories: formData.allowedSubcategories,
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        handleChange('analysisPrompt', result.prompt)
        setGenerateStats(result.stats)
        // Auto-clear stats after 10 seconds
        setTimeout(() => setGenerateStats(null), 10000)
      } else {
        setGenerateError(result.error || 'Erro ao gerar prompt')
      }
    } catch (error) {
      setGenerateError(
        error instanceof Error ? error.message : 'Erro ao gerar prompt'
      )
    } finally {
      setIsGeneratingAnalysisPrompt(false)
    }
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
          ...(formData.topP !== undefined && { topP: parseFloat(formData.topP.toString()) }),
          ...(formData.topK !== undefined && { topK: parseInt(formData.topK.toString()) }),
          ...(formData.presencePenalty !== 0 && { presencePenalty: parseFloat(formData.presencePenalty.toString()) }),
          ...(formData.frequencyPenalty !== 0 && { frequencyPenalty: parseFloat(formData.frequencyPenalty.toString()) }),
        },
        isActive: formData.isActive,
        requiresApproval: formData.requiresApproval,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        knowledgeAccessType: formData.knowledgeAccessType,
        allowedAuthors: formData.allowedAuthors,
        allowedCategories: formData.allowedCategories,
        allowedSubcategories: formData.allowedSubcategories,
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

          {/* Generate System Prompt Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateSystemPrompt}
            disabled={
              isGeneratingSystemPrompt ||
              isGeneratingAnalysisPrompt ||
              isSubmitting ||
              !formData.name ||
              !formData.title ||
              !formData.description ||
              (formData.knowledgeAccessType === 'restricted' &&
                formData.allowedAuthors.length === 0 &&
                formData.allowedCategories.length === 0 &&
                formData.allowedSubcategories.length === 0)
            }
            className="w-full"
          >
            {isGeneratingSystemPrompt ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando System Prompt com IA...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar System Prompt com IA
              </>
            )}
          </Button>

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

          {/* Generate Analysis Prompt Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateAnalysisPrompt}
            disabled={
              isGeneratingSystemPrompt ||
              isGeneratingAnalysisPrompt ||
              isSubmitting ||
              !formData.name ||
              !formData.title ||
              !formData.description ||
              (formData.knowledgeAccessType === 'restricted' &&
                formData.allowedAuthors.length === 0 &&
                formData.allowedCategories.length === 0 &&
                formData.allowedSubcategories.length === 0)
            }
            className="w-full"
          >
            {isGeneratingAnalysisPrompt ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Analysis Prompt com IA...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Analysis Prompt com IA
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Instruções específicas para análise de documentos
          </p>
        </div>

        {/* Generation Feedback */}
        {(generateError || generateStats) && (
          <div
            className={`p-4 rounded-lg border ${
              generateError
                ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                : 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
            }`}
          >
            {generateError ? (
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Erro ao gerar prompt
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {generateError}
                  </p>
                </div>
              </div>
            ) : generateStats ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Prompt gerado com sucesso!
                  </p>
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1 space-y-0.5">
                    <p>• {generateStats.articlesAnalyzed} artigos analisados</p>
                    <p>
                      • Tempo:{' '}
                      {typeof generateStats.processingTimeMs === 'number' ? (
                        `${(generateStats.processingTimeMs / 1000).toFixed(1)}s`
                      ) : (
                        'N/A'
                      )}
                    </p>
                    {generateStats.categoriesIncluded &&
                      generateStats.categoriesIncluded.length > 0 && (
                        <p>• Categorias: {generateStats.categoriesIncluded.join(', ')}</p>
                      )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Model Configuration */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Configuração do Modelo</h3>

        <div className="space-y-2">
          <Label htmlFor="modelName">Modelo *</Label>
          <Select
            value={formData.modelName}
            onValueChange={(value) => handleChange('modelName', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini-3-pro-preview">
                🆕 Gemini 3 Pro Preview - 1M context, 65K output
              </SelectItem>
              <SelectItem value="gemini-2.5-flash">
                ⭐ Gemini 2.5 Flash - 1M context, 65K output (recomendado)
              </SelectItem>
              <SelectItem value="gemini-2.5-flash-lite">
                ⚡ Gemini 2.5 Flash Lite - 1M context, 65K output (mais rápido)
              </SelectItem>
              <SelectItem value="gemini-2.5-pro">
                💎 Gemini 2.5 Pro - 1M context, 65K output (mais capaz)
              </SelectItem>
              <SelectItem value="gemini-2.0-flash">
                Gemini 2.0 Flash - 1M context, 8K output
              </SelectItem>
              <SelectItem value="gemini-1.5-flash">
                Gemini 1.5 Flash - 1M context, 8K output
              </SelectItem>
              <SelectItem value="gemini-1.5-pro">
                Gemini 1.5 Pro - 2M context, 8K output
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            🆕 Gemini 3: Mais recente | ⭐ 2.5 Flash: Melhor custo-benefício | 💎 2.5 Pro: Mais capaz
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="temperature">
              Temperature (Criatividade)
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={formData.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            />
            <div className="text-xs space-y-1">
              <p className="font-medium text-muted-foreground">
                Controla a aleatoriedade e criatividade das respostas:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                <li><strong>0.0-0.3:</strong> Muito preciso, factual, consistente</li>
                <li><strong>0.4-0.7:</strong> Balanceado (recomendado para análises)</li>
                <li><strong>0.8-1.2:</strong> Mais criativo, variado</li>
                <li><strong>1.3-2.0:</strong> Muito criativo, menos previsível</li>
              </ul>
              <p className="text-amber-600 mt-1">
                💡 Para análises médicas: use 0.5-0.7 (preciso mas não robótico)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxOutputTokens">
              Max Output Tokens (Tamanho da Resposta)
            </Label>
            <Input
              id="maxOutputTokens"
              type="number"
              step="1024"
              min="1024"
              max={modelLimits[formData.modelName]?.maxOutputTokens || 8192}
              value={formData.maxOutputTokens}
              onChange={(e) => handleChange('maxOutputTokens', parseInt(e.target.value))}
            />
            <div className="text-xs space-y-1">
              <p className="font-medium text-muted-foreground">
                Limite máximo de tokens (palavras) na resposta:
              </p>
              <p className="text-muted-foreground">
                Máximo para {formData.modelName}: <strong>{(modelLimits[formData.modelName]?.maxOutputTokens || 8192).toLocaleString()} tokens</strong>
                {formData.modelName.includes('2.5') || formData.modelName.includes('3') ? ' (~49K palavras)' : ' (~6K palavras)'}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                <li><strong>2048-4096:</strong> Análise resumida</li>
                <li><strong>4096-8192:</strong> Análise detalhada (recomendado)</li>
                <li><strong>8192+:</strong> Análise muito extensa</li>
              </ul>
              <p className="text-amber-600 mt-1">
                💡 Use 8192 para análises completas com recomendações detalhadas
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Parameters */}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Parâmetros Avançados (Opcional)</h4>
            <p className="text-xs text-muted-foreground">
              Configure parâmetros avançados de amostragem e controle de repetição.
              Deixe em branco para usar valores padrão do modelo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="topP">
                Top P - Nucleus Sampling (Diversidade)
              </Label>
              <Input
                id="topP"
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={formData.topP || ''}
                onChange={(e) => handleChange('topP', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Padrão: automático"
              />
              <div className="text-xs space-y-1">
                <p className="font-medium text-muted-foreground">
                  Controla a diversidade considerando probabilidade acumulada:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                  <li><strong>0.1-0.5:</strong> Respostas muito focadas e previsíveis</li>
                  <li><strong>0.6-0.9:</strong> Balanceado (comum para uso geral)</li>
                  <li><strong>0.9-1.0:</strong> Mais diversidade e criatividade</li>
                </ul>
                <p className="text-blue-600 mt-1">
                  💡 Deixe vazio para usar padrão. Não combine com Temperature alta.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topK">
                Top K (Limitador de Opções)
              </Label>
              <Input
                id="topK"
                type="number"
                step="1"
                min="1"
                max="40"
                value={formData.topK || ''}
                onChange={(e) => handleChange('topK', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Padrão: automático"
              />
              <div className="text-xs space-y-1">
                <p className="font-medium text-muted-foreground">
                  Limita quantas palavras candidatas o modelo considera:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                  <li><strong>1-10:</strong> Muito restrito, mais previsível</li>
                  <li><strong>20-40:</strong> Balanceado (permite variação)</li>
                  <li><strong>Vazio:</strong> Sem limite (recomendado)</li>
                </ul>
                <p className="text-blue-600 mt-1">
                  💡 Raramente necessário ajustar. Use apenas para respostas muito focadas.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="presencePenalty">
                Presence Penalty (Anti-Repetição de Conceitos)
              </Label>
              <Input
                id="presencePenalty"
                type="number"
                step="0.1"
                min="-2"
                max="2"
                value={formData.presencePenalty}
                onChange={(e) => handleChange('presencePenalty', parseFloat(e.target.value) || 0)}
              />
              <div className="text-xs space-y-1">
                <p className="font-medium text-muted-foreground">
                  Penaliza palavras/conceitos que já apareceram no texto:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                  <li><strong>0.0:</strong> Sem penalização (padrão)</li>
                  <li><strong>0.1-0.5:</strong> Leve redução de repetições</li>
                  <li><strong>0.6-1.5:</strong> Incentiva variedade de termos</li>
                  <li><strong>1.6-2.0:</strong> Forte diversificação (pode perder contexto)</li>
                  <li><strong>Negativo:</strong> Incentiva repetição (raramente útil)</li>
                </ul>
                <p className="text-amber-600 mt-1">
                  💡 Use 0.3-0.6 se análises repetem muito os mesmos termos médicos
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequencyPenalty">
                Frequency Penalty (Anti-Repetição de Palavras)
              </Label>
              <Input
                id="frequencyPenalty"
                type="number"
                step="0.1"
                min="-2"
                max="2"
                value={formData.frequencyPenalty}
                onChange={(e) => handleChange('frequencyPenalty', parseFloat(e.target.value) || 0)}
              />
              <div className="text-xs space-y-1">
                <p className="font-medium text-muted-foreground">
                  Penaliza palavras baseado em QUANTAS vezes aparecem:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                  <li><strong>0.0:</strong> Sem penalização (padrão)</li>
                  <li><strong>0.1-0.5:</strong> Reduz repetições excessivas</li>
                  <li><strong>0.6-1.5:</strong> Força vocabulário mais variado</li>
                  <li><strong>1.6-2.0:</strong> Máxima variação (pode prejudicar clareza)</li>
                </ul>
                <p className="text-amber-600 mt-1">
                  💡 Use 0.2-0.4 se recomendações ficam muito repetitivas
                </p>
                <p className="text-blue-600 mt-1">
                  ℹ️ Diferença do Presence: este conta FREQUÊNCIA, Presence apenas SE apareceu
                </p>
              </div>
            </div>
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
                Agente acessa apenas filtros selecionados (autor, categoria, subcategoria)
              </p>
            </Label>
          </div>
        </RadioGroup>

        {/* Filters Selection (only show if restricted) */}
        {formData.knowledgeAccessType === 'restricted' && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Selecione um ou mais filtros em cascata para definir quais artigos o agente pode acessar.
              Quanto mais filtros selecionados, mais restrito será o conhecimento do agente.
            </p>

            {isLoadingFilters ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando filtros...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Authors Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">1. Autores ({formData.allowedAuthors.length} selecionados)</Label>
                    {authors.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {authors.length} autores disponíveis
                      </span>
                    )}
                  </div>

                  {authors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum autor disponível. Adicione artigos com autores à base de conhecimento.
                    </p>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-3">
                      {authors.map((author) => (
                        <div
                          key={author.author}
                          className="flex items-center space-x-2 p-2 border rounded-md hover:bg-background text-sm"
                        >
                          <Checkbox
                            id={`author-${author.author}`}
                            checked={formData.allowedAuthors.includes(author.author)}
                            onCheckedChange={(checked) =>
                              handleAuthorToggle(author.author, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`author-${author.author}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium truncate">{author.author}</div>
                            <div className="text-xs text-muted-foreground">
                              {author.count} {author.count === 1 ? 'artigo' : 'artigos'}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Categories Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">2. Categorias ({formData.allowedCategories.length} selecionadas)</Label>
                    {categories.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {categories.length} categorias disponíveis
                      </span>
                    )}
                  </div>

                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma categoria disponível. Adicione artigos à base de conhecimento.
                    </p>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-3">
                      {categories.map((cat) => (
                        <div
                          key={cat.category}
                          className="flex items-center space-x-2 p-2 border rounded-md hover:bg-background text-sm"
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
                </div>

                {/* Subcategories Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">3. Subcategorias ({formData.allowedSubcategories.length} selecionadas)</Label>
                    {subcategories.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {subcategories.length} subcategorias disponíveis
                      </span>
                    )}
                  </div>

                  {subcategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma subcategoria disponível. Adicione artigos com subcategorias à base de conhecimento.
                    </p>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-3">
                      {subcategories.map((sub) => (
                        <div
                          key={sub.subcategory}
                          className="flex items-center space-x-2 p-2 border rounded-md hover:bg-background text-sm"
                        >
                          <Checkbox
                            id={`sub-${sub.subcategory}`}
                            checked={formData.allowedSubcategories.includes(sub.subcategory)}
                            onCheckedChange={(checked) =>
                              handleSubcategoryToggle(sub.subcategory, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`sub-${sub.subcategory}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium truncate">{sub.subcategory}</div>
                            <div className="text-xs text-muted-foreground">
                              {sub.count} {sub.count === 1 ? 'artigo' : 'artigos'}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Warning if no filters selected */}
                {formData.allowedAuthors.length === 0 &&
                  formData.allowedCategories.length === 0 &&
                  formData.allowedSubcategories.length === 0 &&
                  !isLoadingFilters && (
                    <p className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400 p-3 rounded-md">
                      ⚠️ Atenção: Nenhum filtro selecionado. O agente não terá acesso a nenhum conhecimento.
                    </p>
                  )}
              </div>
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
