'use client'

/**
 * Document Upload Widget - Compact version for dashboard
 * Simplified upload interface optimized for dashboard display
 */

import { useState, useCallback } from 'react'
import { Upload, File, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    modulesCount?: number
    processingTimeMs: number
  }
  error?: string
}

interface DocumentUploadWidgetProps {
  onUploadComplete?: (result: UploadResult) => void
  patientId?: string
}

export function DocumentUploadWidget({ onUploadComplete, patientId }: DocumentUploadWidgetProps) {
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
      if (patientId) {
        formData.append('patientId', patientId)
      }

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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          Upload de Documentos
        </CardTitle>
        <CardDescription>
          Envie exames, laudos ou relatórios médicos para análise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag & Drop Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer
            ${isDragging ? 'border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/20' : 'border-border hover:border-teal-400 dark:hover:border-teal-500'}
            ${file ? 'bg-muted' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && document.getElementById('file-input-widget')?.click()}
        >
          {!file ? (
            <div className="space-y-3">
              <Upload className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
              <div className="px-2">
                <p className="text-sm font-medium text-foreground">
                  <span className="hidden sm:inline">Arraste e solte seu arquivo aqui</span>
                  <span className="sm:hidden">Arraste arquivo aqui</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF ou Imagens • Máx 10MB
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
                id="file-input-widget"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <File className="mx-auto h-10 w-10 text-teal-600 dark:text-teal-400" />
              <div>
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                Trocar Arquivo
              </Button>
            </div>
          )}
        </div>

        {/* Document Type Selection */}
        {file && !uploadResult && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo de Documento</label>
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
            className="w-full bg-teal-600 hover:bg-teal-700"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Fazer Upload
              </>
            )}
          </Button>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div
            className={`
              p-3 rounded-lg border text-sm
              ${uploadResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
            `}
          >
            <div className="flex items-start gap-2">
              {uploadResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${uploadResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {uploadResult.success ? 'Upload realizado com sucesso!' : 'Erro no upload'}
                </p>
                {uploadResult.error && (
                  <p className="text-xs text-red-700 mt-1">{uploadResult.error}</p>
                )}
              </div>
            </div>
            {uploadResult.success && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full mt-3"
              >
                Enviar Outro Documento
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
