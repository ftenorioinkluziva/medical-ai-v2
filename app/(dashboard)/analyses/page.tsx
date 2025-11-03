'use client'

/**
 * Analyses History Page
 * View all past analyses with details
 */

import { useState } from 'react'
import { AnalysisHistory } from '@/components/analyses/analysis-history'
import { AnalysisViewModal } from '@/components/analyses/analysis-view-modal'
import { History } from 'lucide-react'

interface Analysis {
  id: string
  agentId: string
  agentName: string
  agentKey: string
  prompt: string
  analysis: string
  modelUsed: string
  tokensUsed: number | null
  processingTimeMs: number | null
  ragUsed: boolean
  documentIds: string[] | null
  createdAt: string
}

export default function AnalysesPage() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Delay clearing to allow modal animation
    setTimeout(() => setSelectedAnalysis(null), 300)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <History className="h-8 w-8" />
          Histórico de Análises
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualize e revise todas as suas análises anteriores
        </p>
      </div>

      {/* History Component */}
      <AnalysisHistory onViewAnalysis={handleViewAnalysis} />

      {/* View Modal */}
      <AnalysisViewModal
        analysis={selectedAnalysis}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
