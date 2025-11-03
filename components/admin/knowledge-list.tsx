'use client'

/**
 * Knowledge List Component
 * Display and manage knowledge base articles
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface KnowledgeArticle {
  id: string
  title: string
  category: string
  source?: string
  summary?: string
  tags?: string[]
  isVerified: 'verified' | 'pending' | 'rejected'
  usageCount: number
  chunksCount?: number
  createdAt: string
  updatedAt: string
}

interface KnowledgeListProps {
  refreshTrigger?: number
}

const CATEGORY_LABELS: Record<string, string> = {
  hematology: 'Hematologia',
  endocrinology: 'Endocrinologia',
  nutrition: 'Nutrição',
  metabolism: 'Metabolismo',
  cardiology: 'Cardiologia',
  immunology: 'Imunologia',
  integrative: 'Medicina Integrativa',
  general: 'Geral',
}

const VERIFICATION_CONFIG = {
  verified: {
    label: 'Verificado',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  rejected: {
    label: 'Rejeitado',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
  },
}

export function KnowledgeList({ refreshTrigger }: KnowledgeListProps) {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewingArticle, setViewingArticle] = useState<KnowledgeArticle | null>(null)

  useEffect(() => {
    loadArticles()
  }, [refreshTrigger])

  const loadArticles = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/knowledge/articles')
      if (!response.ok) {
        throw new Error('Erro ao carregar artigos')
      }

      const data = await response.json()
      setArticles(data.articles || [])
    } catch (err) {
      console.error('Error loading articles:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (articleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/knowledge/articles/${articleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir artigo')
      }

      // Reload list
      await loadArticles()
    } catch (err) {
      console.error('Error deleting article:', err)
      alert(err instanceof Error ? err.message : 'Erro ao excluir artigo')
    }
  }

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Carregando artigos...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-12 border-red-200 bg-red-50">
        <div className="flex flex-col items-center gap-3 text-red-600">
          <AlertCircle className="h-8 w-8" />
          <p className="font-medium">Erro ao carregar artigos</p>
          <p className="text-sm">{error}</p>
          <Button variant="outline" onClick={loadArticles} className="mt-2">
            Tentar novamente
          </Button>
        </div>
      </Card>
    )
  }

  if (articles.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <FileText className="h-12 w-12" />
          <p className="text-lg font-medium">Nenhum artigo cadastrado</p>
          <p className="text-sm">Faça upload de artigos para começar</p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {articles.map((article) => {
          const verificationConfig = VERIFICATION_CONFIG[article.isVerified]
          const VerificationIcon = verificationConfig.icon

          return (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2 truncate">
                      {article.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="shrink-0">
                        {CATEGORY_LABELS[article.category] || article.category}
                      </Badge>
                      <Badge variant="outline" className={verificationConfig.color}>
                        <VerificationIcon className="h-3 w-3 mr-1" />
                        {verificationConfig.label}
                      </Badge>
                      {article.usageCount > 0 && (
                        <Badge variant="secondary" className="shrink-0">
                          {article.usageCount} uso{article.usageCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {article.chunksCount !== undefined && (
                        <Badge variant="secondary" className="shrink-0">
                          {article.chunksCount} chunk{article.chunksCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingArticle(article)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {(article.summary || article.source || (article.tags && article.tags.length > 0)) && (
                <CardContent className="pt-0">
                  {article.summary && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {article.summary}
                    </p>
                  )}

                  {article.source && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <span className="font-medium">Fonte:</span> {article.source}
                    </p>
                  )}

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-3">
                    Criado em: {new Date(article.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Article Details Modal */}
      {viewingArticle && (
        <ArticleDetailsModal
          article={viewingArticle}
          onClose={() => setViewingArticle(null)}
        />
      )}
    </>
  )
}

/**
 * Article Details Modal
 */
interface ArticleDetailsModalProps {
  article: KnowledgeArticle
  onClose: () => void
}

function ArticleDetailsModal({ article, onClose }: ArticleDetailsModalProps) {
  const [fullContent, setFullContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFullContent()
  }, [article.id])

  const loadFullContent = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/knowledge/articles/${article.id}`)

      if (!response.ok) {
        throw new Error('Erro ao carregar conteúdo completo')
      }

      const data = await response.json()
      setFullContent(data.article.content)
    } catch (err) {
      console.error('Error loading full content:', err)
      setFullContent('Erro ao carregar conteúdo')
    } finally {
      setIsLoading(false)
    }
  }

  const verificationConfig = VERIFICATION_CONFIG[article.isVerified]
  const VerificationIcon = verificationConfig.icon

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 shrink-0 border-b">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {CATEGORY_LABELS[article.category] || article.category}
              </Badge>
              <Badge variant="outline" className={verificationConfig.color}>
                <VerificationIcon className="h-3 w-3 mr-1" />
                {verificationConfig.label}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <CardContent className="space-y-4 pb-6 px-6 pt-6">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {article.source && (
                  <div>
                    <p className="font-medium text-muted-foreground">Fonte</p>
                    <p>{article.source}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-muted-foreground">Utilizações</p>
                  <p>{article.usageCount} vezes</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Criado em</p>
                  <p>
                    {new Date(article.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {article.chunksCount !== undefined && (
                  <div>
                    <p className="font-medium text-muted-foreground">Chunks</p>
                    <p>{article.chunksCount}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div>
                  <p className="font-medium text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {article.summary && (
                <div>
                  <p className="font-medium text-muted-foreground mb-2">Resumo</p>
                  <p className="text-sm">{article.summary}</p>
                </div>
              )}

              {/* Full Content */}
              <div>
                <p className="font-medium text-muted-foreground mb-2">Conteúdo Completo</p>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-8">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>Carregando conteúdo...</p>
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                    {fullContent}
                  </div>
                )}
              </div>
            </CardContent>
          </ScrollArea>
        </div>
      </Card>
    </div>
  )
}
