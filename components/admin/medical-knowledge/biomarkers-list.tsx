/**
 * Biomarkers List Component
 * Displays and manages biomarkers from Cérebro Lógico
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ExternalLink, RefreshCcw, Pencil } from 'lucide-react'
import { BiomarkerEditDialog } from './biomarker-edit-dialog'

interface Biomarker {
  slug: string
  name: string
  category: string | null
  unit: string | null
  optimalMin: string | null
  optimalMax: string | null
  labMin: string | null
  labMax: string | null
  clinicalInsight: string | null
  metaphor: string | null
  sourceRef: string | null
  updatedAt: Date
  lastSyncedFrom: string | null
  syncMetadata: any
}

interface Props {
  searchQuery: string
}

export function BiomarkersList({ searchQuery }: Props) {
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [editingBiomarker, setEditingBiomarker] = useState<Biomarker | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleEdit = (biomarker: Biomarker) => {
    setEditingBiomarker(biomarker)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    loadBiomarkers()
  }

  useEffect(() => {
    loadBiomarkers()
  }, [searchQuery, selectedCategory])

  const loadBiomarkers = async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      params.append('limit', '50')

      const response = await fetch(`/api/admin/medical-knowledge/biomarkers?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setBiomarkers(data.biomarkers)
        setCategories(data.categories || [])
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Error loading biomarkers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Group biomarkers by category
  const biomarkersByCategory = biomarkers.reduce((acc, bio) => {
    const category = bio.category || 'Outros'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(bio)
    return acc
  }, {} as Record<string, Biomarker[]>)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando biomarcadores...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-sm text-muted-foreground">
            {total} biomarcador{total !== 1 ? 'es' : ''}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadBiomarkers}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {biomarkers.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p>Nenhum biomarcador encontrado</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(biomarkersByCategory).map(([category, categoryBiomarkers]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>
                {categoryBiomarkers.length} biomarcador{categoryBiomarkers.length !== 1 ? 'es' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryBiomarkers.map(bio => (
                  <div key={bio.slug} className="border rounded-lg p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{bio.name}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {bio.slug}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(bio)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Unit */}
                    {bio.unit && (
                      <p className="text-sm text-muted-foreground">
                        Unidade: <span className="font-medium">{bio.unit}</span>
                      </p>
                    )}

                    {/* Optimal Range */}
                    {(bio.optimalMin || bio.optimalMax) && (
                      <div className="text-sm space-y-1">
                        <p className="font-medium text-green-600 dark:text-green-400">
                          Faixa Ótima:
                        </p>
                        <p className="text-muted-foreground">
                          {bio.optimalMin || '?'} - {bio.optimalMax || '?'} {bio.unit}
                        </p>
                      </div>
                    )}

                    {/* Lab Range */}
                    {(bio.labMin || bio.labMax) && (
                      <div className="text-sm space-y-1">
                        <p className="font-medium text-blue-600 dark:text-blue-400">
                          Faixa Laboratorial:
                        </p>
                        <p className="text-muted-foreground">
                          {bio.labMin || '?'} - {bio.labMax || '?'} {bio.unit}
                        </p>
                      </div>
                    )}

                    {/* Clinical Insight */}
                    {bio.clinicalInsight && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-gray-300 pl-2">
                        {bio.clinicalInsight}
                      </p>
                    )}

                    {/* Metaphor */}
                    {bio.metaphor && (
                      <div className="text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 p-2 rounded">
                        💡 {bio.metaphor}
                      </div>
                    )}

                    {/* Sync Status */}
                    {bio.lastSyncedFrom && (
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary" className="gap-1">
                          <RefreshCcw className="h-3 w-3" />
                          Sincronizado
                        </Badge>
                      </div>
                    )}

                    {/* Source */}
                    {bio.sourceRef && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Fonte: {bio.sourceRef}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Edit Dialog */}
      <BiomarkerEditDialog
        biomarker={editingBiomarker}
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
