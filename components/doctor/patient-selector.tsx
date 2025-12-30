'use client'

/**
 * Patient Selector Component
 * Allows doctors to select which patient they are viewing
 */

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { User, Search, ArrowLeft } from 'lucide-react'
import { usePatient } from '@/lib/contexts/patient-context'

interface Patient {
  id: string
  name: string
  email: string
  image?: string | null
  dateOfBirth?: Date | null
  documentsCount?: number
  analysesCount?: number
}

export function PatientSelector() {
  const router = useRouter()
  const params = useParams()
  const { selectedPatient, selectPatient } = usePatient()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    // Filter patients based on search
    if (search.trim() === '') {
      setFilteredPatients(patients)
    } else {
      const filtered = patients.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredPatients(filtered)
    }
  }, [search, patients])

  const loadPatients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/doctor/patients')
      const data = await response.json()

      if (data.success) {
        setPatients(data.patients || [])
        setFilteredPatients(data.patients || [])
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    if (patient) {
      selectPatient(patient)
      router.push(`/doctor/${patientId}/dashboard`)
    }
  }

  const handleBackToList = () => {
    router.push('/doctor')
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-white border-b">
        <User className="h-5 w-5 text-teal-600 animate-pulse" />
        <p className="text-sm text-gray-500">Carregando pacientes...</p>
      </div>
    )
  }

  return (
    <div className="bg-card border-b">
      <div className="container mx-auto px-4">
        {/* Mobile version - compact */}
        <div className="flex lg:hidden items-center justify-between py-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <User className="h-4 w-4 text-primary flex-shrink-0" />
            {selectedPatient ? (
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {selectedPatient.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{selectedPatient.name}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Nenhum paciente</p>
            )}
          </div>
          {selectedPatient && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleBackToList}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Desktop version - full */}
        <div className="hidden lg:flex items-center justify-between py-4">
          {/* Left side - Patient selector */}
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-primary" />

            {selectedPatient ? (
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Atendendo</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {selectedPatient.name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">{selectedPatient.name}</span>
                    <span className="text-sm text-muted-foreground">({selectedPatient.email})</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum paciente selecionado</p>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {selectedPatient && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Ver Todos os Pacientes
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
