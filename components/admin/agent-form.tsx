'use client'

/**
 * Agent Form Component
 * Form for creating/editing health agents
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  const [isFormReady, setIsFormReady] = useState(false)
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
  const [knowledgeAnalysis, setKnowledgeAnalysis] = useState<{
    recommendedMaxChunks: number
    recommendedMaxCharsPerChunk: number
    avgChunksPerArticle: number
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
    useThinkingMode: false,
    analysisRole: 'none' as 'foundation' | 'specialized' | 'none',
    analysisOrder: null as number | null,
    allowedRoles: ['patient', 'doctor', 'admin'] as ('patient' | 'doctor' | 'admin')[],
    knowledgeAccessType: 'full' as 'full' | 'restricted',
    allowedAuthors: [] as string[],
    allowedCategories: [] as string[],
    allowedSubcategories: [] as string[],
    excludedArticleIds: [] as string[],
    includedArticleIds: [] as string[],
    // Product Generator fields
    agentType: 'analysis' as 'analysis' | 'product_generator',
    productType: null as 'weekly_plan' | 'recommendations' | null,
    generatorKey: '',
    outputSchema: '',
    ragConfig: {
      enabled: false,
      keywords: [] as string[],
      maxChunks: 3,
      maxCharsPerChunk: 1200,
      restrictedPriority: 0.7, // Default: 70% from restricted articles, 30% from general
    },
    executionOrder: null as number | null,
  })

  // Load filters and knowledge analysis on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingFilters(true)

        // Load all data in parallel
        const [authorsRes, categoriesRes, subcategoriesRes, knowledgeAnalysisRes] = await Promise.all([
          fetch('/api/admin/knowledge/authors'),
          fetch('/api/admin/knowledge/categories'),
          fetch('/api/admin/knowledge/subcategories'),
          fetch('/api/admin/knowledge/analyze'),
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

        // Load knowledge base analysis for intelligent defaults
        if (knowledgeAnalysisRes.ok) {
          const data = await knowledgeAnalysisRes.json()
          if (data.success) {
            // Calculate average chunk size from distribution
            const avgChunkLength = data.distribution.length > 0
              ? Math.round(
                data.distribution.reduce((sum: number, d: any) => sum + d.avg_chunk_length, 0) /
                data.distribution.length
              )
              : 1200

            setKnowledgeAnalysis({
              recommendedMaxChunks: data.recommendations.balanced,
              recommendedMaxCharsPerChunk: avgChunkLength,
              avgChunksPerArticle: data.stats.avgChunksPerArticle,
            })

            // Update form defaults only if creating new agent (not editing)
            if (!agent) {
              setFormData(prev => ({
                ...prev,
                ragConfig: {
                  ...prev.ragConfig,
                  maxChunks: data.recommendations.balanced,
                  maxCharsPerChunk: avgChunkLength,
                }
              }))
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoadingFilters(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    // Reset ready state when agent changes
    setIsFormReady(false)

    if (agent) {
      // Ensure modelConfig has default values if missing
      const modelConfig = agent.modelConfig || {}

      const newFormData = {
        agentKey: agent.agentKey || '',
        name: agent.name || '',
        title: agent.title || '',
        description: agent.description || '',
        color: agent.color || 'blue',
        icon: agent.icon || 'bot',
        systemPrompt: agent.systemPrompt || '',
        analysisPrompt: agent.analysisPrompt || '',
        modelName: agent.modelName || 'gemini-2.5-flash',
        temperature: modelConfig.temperature !== undefined ? modelConfig.temperature : 0.7,
        maxOutputTokens: modelConfig.maxOutputTokens !== undefined ? modelConfig.maxOutputTokens : 8192,
        topP: modelConfig.topP,
        topK: modelConfig.topK,
        presencePenalty: modelConfig.presencePenalty !== undefined ? modelConfig.presencePenalty : 0,
        frequencyPenalty: modelConfig.frequencyPenalty !== undefined ? modelConfig.frequencyPenalty : 0,
        isActive: agent.isActive !== undefined ? agent.isActive : true,
        requiresApproval: agent.requiresApproval !== undefined ? agent.requiresApproval : false,
        tags: Array.isArray(agent.tags) ? agent.tags.join(', ') : '',
        useThinkingMode: agent.useThinkingMode !== undefined ? agent.useThinkingMode : false,
        analysisRole: agent.analysisRole || 'none',
        analysisOrder: agent.analysisOrder !== undefined && agent.analysisOrder !== null ? agent.analysisOrder : null,
        allowedRoles: Array.isArray(agent.allowedRoles) && agent.allowedRoles.length > 0 ? agent.allowedRoles : ['patient', 'doctor', 'admin'],
        knowledgeAccessType: agent.knowledgeAccessType || 'full',
        allowedAuthors: Array.isArray(agent.allowedAuthors) ? agent.allowedAuthors : [],
        allowedCategories: Array.isArray(agent.allowedCategories) ? agent.allowedCategories : [],
        allowedSubcategories: Array.isArray(agent.allowedSubcategories) ? agent.allowedSubcategories : [],
        excludedArticleIds: Array.isArray(agent.excludedArticleIds) ? agent.excludedArticleIds : [],
        includedArticleIds: Array.isArray(agent.includedArticleIds) ? agent.includedArticleIds : [],
        // Product Generator fields
        agentType: agent.agentType || 'analysis',
        productType: agent.productType || null,
        generatorKey: agent.generatorKey || '',
        outputSchema: agent.outputSchema ? JSON.stringify(agent.outputSchema, null, 2) : '',
        ragConfig: agent.ragConfig ? {
          enabled: agent.ragConfig.enabled || false,
          keywords: agent.ragConfig.keywords || [],
          maxChunks: agent.ragConfig.maxChunks || 3,
          maxCharsPerChunk: agent.ragConfig.maxCharsPerChunk || 1200,
          restrictedPriority: agent.ragConfig.restrictedPriority !== undefined ? agent.ragConfig.restrictedPriority : 0.7,
        } : {
          enabled: false,
          keywords: [],
          maxChunks: 3,
          maxCharsPerChunk: 1200,
          restrictedPriority: 0.7,
        },
        executionOrder: agent.executionOrder !== undefined && agent.executionOrder !== null ? agent.executionOrder : null,
      }

      setFormData(newFormData)

      // Mark form as ready after a small delay to ensure state is updated
      setTimeout(() => {
        setIsFormReady(true)
      }, 50)
    } else {
      // New agent form
      setIsFormReady(true)
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
      // Validate and parse outputSchema for product generators
      let parsedOutputSchema = null
      if (formData.agentType === 'product_generator' && formData.outputSchema.trim()) {
        try {
          parsedOutputSchema = JSON.parse(formData.outputSchema.trim())
        } catch (jsonError) {
          alert('Erro no JSON Schema: ' + (jsonError instanceof Error ? jsonError.message : 'JSON inválido'))
          setIsSubmitting(false)
          return
        }
      }

      const payload: any = {
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
        useThinkingMode: formData.useThinkingMode,
        analysisRole: formData.analysisRole,
        analysisOrder: formData.analysisOrder,
        allowedRoles: formData.allowedRoles,
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
        // Product Generator fields
        agentType: formData.agentType,
        productType: formData.productType,
        generatorKey: formData.generatorKey.trim() || null,
        outputSchema: parsedOutputSchema,
        ragConfig: formData.agentType === 'product_generator' ? formData.ragConfig : null,
        executionOrder: formData.executionOrder,
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
        const errorData = await response.json()
        console.error('❌ Server error:', errorData)
        throw new Error(errorData.error || 'Erro ao salvar agente')
      }

      const result = await response.json()

      onSuccess()
    } catch (error) {
      console.error('❌ Error submitting form:', error)
      alert('Erro ao salvar agente: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while form is not ready
  if (!isFormReady && agent) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Carregando dados do agente...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Informações Básicas</h3>

        {/* Agent Type Selector */}
        <div className="space-y-2">
          <Label htmlFor="agentType">Tipo de Agente *</Label>
          <Select
            value={formData.agentType}
            onValueChange={(value) => handleChange('agentType', value as 'analysis' | 'product_generator')}
            disabled={!!agent} // Can't change type after creation
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="analysis">Agente de Análise</SelectItem>
              <SelectItem value="product_generator">Gerador de Produtos</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {formData.agentType === 'analysis'
              ? 'Agentes que analisam documentos médicos e geram insights'
              : 'Agentes que geram produtos como planos semanais e recomendações'}
          </p>
        </div>

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

      {/* Product Generator Configuration */}
      {formData.agentType === 'product_generator' && (
        <div className="space-y-4 p-4 border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-purple-50 dark:bg-purple-950/30">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">⚙️</span>
            Configuração de Gerador de Produtos
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="productType">Tipo de Produto *</Label>
              <Select
                value={formData.productType || ''}
                onValueChange={(value) => handleChange('productType', value as 'weekly_plan' | 'recommendations')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly_plan">Plano Semanal</SelectItem>
                  <SelectItem value="recommendations">Recomendações</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define o formato do produto gerado
              </p>
            </div>

            {/* Generator Key */}
            <div className="space-y-2">
              <Label htmlFor="generatorKey">Chave do Gerador *</Label>
              <Input
                id="generatorKey"
                placeholder="ex: supplementation, shopping, meals"
                value={formData.generatorKey}
                onChange={(e) => handleChange('generatorKey', e.target.value)}
                disabled={!!agent} // Can't change key after creation
              />
              <p className="text-xs text-muted-foreground">
                Identificador único do gerador
              </p>
            </div>
          </div>

          {/* Execution Order */}
          <div className="space-y-2">
            <Label htmlFor="executionOrder">Ordem de Execução</Label>
            <Input
              id="executionOrder"
              type="number"
              min="1"
              placeholder="Ex: 1, 2, 3..."
              value={formData.executionOrder || ''}
              onChange={(e) => handleChange('executionOrder', e.target.value ? parseInt(e.target.value) : null)}
            />
            <p className="text-xs text-muted-foreground">
              Define a ordem de execução dos geradores (menor = executa primeiro)
            </p>
          </div>

          {/* Output Schema */}
          <div className="space-y-2">
            <Label htmlFor="outputSchema">JSON Schema (Estrutura de Saída) *</Label>
            <Textarea
              id="outputSchema"
              placeholder='{"type": "object", "properties": {...}}'
              value={formData.outputSchema}
              onChange={(e) => handleChange('outputSchema', e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Define a estrutura do objeto retornado pelo gerador (formato JSON Schema)
            </p>
          </div>

          {/* RAG Configuration */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="ragEnabled" className="font-medium">
                  Ativar RAG (Base de Conhecimento)
                </Label>
                <Switch
                  id="ragEnabled"
                  checked={formData.ragConfig.enabled}
                  onCheckedChange={(checked) =>
                    handleChange('ragConfig', { ...formData.ragConfig, enabled: checked })
                  }
                />
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-xs text-purple-900 dark:text-purple-100">
                  <strong>Comportamento de Busca:</strong> Define <strong>COMO buscar</strong> conhecimento durante a geração.
                  Os artigos acessíveis são limitados pela "Configuração de Conhecimento" acima.
                  Aqui você controla quantos chunks buscar e seu tamanho máximo.
                </p>
              </div>
            </div>

            {formData.ragConfig.enabled && (
              <div className="space-y-4 pt-2">
                {/* Intelligent Defaults Info */}
                {knowledgeAnalysis && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-xs text-green-900 dark:text-green-100 flex items-start gap-2">
                      <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Valores Inteligentes:</strong> Os campos abaixo foram preenchidos automaticamente com base
                        na análise da sua base de conhecimento ({knowledgeAnalysis.recommendedMaxChunks} chunks balanceados
                        para ~{Math.floor(knowledgeAnalysis.recommendedMaxChunks / knowledgeAnalysis.avgChunksPerArticle)} artigos).
                        Você pode ajustar manualmente se necessário.
                      </span>
                    </p>
                  </div>
                )}

                {/* Keywords */}
                <div className="space-y-2">
                  <Label htmlFor="ragKeywords">Palavras-chave para Busca</Label>
                  <Input
                    id="ragKeywords"
                    placeholder="nutrição, suplementação, vitaminas (separado por vírgula)"
                    value={formData.ragConfig.keywords.join(', ')}
                    onChange={(e) =>
                      handleChange('ragConfig', {
                        ...formData.ragConfig,
                        keywords: e.target.value.split(',').map((k) => k.trim()).filter((k) => k.length > 0),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Termos usados para buscar artigos relevantes na base de conhecimento
                  </p>
                </div>

                {/* Max Chunks */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="ragMaxChunks">Máximo de Chunks</Label>
                      {knowledgeAnalysis && (
                        <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          ✓ Otimizado
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="ragMaxChunks"
                      type="number"
                      min="1"
                      max="500"
                      value={formData.ragConfig.maxChunks}
                      onChange={(e) =>
                        handleChange('ragConfig', {
                          ...formData.ragConfig,
                          maxChunks: parseInt(e.target.value) || 3,
                        })
                      }
                    />
                    {knowledgeAnalysis && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        📊 Recomendado: {knowledgeAnalysis.recommendedMaxChunks} chunks
                        (~{Math.floor(knowledgeAnalysis.recommendedMaxChunks / knowledgeAnalysis.avgChunksPerArticle)} artigos)
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Número de trechos de conhecimento a incluir
                    </p>
                  </div>

                  {/* Max Chars Per Chunk */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="ragMaxChars">Caracteres por Chunk</Label>
                      {knowledgeAnalysis && (
                        <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          ✓ Otimizado
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="ragMaxChars"
                      type="number"
                      min="500"
                      max="3000"
                      step="100"
                      value={formData.ragConfig.maxCharsPerChunk}
                      onChange={(e) =>
                        handleChange('ragConfig', {
                          ...formData.ragConfig,
                          maxCharsPerChunk: parseInt(e.target.value) || 1200,
                        })
                      }
                    />
                    {knowledgeAnalysis && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        📊 Recomendado: {knowledgeAnalysis.recommendedMaxCharsPerChunk} chars
                        (média da base)
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Tamanho máximo de cada trecho
                    </p>
                  </div>
                </div>

                {/* Restricted Priority */}
                {formData.knowledgeAccessType === 'restricted' && (
                  <div className="space-y-3 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ragRestrictedPriority" className="font-medium">
                        Prioridade de Artigos Restritos
                      </Label>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {Math.round(formData.ragConfig.restrictedPriority * 100)}%
                      </span>
                    </div>
                    <Input
                      id="ragRestrictedPriority"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={formData.ragConfig.restrictedPriority}
                      onChange={(e) =>
                        handleChange('ragConfig', {
                          ...formData.ragConfig,
                          restrictedPriority: parseFloat(e.target.value),
                        })
                      }
                      className="w-full cursor-pointer"
                    />
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                        <p className="font-semibold text-purple-600 dark:text-purple-400">
                          ~{Math.round(formData.ragConfig.maxChunks * formData.ragConfig.restrictedPriority)} chunks
                        </p>
                        <p className="text-muted-foreground">dos artigos restritos</p>
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          ~{Math.round(formData.ragConfig.maxChunks * (1 - formData.ragConfig.restrictedPriority))} chunks
                        </p>
                        <p className="text-muted-foreground">de toda a base</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• <strong>100%</strong> = Busca APENAS em artigos restritos (mais seguro)</p>
                      <p>• <strong>70%</strong> = 70% restritos + 30% gerais (balanceado) ⭐</p>
                      <p>• <strong>0%</strong> = Ignora completamente as restrições (mais inteligente)</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
            className={`p-4 rounded-lg border ${generateError
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

      {/* Analysis Workflow Configuration */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Configuração de Análise</h3>

        {/* Thinking Mode */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="useThinkingMode">Modo de Pensamento Estendido</Label>
            <p className="text-sm text-muted-foreground">
              Ativa raciocínio estendido para análises complexas (mais tokens, melhor qualidade)
            </p>
          </div>
          <Switch
            id="useThinkingMode"
            checked={formData.useThinkingMode || false}
            onCheckedChange={(checked) =>
              handleChange('useThinkingMode', checked)
            }
          />
        </div>

        {/* Analysis Role */}
        <div className="space-y-2">
          <Label htmlFor="analysisRole">Papel na Análise Completa</Label>
          <Select
            value={formData.analysisRole || 'none'}
            onValueChange={(value) =>
              handleChange('analysisRole', value as 'foundation' | 'specialized' | 'none')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o papel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Não participa da análise completa</SelectItem>
              <SelectItem value="foundation">Fundação (executa primeiro, fornece contexto base)</SelectItem>
              <SelectItem value="specialized">Especializado (executa em paralelo após fundação)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Define como este agente participa do workflow de análise completa
          </p>
        </div>

        {/* Analysis Order (conditional) */}
        {formData.analysisRole && formData.analysisRole !== 'none' && (
          <div className="space-y-2">
            <Label htmlFor="analysisOrder">Ordem de Execução</Label>
            <Input
              id="analysisOrder"
              type="number"
              min="1"
              value={formData.analysisOrder || ''}
              onChange={(e) =>
                handleChange(
                  'analysisOrder',
                  e.target.value === '0'
                    ? 0
                    : parseInt(e.target.value, 10) || null
                )
              }
              placeholder="Ex: 1, 2, 3..."
            />
            <p className="text-xs text-muted-foreground">
              Ordem de execução dentro do grupo (menor = executa antes)
            </p>
          </div>
        )}
      </div>

      {/* Knowledge Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Configuração de Conhecimento</h3>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Permissões de Acesso:</strong> Define <strong>QUAIS artigos</strong> da base de conhecimento este agente pode acessar.
            Esta configuração funciona como um filtro de permissões.
          </p>
          {formData.agentType === 'product_generator' && (
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
              💡 <strong>Para Geradores de Produtos:</strong> Esta configuração também se aplica ao RAG (se habilitado na seção abaixo).
              Os artigos acessíveis aqui limitam o que o RAG pode buscar.
            </p>
          )}
        </div>

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
                    <div className="flex gap-2">
                      {authors.length > 0 && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleChange('allowedAuthors', authors.map(a => a.author))}
                            className="h-7 text-xs"
                          >
                            Selecionar todos
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleChange('allowedAuthors', [])}
                            className="h-7 text-xs"
                          >
                            Limpar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {authors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum autor disponível. Adicione artigos com autores à base de conhecimento.
                    </p>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-1">
                        {authors.map((author) => (
                          <div
                            key={author.author}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-muted"
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
                              className="flex-1 cursor-pointer flex items-center justify-between"
                            >
                              <span className="font-medium">{author.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {author.count} {author.count === 1 ? 'artigo' : 'artigos'}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.allowedAuthors.length > 0 && (
                        <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-md">
                          {formData.allowedAuthors.map((author) => (
                            <span
                              key={author}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                            >
                              {author}
                              <button
                                type="button"
                                onClick={() => handleAuthorToggle(author, false)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Categories Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">2. Categorias ({formData.allowedCategories.length} selecionadas)</Label>
                    <div className="flex gap-2">
                      {categories.length > 0 && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleChange('allowedCategories', categories.map(c => c.category))}
                            className="h-7 text-xs"
                          >
                            Selecionar todas
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleChange('allowedCategories', [])}
                            className="h-7 text-xs"
                          >
                            Limpar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma categoria disponível. Adicione artigos à base de conhecimento.
                    </p>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-1">
                        {categories.map((cat) => (
                          <div
                            key={cat.category}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-muted"
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
                              className="flex-1 cursor-pointer flex items-center justify-between"
                            >
                              <span className="font-medium">{cat.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {cat.count} {cat.count === 1 ? 'artigo' : 'artigos'}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.allowedCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-md">
                          {formData.allowedCategories.map((category) => {
                            const cat = categories.find(c => c.category === category)
                            return (
                              <span
                                key={category}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                              >
                                {cat?.label || category}
                                <button
                                  type="button"
                                  onClick={() => handleCategoryToggle(category, false)}
                                  className="hover:bg-primary/20 rounded-full p-0.5"
                                >
                                  <XCircle className="h-3 w-3" />
                                </button>
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Subcategories Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">3. Subcategorias ({formData.allowedSubcategories.length} selecionadas)</Label>
                    <div className="flex gap-2">
                      {subcategories.length > 0 && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleChange('allowedSubcategories', subcategories.map(s => s.subcategory))}
                            className="h-7 text-xs"
                          >
                            Selecionar todas
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleChange('allowedSubcategories', [])}
                            className="h-7 text-xs"
                          >
                            Limpar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {subcategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma subcategoria disponível. Adicione artigos com subcategorias à base de conhecimento.
                    </p>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-1">
                        {subcategories.map((sub) => (
                          <div
                            key={sub.subcategory}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-muted"
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
                              className="flex-1 cursor-pointer flex items-center justify-between"
                            >
                              <span className="font-medium">{sub.subcategory}</span>
                              <span className="text-xs text-muted-foreground">
                                {sub.count} {sub.count === 1 ? 'artigo' : 'artigos'}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.allowedSubcategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-md">
                          {formData.allowedSubcategories.map((subcategory) => (
                            <span
                              key={subcategory}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                            >
                              {subcategory}
                              <button
                                type="button"
                                onClick={() => handleSubcategoryToggle(subcategory, false)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </>
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
