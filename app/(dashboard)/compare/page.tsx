'use client'

/**
 * Document Comparison Page
 * Compare medical documents side by side to track evolution
 */

import { useState } from 'react'
import { DocumentSelector } from '@/components/comparison/document-selector'
import { DocumentComparison } from '@/components/comparison/document-comparison'
import { GitCompare } from 'lucide-react'

export default function ComparePage() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <GitCompare className="h-8 w-8" />
          Comparação de Exames
        </h1>
        <p className="text-muted-foreground mt-2">
          Compare seus exames ao longo do tempo para acompanhar sua evolução
        </p>
      </div>

      {/* Document Selector */}
      <DocumentSelector
        selectedDocuments={selectedDocuments}
        onSelectionChange={setSelectedDocuments}
      />

      {/* Comparison View */}
      {selectedDocuments.length >= 2 && (
        <DocumentComparison documentIds={selectedDocuments} />
      )}

      {/* Help Text */}
      {selectedDocuments.length < 2 && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Selecione pelo menos 2 documentos</p>
          <p className="text-sm">
            Escolha os exames que deseja comparar para visualizar a evolução dos parâmetros
          </p>
        </div>
      )}
    </div>
  )
}
