/**
 * Doctor Layout
 * Layout for doctor-specific pages with patient selector
 */

import { PatientSelector } from '@/components/doctor/patient-selector'

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSelector />
      <div className="py-6">
        {children}
      </div>
    </div>
  )
}
