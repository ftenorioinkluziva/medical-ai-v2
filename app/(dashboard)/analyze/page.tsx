'use client'

/**
 * Analysis Page - Unified Analysis and History
 * Main page for medical document analysis with integrated history
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AgentSelector } from '@/components/agents/agent-selector'
import { AnalysisInterface } from '@/components/analysis/analysis-interface'
import { AnalysisHistory } from '@/components/analyses/analysis-history'
import { AnalysisViewModal } from '@/components/analyses/analysis-view-modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { History, FileText, Sparkles } from 'lucide-react'

interface HealthAgent {
  id: string
  agentKey: string
  name: string
  title: string
  description: string
  color: string
  icon: string
  modelName: string
}

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

export default function AnalyzePage() {
  const searchParams = useSearchParams()
  const [selectedAgent, setSelectedAgent] = useState<HealthAgent | null>(null)
  const [activeTab, setActiveTab] = useState('new')
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Check URL params to open history tab if requested
  useEffect(() => {
    const tab = searchParams?.get('tab')
    if (tab === 'history') {
      setActiveTab('history')
    }
  }, [searchParams])

  const handleViewAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedAnalysis(null), 300)
  }

  const handleAnalysisComplete = (result: any) => {
    console.log('Analysis complete:', result)
    // Switch to history tab to see the new analysis
    setActiveTab('history')
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Análise Médica com IA</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Consulte especialistas em IA e visualize suas análises anteriores
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted">
          <TabsTrigger value="new" className="gap-2 data-[state=active]:!bg-teal-600 data-[state=active]:!text-white dark:data-[state=active]:!bg-teal-600">
            <Sparkles className="h-4 w-4" />
            Nova Análise
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 data-[state=active]:!bg-teal-600 data-[state=active]:!text-white dark:data-[state=active]:!bg-teal-600">
            <History className="h-4 w-4" />
            Histórico de Análises
          </TabsTrigger>
        </TabsList>

        {/* New Analysis Tab */}
        <TabsContent value="new" className="space-y-6 mt-6">
          {/* Agent Selector - Only foundation agents */}
          <AgentSelector
            selectedAgentId={selectedAgent?.id}
            onSelectAgent={(agent) => setSelectedAgent(agent)}
            analysisRole="foundation"
          />

          {/* Analysis Interface */}
          {selectedAgent && (
            <AnalysisInterface
              selectedAgentId={selectedAgent.id}
              selectedAgentName={selectedAgent.name}
              selectedAgentColor={selectedAgent.color}
              selectedAgentKey={selectedAgent.agentKey}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {/* Help Text */}
          {!selectedAgent && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="bg-teal-50 rounded-lg p-4 mb-4 inline-block">
                <FileText className="h-12 w-12 text-teal-600" />
              </div>
              <p className="text-sm font-medium mb-2">
                Selecione um especialista acima para começar a análise
              </p>
              <p className="text-xs text-gray-400">
                Você precisará selecionar documentos e fazer sua pergunta após escolher o especialista
              </p>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <AnalysisHistory onViewAnalysis={handleViewAnalysis} />
        </TabsContent>
      </Tabs>

      {/* View Modal */}
      <AnalysisViewModal
        analysis={selectedAnalysis}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
