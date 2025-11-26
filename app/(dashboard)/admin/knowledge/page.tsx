'use client'

/**
 * Knowledge Base Admin Page
 * Manage medical knowledge articles
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { KnowledgeUpload } from '@/components/admin/knowledge-upload'
import { KnowledgeList } from '@/components/admin/knowledge-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Upload, List, BarChart3, ArrowLeft } from 'lucide-react'

interface KnowledgeStats {
  totalArticles: number
  totalCategories: number
  verifiedArticles: number
  totalUsage: number
  totalChunks: number
}

export default function KnowledgeBasePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [stats, setStats] = useState<KnowledgeStats>({
    totalArticles: 0,
    totalCategories: 0,
    verifiedArticles: 0,
    totalUsage: 0,
    totalChunks: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Load stats on mount and when refresh is triggered
  useEffect(() => {
    loadStats()
  }, [refreshTrigger])

  const loadStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch('/api/admin/knowledge/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.stats) {
          setStats({
            totalArticles: data.stats.totalArticles || 0,
            totalCategories: data.stats.totalCategories || 0,
            verifiedArticles: data.stats.verifiedArticles || 0,
            totalUsage: data.stats.totalUsage || 0,
            totalChunks: data.stats.totalChunks || 0,
          })
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            Base de Conhecimento Médico
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Gerencie artigos, guidelines e referências médicas para análises mais fundamentadas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Artigos</CardDescription>
            <CardTitle className="text-3xl">
              {isLoadingStats ? '...' : stats.totalArticles}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Categorias</CardDescription>
            <CardTitle className="text-3xl">
              {isLoadingStats ? '...' : stats.totalCategories}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Verificados</CardDescription>
            <CardTitle className="text-3xl">
              {isLoadingStats ? '...' : stats.verifiedArticles}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Utilizações</CardDescription>
            <CardTitle className="text-3xl">
              {isLoadingStats ? '...' : stats.totalUsage}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content - No Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upload */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Upload de Artigos</h2>
          <KnowledgeUpload onUploadComplete={handleUploadComplete} />
        </div>

        {/* Right Column - List */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Artigos da Base</h2>
          <KnowledgeList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  )
}
