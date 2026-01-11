'use client'

/**
 * Medical Knowledge Admin Page
 * Manage biomarkers and protocols from the Logical Brain
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Calculator, FileText, ArrowLeft, Search, Brain } from 'lucide-react'
import { BiomarkersList } from '@/components/admin/medical-knowledge/biomarkers-list'
import { MetricsList } from '@/components/admin/medical-knowledge/metrics-list'
import { ProtocolsList } from '@/components/admin/medical-knowledge/protocols-list'
import { MedicalKnowledgeStats } from '@/components/admin/medical-knowledge/stats'

export default function MedicalKnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ biomarkers: 0, metrics: 0, protocols: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      // Fetch stats from API
      const response = await fetch('/api/admin/medical-knowledge/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain className="h-8 w-8" />
                Cérebro Lógico
              </h1>
              <p className="text-muted-foreground mt-1">
                Base de conhecimento para análise determinística de biomarcadores
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <MedicalKnowledgeStats stats={stats} isLoading={isLoading} />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar biomarcadores, métricas ou protocolos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="biomarkers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="biomarkers" className="gap-2">
            <Activity className="h-4 w-4" />
            Biomarcadores
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2">
            <Calculator className="h-4 w-4" />
            Métricas Calculadas
          </TabsTrigger>
          <TabsTrigger value="protocols" className="gap-2">
            <FileText className="h-4 w-4" />
            Protocolos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="biomarkers">
          <BiomarkersList searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsList searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="protocols">
          <ProtocolsList searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
