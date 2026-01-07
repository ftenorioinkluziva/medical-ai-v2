'use client'

/**
 * Doctor View - Patient Dashboard
 * Shows patient's health dashboard for doctors
 */

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RecommendationsWidget } from '@/components/recommendations/recommendations-widget'
import { DynamicWeeklyPlanWidget } from '@/components/weekly-plan/dynamic-weekly-plan-widget'
import { DocumentUploadWidget } from '@/components/documents/document-upload-widget'
import { RecentDocumentsWidget } from '@/components/documents/recent-documents-widget'
import { RecentAnalysesWidget } from '@/components/analyses/recent-analyses-widget'
import { Loader2, User, ArrowRight } from 'lucide-react'
import { usePatient } from '@/lib/contexts/patient-context'

interface PageProps {
  params: Promise<{ patientId: string }>
}

export default function PatientDashboardPage({ params }: PageProps) {
  const { patientId } = use(params)
  const { selectedPatient, selectPatient } = usePatient()
  const [patient, setPatient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPatient()
  }, [patientId])

  const loadPatient = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/doctor/patients/${patientId}`)
      const data = await response.json()

      if (data.success && data.patient) {
        setPatient(data.patient)
        // Update context if different
        if (!selectedPatient || selectedPatient.id !== data.patient.id) {
          selectPatient(data.patient)
        }
      }
    } catch (error) {
      console.error('Error loading patient:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
            <p className="text-gray-600">Carregando dashboard do paciente...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Paciente não encontrado</p>
          <Link href="/doctor">
            <Button className="mt-4">Voltar para lista de pacientes</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard - {patient.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Resumo da saúde e atividades recentes do paciente
        </p>
      </div>

      {/* Profile Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-teal-600" />
            Perfil Médico do Paciente
          </CardTitle>
          <CardDescription>
            Visualize e acompanhe as informações médicas do paciente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="pt-2">
            <Link href={`/doctor/${patientId}/profile`}>
              <Button
                variant="outline"
                className="w-full justify-between group"
              >
                Ver Perfil Médico Completo
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Documents and Analyses Section - 3 Column Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DocumentUploadWidget patientId={patientId} />
        <RecentDocumentsWidget limit={5} patientId={patientId} />
        <RecentAnalysesWidget limit={5} patientId={patientId} />
      </div>

      {/* Recommendations and Weekly Plan Section - 2 Column Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecommendationsWidget patientId={patientId} />
        <DynamicWeeklyPlanWidget patientId={patientId} />
      </div>
    </div>
  )
}
