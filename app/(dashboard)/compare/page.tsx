'use client'

/**
 * Document Comparison Page - Minimal Health Design
 * Compare medical documents side by side to track evolution
 */

import { useState } from 'react'
import { DocumentSelector } from '@/components/comparison/document-selector'
import { DocumentComparison } from '@/components/comparison/document-comparison'
import { GitCompare } from 'lucide-react'

export default function ComparePage() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
          <GitCompare className="h-6 w-6 text-teal-600" />
          Comparação de Exames
        </h1>
        <p className="text-muted-foreground mt-1">
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
        <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="bg-teal-50 rounded-lg p-4 mb-4 inline-block">
            <GitCompare className="h-12 w-12 text-teal-600" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">Selecione pelo menos 2 documentos</p>
          <p className="text-sm text-muted-foreground">
            Escolha os exames que deseja comparar para visualizar a evolução dos parâmetros
          </p>
        </div>
      )}
    </div>
  )
}
