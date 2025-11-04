'use client'

/**
 * Analyses History Page
 * View all past analyses with details
 */

import { useState } from 'react'
import Link from 'next/link'
import { AnalysisHistory } from '@/components/analyses/analysis-history'
import { AnalysisViewModal } from '@/components/analyses/analysis-view-modal'
import { Button } from '@/components/ui/button'
import { History, TrendingUp } from 'lucide-react'

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <History className="h-8 w-8" />
            Histórico de Análises
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize e revise todas as suas análises anteriores
          </p>
        </div>
        <Link href="/analyses/compare">
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Comparar Análises
          </Button>
        </Link>
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
