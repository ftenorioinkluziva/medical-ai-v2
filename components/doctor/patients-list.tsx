'use client'

/**
 * Patients List Component
 * Displays all patients for doctor to select
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Search,
  FileText,
  Activity,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePatient } from '@/lib/contexts/patient-context'

interface Patient {
  id: string
  name: string
  email: string
  image?: string | null
  age?: number | null
  gender?: string | null
  documentsCount?: number
  analysesCount?: number
  lastActivity?: Date | null
  createdAt: Date
}

export function PatientsList() {
  const router = useRouter()
  const { selectPatient } = usePatient()
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
      const response = await fetch('/api/doctor/patients?limit=100')
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

  const handlePatientClick = (patient: Patient) => {
    selectPatient(patient)
    router.push(`/doctor/${patient.id}/dashboard`)
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
          <p className="text-gray-600">Carregando pacientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredPatients.length} {filteredPatients.length === 1 ? 'paciente' : 'pacientes'}
          {search && ` encontrado${filteredPatients.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </h3>
            <p className="text-sm text-gray-600">
              {search
                ? 'Tente buscar com outros termos'
                : 'Novos pacientes aparecerão aqui quando se cadastrarem'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => handlePatientClick(patient)}
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-lg">
                      {patient.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                      {patient.name || 'Sem nome'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{patient.email}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {(patient.age || patient.gender) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      {patient.age && <span>{patient.age} anos</span>}
                      {patient.age && patient.gender && <span>•</span>}
                      {patient.gender && (
                        <span>{patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : 'Outro'}</span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{patient.documentsCount || 0} docs</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Activity className="h-4 w-4" />
                      <span>{patient.analysesCount || 0} análises</span>
                    </div>
                  </div>

                  {/* Last activity */}
                  {patient.lastActivity && (
                    <div className="text-xs text-gray-500">
                      Última atividade:{' '}
                      {format(new Date(patient.lastActivity), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  )}
                </div>

                {/* Action */}
                <Button
                  className="w-full group-hover:bg-teal-700 bg-teal-600"
                  size="sm"
                >
                  Acessar Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
