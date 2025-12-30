'use client'

/**
 * Document Upload Component
 * Drag & drop file upload with validation
 */

import { useState, useCallback } from 'react'
import { Upload, File, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DOCUMENT_TYPES = [
  { value: 'lab_report', label: 'Exame Laboratorial' },
  { value: 'bioimpedance', label: 'Bioimpedância' },
  { value: 'medical_report', label: 'Relatório Médico' },
  { value: 'prescription', label: 'Receita' },
  { value: 'imaging', label: 'Exame de Imagem' },
  { value: 'other', label: 'Outro' },
]

interface UploadResult {
  success: boolean
  documentId?: string
  fileName?: string
  stats?: {
    textLength: number
    chunksCount: number
    processingTimeMs: number
  }
  error?: string
}

export function DocumentUpload({ onUploadComplete }: { onUploadComplete?: (result: UploadResult) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>('other')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }, [])

  // Validate file
  const validateAndSetFile = (selectedFile: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (selectedFile.size > maxSize) {
      setUploadResult({
        success: false,
        error: 'Arquivo muito grande. Tamanho máximo: 10MB',
      })
      return
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadResult({
        success: false,
        error: 'Tipo de arquivo não suportado. Use PDF ou imagens (JPG, PNG, WEBP)',
      })
      return
    }

    setFile(selectedFile)
    setUploadResult(null)
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  // Upload file
  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      setUploadResult(result)

      if (result.success) {
        setFile(null)
        onUploadComplete?.(result)
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

  // Reset
  const handleReset = () => {
    setFile(null)
    setUploadResult(null)
    setDocumentType('other')
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Upload de Documento</h3>
          <p className="text-sm text-muted-foreground">
            Envie exames, laudos ou relatórios médicos (PDF ou imagens)
          </p>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${file ? 'bg-muted/50' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Arraste e solte seu arquivo aqui
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ou clique para selecionar
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                Selecionar Arquivo
              </Button>
              <p className="text-xs text-muted-foreground">
                PDF ou Imagens (JPG, PNG, WEBP) • Máx 10MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <File className="mx-auto h-12 w-12 text-primary" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB • {file.type}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Trocar Arquivo
              </Button>
            </div>
          )}
        </div>

        {/* Document Type Selection */}
        {file && !uploadResult && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Documento</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Upload Button */}
        {file && !uploadResult && (
          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-1 w-full">
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando documento...
                </div>
                <span className="text-xs opacity-75">
                  Extraindo texto e estruturando dados médicos com IA
                </span>
              </div>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Fazer Upload e Processar
              </>
            )}
          </Button>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div
            className={`
              p-4 rounded-lg border
              ${uploadResult.success ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-700'}
            `}
          >
            <div className="flex items-start gap-3">
              {uploadResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <p className={`text-sm font-medium ${uploadResult.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                  {uploadResult.success ? 'Upload realizado com sucesso!' : 'Erro no upload'}
                </p>
                {uploadResult.success && uploadResult.stats && (
                  <div className="text-xs text-green-700 dark:text-green-300 space-y-0.5">
                    <p>• Texto extraído: {uploadResult.stats.textLength.toLocaleString()} caracteres</p>
                    {uploadResult.stats.modulesCount !== undefined && (
                      <p>• Módulos estruturados: {uploadResult.stats.modulesCount} exames identificados</p>
                    )}
                    <p>• Tempo de processamento: {(uploadResult.stats.processingTimeMs / 1000).toFixed(2)}s</p>
                  </div>
                )}
                {uploadResult.error && (
                  <p className="text-xs text-red-700 dark:text-red-300">{uploadResult.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
