'use client'

/**
 * Document Details Component
 * Displays structured data extracted from medical documents
 */

import { X, FileText, Calendar, User, Building2, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { StructuredMedicalDocument } from '@/lib/documents/structuring'

interface DocumentDetailsProps {
  document: {
    id: string
    fileName: string
    documentType: string
    createdAt: string
    structuredData?: StructuredMedicalDocument
    extractedText?: string
  }
  onClose: () => void
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  lab_report: 'Exame Laboratorial',
  bioimpedance: 'Bioimpedância',
  medical_report: 'Relatório Médico',
  prescription: 'Prescrição',
  imaging: 'Exame de Imagem',
  other: 'Outro',
}

export function DocumentDetails({ document, onClose }: DocumentDetailsProps) {
  const { structuredData } = document

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'high':
      case 'low':
      case 'abnormal':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'borderline':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle2 className="h-4 w-4" />
      case 'high':
        return <TrendingUp className="h-4 w-4" />
      case 'low':
        return <TrendingDown className="h-4 w-4" />
      case 'abnormal':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal'
      case 'high':
        return 'Alto'
      case 'low':
        return 'Baixo'
      case 'abnormal':
        return 'Alterado'
      case 'borderline':
        return 'Limítrofe'
      default:
        return 'N/A'
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 shrink-0">
          <div className="space-y-1">
            <CardTitle className="text-xl">{document.fileName}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <CardContent className="space-y-6 pb-6 px-6">
            {!structuredData ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Este documento foi processado apenas com extração de texto.
                  <br />
                  Dados estruturados não disponíveis.
                </p>
              </div>
            ) : (
              <>
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Patient Info */}
                  {structuredData.patientInfo && Object.keys(structuredData.patientInfo).length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Informações do Paciente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {structuredData.patientInfo.name && (
                          <div>
                            <span className="text-muted-foreground">Nome:</span>{' '}
                            <span className="font-medium">{structuredData.patientInfo.name}</span>
                          </div>
                        )}
                        {structuredData.patientInfo.age && (
                          <div>
                            <span className="text-muted-foreground">Idade:</span>{' '}
                            <span className="font-medium">{structuredData.patientInfo.age} anos</span>
                          </div>
                        )}
                        {structuredData.patientInfo.sex && (
                          <div>
                            <span className="text-muted-foreground">Sexo:</span>{' '}
                            <span className="font-medium">
                              {structuredData.patientInfo.sex === 'M' ? 'Masculino' : 'Feminino'}
                            </span>
                          </div>
                        )}
                        {structuredData.patientInfo.id_cpf && (
                          <div>
                            <span className="text-muted-foreground">CPF:</span>{' '}
                            <span className="font-medium">{structuredData.patientInfo.id_cpf}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Provider Info */}
                  {structuredData.providerInfo && Object.keys(structuredData.providerInfo).length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Informações do Laboratório
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {structuredData.providerInfo.name && (
                          <div>
                            <span className="text-muted-foreground">Laboratório:</span>{' '}
                            <span className="font-medium">{structuredData.providerInfo.name}</span>
                          </div>
                        )}
                        {structuredData.providerInfo.doctor && (
                          <div>
                            <span className="text-muted-foreground">Médico:</span>{' '}
                            <span className="font-medium">{structuredData.providerInfo.doctor}</span>
                          </div>
                        )}
                        {structuredData.examDate && (
                          <div>
                            <span className="text-muted-foreground">Data do Exame:</span>{' '}
                            <span className="font-medium">
                              {new Date(structuredData.examDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Overall Summary */}
                {structuredData.overallSummary && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Resumo Geral</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{structuredData.overallSummary}</p>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Modules */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Resultados dos Exames</h3>

                  {structuredData.modules.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum módulo de exame estruturado encontrado.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {structuredData.modules.map((module, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-base">{module.moduleName}</CardTitle>
                                <p className="text-xs text-muted-foreground">{module.category}</p>
                              </div>
                              <Badge className={getStatusColor(module.status)} variant="outline">
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(module.status)}
                                  {getStatusLabel(module.status)}
                                </span>
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {module.summary && (
                              <p className="text-sm text-muted-foreground italic">{module.summary}</p>
                            )}

                            {module.parameters && module.parameters.length > 0 && (
                              <div className="space-y-2">
                                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                                  <div className="col-span-4">Parâmetro</div>
                                  <div className="col-span-2 text-right">Valor</div>
                                  <div className="col-span-1 text-center">Unidade</div>
                                  <div className="col-span-3 text-center">Referência</div>
                                  <div className="col-span-2 text-center">Status</div>
                                </div>

                                {module.parameters.map((param, paramIndex) => (
                                  <div
                                    key={paramIndex}
                                    className="grid grid-cols-12 gap-2 text-sm items-center py-2 hover:bg-muted/50 rounded px-2"
                                  >
                                    <div className="col-span-4 font-medium">{param.name}</div>
                                    <div className="col-span-2 text-right tabular-nums">{param.value}</div>
                                    <div className="col-span-1 text-center text-muted-foreground">
                                      {param.unit || '-'}
                                    </div>
                                    <div className="col-span-3 text-center text-xs text-muted-foreground">
                                      {param.referenceRange || '-'}
                                    </div>
                                    <div className="col-span-2 text-center">
                                      {param.status && (
                                        <Badge className={getStatusColor(param.status)} variant="outline">
                                          {getStatusLabel(param.status)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            </CardContent>
          </ScrollArea>
        </div>
      </Card>
    </div>
  )
}
