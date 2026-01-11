'use client'

/**
 * Knowledge Sync Admin Page
 * Manage synchronization between Knowledge Base and Cérebro Lógico
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCcw, ArrowLeft, FileSearch, ListChecks, History, Trash2 } from 'lucide-react'
import { KnowledgeSyncStats } from '@/components/admin/knowledge-sync/stats'
import { SuggestionFilters } from '@/components/admin/knowledge-sync/filters'
import { SuggestionList } from '@/components/admin/knowledge-sync/suggestion-list'
import { SyncHistory } from '@/components/admin/knowledge-sync/history-table'
import { toast } from 'sonner'

interface SyncStats {
  suggestions: {
    total: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    byType: Record<string, number>
    conflicts: number
  }
  articles: {
    total: number
    analyzed: number
    unanalyzed: number
    analysisCoverage: number
  }
  audit: {
    byAction: Record<string, number>
  }
}

export default function KnowledgeSyncPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [stats, setStats] = useState<SyncStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)

  // Filters state
  const [filters, setFilters] = useState({
    status: 'pending' as string,
    priority: 'all' as string,
    targetType: 'all' as string,
    suggestionType: 'all' as string,
    isConflict: false,
  })

  // Load stats on mount and when refresh is triggered
  useEffect(() => {
    loadStats()
  }, [refreshTrigger])

  const loadStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch('/api/admin/knowledge-sync/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.stats) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleAnalyzeAll = async () => {
    try {
      setIsAnalyzing(true)

      const response = await fetch('/api/admin/knowledge-sync/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyzeAll: true }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Análise Concluída: ${data.analyzed} artigos analisados, ${data.suggestions} sugestões geradas`)
        setRefreshTrigger(prev => prev + 1)
      } else {
        toast.error(data.error || 'Erro ao analisar artigos')
      }
    } catch (error) {
      console.error('Error analyzing articles:', error)
      toast.error('Erro ao analisar artigos')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCleanupDuplicates = async () => {
    if (!confirm('Deseja remover sugestões duplicadas? Será mantida apenas a mais antiga de cada grupo.')) {
      return
    }

    try {
      setIsCleaning(true)

      const response = await fetch('/api/admin/knowledge-sync/cleanup-duplicates', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`${data.removed} duplicatas removidas, ${data.kept} sugestões mantidas`)
        setRefreshTrigger(prev => prev + 1)
      } else {
        toast.error(data.error || 'Erro ao limpar duplicatas')
      }
    } catch (error) {
      console.error('Error cleaning duplicates:', error)
      toast.error('Erro ao limpar duplicatas')
    } finally {
      setIsCleaning(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <RefreshCcw className="h-8 w-8" />
              Sincronização de Conhecimento
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Sincronize a Base de Conhecimento com o Cérebro Lógico através de sugestões inteligentes geradas por IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCleanupDuplicates}
            disabled={isCleaning}
            variant="outline"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isCleaning ? 'Limpando...' : 'Limpar Duplicatas'}
          </Button>
          <Button
            onClick={handleAnalyzeAll}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <FileSearch className="h-4 w-4" />
            {isAnalyzing ? 'Analisando...' : 'Analisar Artigos'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <KnowledgeSyncStats stats={stats} isLoading={isLoadingStats} />

      {/* Tabs */}
      <Tabs defaultValue="suggestions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="suggestions" className="gap-2">
            <ListChecks className="h-4 w-4" />
            Sugestões
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-6">
          {/* Filters */}
          <SuggestionFilters filters={filters} setFilters={setFilters} />

          {/* Suggestion List */}
          <SuggestionList
            filters={filters}
            refreshTrigger={refreshTrigger}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="history">
          <SyncHistory refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
