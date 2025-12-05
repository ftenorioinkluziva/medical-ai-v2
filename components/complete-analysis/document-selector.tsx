'use client'

/**
 * Document Selector
 * Allows users to select documents for complete analysis
 */

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Document {
  id: string
  fileName: string
  documentType: string
  createdAt: string
  processingStatus: string
}

interface DocumentSelectorProps {
  selectedDocuments: string[]
  onSelectionChange: (selected: string[]) => void
  disabled?: boolean
}

export function DocumentSelector({
  selectedDocuments,
  onSelectionChange,
  disabled = false,
}: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      const data = await response.json()

      if (data.success) {
        // Filter only completed documents
        const completedDocs = data.documents.filter(
          (d: Document) => d.processingStatus === 'completed'
        )
        setDocuments(completedDocs)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = (documentId: string) => {
    if (disabled) return

    if (selectedDocuments.includes(documentId)) {
      onSelectionChange(selectedDocuments.filter(id => id !== documentId))
    } else {
      onSelectionChange([...selectedDocuments, documentId])
    }
  }

  const handleSelectAll = () => {
    if (disabled) return

    if (selectedDocuments.length === documents.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(documents.map(d => d.id))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">Nenhum documento disponível</h3>
        <p className="text-sm text-muted-foreground">
          Faça upload de documentos médicos para iniciar a análise completa
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Select All */}
      <div className="flex items-center gap-2 pb-3 border-b">
        <Checkbox
          id="select-all"
          checked={selectedDocuments.length === documents.length}
          onCheckedChange={handleSelectAll}
          disabled={disabled}
        />
        <label
          htmlFor="select-all"
          className="text-sm font-medium cursor-pointer"
        >
          Selecionar todos ({documents.length})
        </label>
      </div>

      {/* Document List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {documents.map((doc) => {
          const isSelected = selectedDocuments.includes(doc.id)

          return (
            <div
              key={doc.id}
              className={`
                flex items-center gap-3 p-4 border rounded-lg transition-all
                ${isSelected ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 hover:border-gray-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              onClick={() => handleToggle(doc.id)}
            >
              <Checkbox
                id={doc.id}
                checked={isSelected}
                onCheckedChange={() => handleToggle(doc.id)}
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="font-medium truncate">{doc.fileName}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {doc.documentType}
                  </Badge>
                  <span>•</span>
                  <span>
                    {format(new Date(doc.createdAt), "dd 'de' MMMM, yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>

              {isSelected && (
                <CheckCircle2 className="h-5 w-5 text-purple-600 shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
