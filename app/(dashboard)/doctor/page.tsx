/**
 * Doctor Main Page
 * List of all patients
 */

import { PatientsList } from '@/components/doctor/patients-list'
import { Users } from 'lucide-react'

export default function DoctorPage() {
  return (
    <div className="container mx-auto px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <Users className="h-6 w-6 text-teal-600" />
          Meus Pacientes
        </h1>
        <p className="text-gray-600 mt-1">
          Selecione um paciente para visualizar seu dashboard de saúde
        </p>
      </div>

      {/* Patients List */}
      <PatientsList />
    </div>
  )
}
