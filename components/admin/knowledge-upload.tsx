'use client'

/**
 * Knowledge Upload Component
 * Upload medical knowledge articles (PDF, TXT, MD)
 */

import { useState } from 'react'
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

const CATEGORIES = [
  { value: 'hematology', label: 'Hematologia' },
  { value: 'endocrinology', label: 'Endocrinologia' },
  { value: 'nutrition', label: 'Nutrição' },
  { value: 'metabolism', label: 'Metabolismo' },
  { value: 'cardiology', label: 'Cardiologia' },
  { value: 'immunology', label: 'Imunologia' },
  { value: 'integrative', label: 'Medicina Integrativa' },
  { value: 'general', label: 'Geral' },
]

interface UploadResult {
  success: boolean
  articleId?: string
  error?: string
  stats?: {
    chunksCount: number
    processingTimeMs: number
  }
}

export function KnowledgeUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('general')
  const [source, setSource] = useState('')
  const [tags, setTags] = useState('')
  const [summary, setSummary] = useState('')

  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/pdf',
        'text/plain',
        'text/markdown',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]

      if (!validTypes.includes(selectedFile.type) &&
          !selectedFile.name.endsWith('.md') &&
          !selectedFile.name.endsWith('.txt')) {
        alert('Tipo de arquivo não suportado. Use PDF, TXT ou MD.')
        return
      }

      // Validate size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 10MB')
        return
      }

      setFile(selectedFile)

      // Auto-fill title from filename
      if (!title) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
        setTitle(nameWithoutExt)
      }

      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file || !title || !category) {
      alert('Preencha pelo menos título, categoria e selecione um arquivo')
      return
    }

    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('category', category)
      formData.append('source', source)
      formData.append('summary', summary)
      formData.append('tags', tags)

      const response = await fetch('/api/admin/knowledge/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      setUploadResult(result)

      if (result.success) {
        // Reset form
        setFile(null)
        setTitle('')
        setSource('')
        setTags('')
        setSummary('')
        setCategory('general')

        onUploadComplete?.()
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer upload',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setTitle('')
    setSource('')
    setTags('')
    setSummary('')
    setCategory('general')
    setUploadResult(null)
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="file">Arquivo</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,.txt,.md,.doc,.docx"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              {file.name} • {(file.size / 1024).toFixed(0)} KB
            </p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Interpretação de Hemograma Completo"
            disabled={isUploading}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select value={category} onValueChange={setCategory} disabled={isUploading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source */}
        <div className="space-y-2">
          <Label htmlFor="source">Fonte</Label>
          <Input
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Ex: Sociedade Brasileira de Hematologia"
            disabled={isUploading}
          />
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <Label htmlFor="summary">Resumo (opcional)</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Breve descrição do conteúdo..."
            rows={3}
            disabled={isUploading}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Ex: hemograma, interpretação, valores de referência"
            disabled={isUploading}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleUpload}
            disabled={!file || !title || !category || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Adicionar à Base
              </>
            )}
          </Button>

          {(file || uploadResult) && !isUploading && (
            <Button variant="outline" onClick={handleReset}>
              Limpar
            </Button>
          )}
        </div>

        {/* Result */}
        {uploadResult && (
          <div
            className={`
              p-4 rounded-lg border
              ${uploadResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
            `}
          >
            <div className="flex items-start gap-3">
              {uploadResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <p className={`text-sm font-medium ${uploadResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {uploadResult.success ? 'Artigo adicionado com sucesso!' : 'Erro no upload'}
                </p>
                {uploadResult.success && uploadResult.stats && (
                  <div className="text-xs text-green-700 space-y-0.5">
                    <p>• Chunks criados: {uploadResult.stats.chunksCount}</p>
                    <p>• Tempo: {(uploadResult.stats.processingTimeMs / 1000).toFixed(2)}s</p>
                  </div>
                )}
                {uploadResult.error && (
                  <p className="text-xs text-red-700">{uploadResult.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
