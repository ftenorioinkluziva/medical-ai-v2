/**
 * Medical Knowledge Admin Page
 * Manage biomarkers and protocols from the Logical Brain
 */

import { db } from '@/lib/db/client'
import { biomarkersReference, calculatedMetrics, protocols } from '@/lib/db/schema'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Calculator, FileText } from 'lucide-react'

export const metadata = {
  title: 'Conhecimento Médico | Admin',
  description: 'Gerenciar biomarcadores e protocolos do Cérebro Lógico',
}

async function getBiomarkers() {
  return await db
    .select()
    .from(biomarkersReference)
    .orderBy(biomarkersReference.category, biomarkersReference.name)
}

async function getMetrics() {
  return await db
    .select()
    .from(calculatedMetrics)
    .orderBy(calculatedMetrics.name)
}

async function getProtocols() {
  return await db
    .select()
    .from(protocols)
    .orderBy(protocols.type, protocols.title)
}

export default async function MedicalKnowledgePage() {
  const [biomarkers, metrics, protocolsList] = await Promise.all([
    getBiomarkers(),
    getMetrics(),
    getProtocols(),
  ])

  // Group biomarkers by category
  const biomarkersByCategory = biomarkers.reduce((acc, bio) => {
    const category = bio.category || 'Outros'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(bio)
    return acc
  }, {} as Record<string, typeof biomarkers>)

  // Group protocols by type
  const protocolsByType = protocolsList.reduce((acc, proto) => {
    const type = proto.type || 'Outros'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(proto)
    return acc
  }, {} as Record<string, typeof protocolsList>)

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Cérebro Lógico - Conhecimento Médico</h1>
        <p className="text-muted-foreground">
          Base de conhecimento para análise determinística de biomarcadores
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Biomarcadores</p>
              <p className="text-2xl font-bold">{biomarkers.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Calculator className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Métricas Calculadas</p>
              <p className="text-2xl font-bold">{metrics.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Protocolos</p>
              <p className="text-2xl font-bold">{protocolsList.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Biomarkers by Category */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Biomarcadores por Categoria</h2>

        {Object.entries(biomarkersByCategory).map(([category, categoryBiomarkers]) => (
          <Card key={category} className="p-6">
            <h3 className="text-lg font-semibold mb-4">{category}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryBiomarkers.map((bio) => (
                <div key={bio.slug} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{bio.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {bio.slug}
                    </Badge>
                  </div>

                  {bio.unit && (
                    <p className="text-sm text-muted-foreground">Unidade: {bio.unit}</p>
                  )}

                  {(bio.optimalMin || bio.optimalMax) && (
                    <div className="text-sm">
                      <span className="font-medium">Faixa Ótima:</span>{' '}
                      {bio.optimalMin || '-'} a {bio.optimalMax || '-'}
                    </div>
                  )}

                  {(bio.labMin || bio.labMax) && (
                    <div className="text-sm">
                      <span className="font-medium">Faixa Lab:</span>{' '}
                      {bio.labMin || '-'} a {bio.labMax || '-'}
                    </div>
                  )}

                  {bio.clinicalInsight && (
                    <p className="text-xs text-muted-foreground italic">
                      {bio.clinicalInsight}
                    </p>
                  )}

                  {bio.metaphor && (
                    <p className="text-xs bg-blue-50 dark:bg-blue-950 p-2 rounded">
                      💡 {bio.metaphor}
                    </p>
                  )}

                  {bio.sourceRef && (
                    <p className="text-xs text-muted-foreground">
                      Fonte: {bio.sourceRef}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Calculated Metrics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Métricas Calculadas</h2>

        <Card className="p-6">
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.slug} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{metric.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {metric.slug}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded font-mono">
                    <span className="font-medium">Fórmula:</span> {metric.formula}
                  </div>

                  {(metric.targetMin || metric.targetMax) && (
                    <div className="text-sm">
                      <span className="font-medium">Alvo:</span>{' '}
                      {metric.targetMin ? `≥ ${metric.targetMin}` : ''}
                      {metric.targetMin && metric.targetMax ? ' e ' : ''}
                      {metric.targetMax ? `≤ ${metric.targetMax}` : ''}
                    </div>
                  )}

                  {metric.riskInsight && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Insight de Risco:</span> {metric.riskInsight}
                    </p>
                  )}

                  {metric.sourceRef && (
                    <p className="text-xs text-muted-foreground">
                      Fonte: {metric.sourceRef}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Protocols by Type */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Protocolos por Tipo</h2>

        {Object.entries(protocolsByType).map(([type, typeProtocols]) => (
          <Card key={type} className="p-6">
            <h3 className="text-lg font-semibold mb-4">{type}</h3>
            <div className="space-y-4">
              {typeProtocols.map((proto) => (
                <div key={proto.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{proto.title}</h4>
                    <Badge>{proto.type}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm bg-yellow-50 dark:bg-yellow-950 p-2 rounded">
                      <span className="font-medium">Condição de Ativação:</span>{' '}
                      <code className="text-xs">{proto.triggerCondition}</code>
                    </div>

                    <p className="text-sm">{proto.description}</p>

                    {proto.dosage && (
                      <p className="text-sm">
                        <span className="font-medium">Dosagem:</span> {proto.dosage}
                      </p>
                    )}

                    {proto.sourceRef && (
                      <p className="text-xs text-muted-foreground">
                        Fonte: {proto.sourceRef}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
