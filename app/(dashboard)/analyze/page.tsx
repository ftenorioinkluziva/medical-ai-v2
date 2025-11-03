'use client'

/**
 * Analysis Page
 * Main page for medical document analysis
 */

import { useState } from 'react'
import Link from 'next/link'
import { DocumentUpload } from '@/components/documents/document-upload'
import { DocumentList } from '@/components/documents/document-list'
import { AgentSelector } from '@/components/agents/agent-selector'
import { AnalysisInterface } from '@/components/analysis/analysis-interface'
import { Button } from '@/components/ui/button'
import { History } from 'lucide-react'

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

export default function AnalyzePage() {
  const [selectedAgent, setSelectedAgent] = useState<HealthAgent | null>(null)
  const [refreshDocuments, setRefreshDocuments] = useState(0)

  const handleUploadComplete = () => {
    // Refresh document list
    setRefreshDocuments((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise Médica</h1>
          <p className="text-muted-foreground mt-2">
            Envie seus documentos médicos e consulte especialistas em IA
          </p>
        </div>
        <Link href="/analyses">
          <Button variant="outline" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upload & Documents */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Upload de Documentos</h2>
            <DocumentUpload onUploadComplete={handleUploadComplete} />
          </div>

          {/* Documents List Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Meus Documentos</h2>
            <DocumentList
              refreshTrigger={refreshDocuments}
              onSelectDocument={(doc) => {
                console.log('Selected document:', doc)
              }}
            />
          </div>
        </div>

        {/* Right Column - Agent Selection & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Selector */}
          <AgentSelector
            selectedAgentId={selectedAgent?.id}
            onSelectAgent={(agent) => setSelectedAgent(agent)}
          />

          {/* Analysis Interface */}
          {selectedAgent && (
            <AnalysisInterface
              selectedAgentId={selectedAgent.id}
              selectedAgentName={selectedAgent.name}
              onAnalysisComplete={(result) => {
                console.log('Analysis complete:', result)
              }}
            />
          )}

          {/* Help Text */}
          {!selectedAgent && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">
                Selecione um especialista acima para começar a análise
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
