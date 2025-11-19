'use client'

/**
 * Doctor View - Edit Patient Profile
 * Allows doctors to edit patient's medical profile
 */

import { use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MedicalProfileForm } from '@/components/profile/medical-profile-form'
import { ArrowLeft, User } from 'lucide-react'
import { usePatient } from '@/lib/contexts/patient-context'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: Promise<{ patientId: string }>
}

export default function EditPatientProfilePage({ params }: PageProps) {
  const { patientId } = use(params)
  const { selectedPatient } = usePatient()
  const router = useRouter()

  const handleProfileSaved = () => {
    // Redirect back to profile view after saving
    router.push(`/doctor/${patientId}/profile`)
  }

  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link href={`/doctor/${patientId}/profile`}>
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Perfil
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <User className="h-6 w-6 text-teal-600" />
          Editar Perfil Médico - {selectedPatient?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Atualize as informações de saúde do paciente
        </p>
      </div>

      {/* Profile Form */}
      <MedicalProfileForm
        userId={patientId}
        onProfileSaved={handleProfileSaved}
      />
    </div>
  )
}
