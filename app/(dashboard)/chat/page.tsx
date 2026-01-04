'use client'

/**
 * Chat Page - Dedicated page for chatting with AI agents
 * Users can select a previous analysis and chat with the specialist about it
 */

import { useState } from 'react'
import { AnalysisSelector } from '@/components/analysis/analysis-selector'
import { AnalysisChat } from '@/components/analysis/analysis-chat'
import { Card } from '@/components/ui/card'
import { MessageCircle, Sparkles } from 'lucide-react'

interface SelectedAnalysis {
  id: string
  agentId: string
  agentName: string
  agentTitle: string
  agentColor: string
  agentKey: string
  analysis: string
  createdAt: string
  documentIds: string[] | null
}

export default function ChatPage() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<SelectedAnalysis | null>(null)

  return (
    <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-teal-600" />
          Conversar com Especialista
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Tire dúvidas e aprofunde suas análises conversando diretamente com os especialistas em IA
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-200 dark:border-teal-800">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-teal-900 dark:text-teal-100">
              Como funciona?
            </p>
            <p className="text-xs text-teal-800 dark:text-teal-200">
              Selecione uma das suas análises anteriores abaixo e inicie uma conversa com o especialista.
              Você pode fazer perguntas sobre a análise, pedir esclarecimentos ou solicitar orientações adicionais.
            </p>
          </div>
        </div>
      </Card>

      {/* Analysis Selector */}
      <AnalysisSelector
        onSelectAnalysis={(analysis) => setSelectedAnalysis(analysis)}
      />

      {/* Chat Interface */}
      {selectedAnalysis && (
        <AnalysisChat
          analysisId={selectedAnalysis.id}
          agentName={selectedAnalysis.agentName}
          agentColor={selectedAnalysis.agentColor}
          agentInitial={selectedAnalysis.agentKey.substring(0, 2).toUpperCase()}
          className="mt-6"
        />
      )}

      {/* Empty State */}
      {!selectedAnalysis && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium mb-2">
              Selecione uma análise acima para começar a conversar
            </p>
            <p className="text-xs">
              Você poderá fazer perguntas e obter esclarecimentos sobre a análise selecionada
            </p>
          </div>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-900 dark:text-amber-100">
          <strong>⚠️ Aviso Importante:</strong> As respostas são geradas por IA para fins educacionais
          e <strong>NÃO substituem consulta médica profissional</strong>. Sempre consulte um profissional
          de saúde qualificado para orientação médica definitiva.
        </p>
      </Card>
    </div>
  )
}
