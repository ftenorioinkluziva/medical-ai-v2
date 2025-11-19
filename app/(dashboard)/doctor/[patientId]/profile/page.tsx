'use client'

/**
 * Doctor View - Patient Profile
 * Shows patient's medical profile for doctors
 */

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  User,
  Heart,
  Activity,
  Pill,
  AlertTriangle,
  Utensils,
  Moon,
  Dumbbell,
  ArrowLeft,
  Calendar,
  Edit,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePatient } from '@/lib/contexts/patient-context'

interface PageProps {
  params: Promise<{ patientId: string }>
}

interface MedicalProfile {
  id: string
  userId: string
  // Basic Info
  age?: number
  gender?: string
  height?: number
  weight?: number
  // Vital Signs
  systolicPressure?: number
  diastolicPressure?: number
  restingHeartRate?: number
  // Lifestyle - Sleep
  sleepHours?: number
  sleepQuality?: number
  sleepIssues?: string
  // Lifestyle - Stress
  stressLevel?: number
  stressManagement?: string
  // Exercise
  exerciseTypes?: string[]
  exerciseFrequency?: number
  exerciseDuration?: number
  exerciseIntensity?: string
  physicalLimitations?: string
  // Nutrition
  currentDiet?: string
  dailyWaterIntake?: number
  // Health
  medicalConditions?: string[]
  medications?: string[]
  allergies?: string[]
  surgeries?: string[]
  familyHistory?: string
  // Habits
  smokingStatus?: string
  smokingDetails?: string
  alcoholConsumption?: string
  // Goals
  healthObjectives?: string
  notes?: string
  // Timestamps
  createdAt?: string
  updatedAt?: string
}

export default function PatientProfilePage({ params }: PageProps) {
  const { patientId } = use(params)
  const { selectedPatient } = usePatient()
  const [profile, setProfile] = useState<MedicalProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [patientId])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/profile?patientId=${patientId}`)
      const data = await response.json()

      if (data.success) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateBMI = () => {
    if (!profile?.height || !profile?.weight) return null
    const heightInMeters = profile.height / 100
    const bmi = profile.weight / (heightInMeters * heightInMeters)
    return bmi.toFixed(1)
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-600' }
    if (bmi < 25) return { label: 'Peso normal', color: 'text-green-600' }
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600' }
    return { label: 'Obesidade', color: 'text-red-600' }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
            <p className="text-gray-600">Carregando perfil médico...</p>
          </div>
        </div>
      </div>
    )
  }

  const bmi = calculateBMI()
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null

  return (
    <div className="container mx-auto px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/doctor/${patientId}/dashboard`}>
              <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Perfil Médico - {selectedPatient?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Informações de saúde e histórico médico do paciente
          </p>
        </div>
        {profile && (
          <Link href={`/doctor/${patientId}/profile/edit`}>
            <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
              <Edit className="h-4 w-4" />
              Editar Perfil
            </Button>
          </Link>
        )}
      </div>

      {!profile ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Perfil não preenchido
            </h3>
            <p className="text-sm text-gray-600">
              O paciente ainda não preencheu seu perfil médico.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informações Básicas */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-teal-600" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {profile.age && (
                  <div>
                    <p className="text-sm text-gray-500">Idade</p>
                    <p className="font-semibold">{profile.age} anos</p>
                  </div>
                )}
                {profile.gender && (
                  <div>
                    <p className="text-sm text-gray-500">Sexo</p>
                    <p className="font-semibold">
                      {profile.gender === 'male' ? 'Masculino' : profile.gender === 'female' ? 'Feminino' : 'Outro'}
                    </p>
                  </div>
                )}
                {profile.height && (
                  <div>
                    <p className="text-sm text-gray-500">Altura</p>
                    <p className="font-semibold">{profile.height} cm</p>
                  </div>
                )}
                {profile.weight && (
                  <div>
                    <p className="text-sm text-gray-500">Peso</p>
                    <p className="font-semibold">{profile.weight} kg</p>
                  </div>
                )}
              </div>

              {bmi && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">IMC (Índice de Massa Corporal)</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{bmi}</p>
                      {bmiCategory && (
                        <Badge variant="outline" className={bmiCategory.color}>
                          {bmiCategory.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Sinais Vitais */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Sinais Vitais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(profile.systolicPressure || profile.diastolicPressure) && (
                <div>
                  <p className="text-sm text-gray-500">Pressão Arterial</p>
                  <p className="font-semibold">
                    {profile.systolicPressure}/{profile.diastolicPressure} mmHg
                  </p>
                </div>
              )}
              {profile.restingHeartRate && (
                <div>
                  <p className="text-sm text-gray-500">Frequência Cardíaca em Repouso</p>
                  <p className="font-semibold">{profile.restingHeartRate} bpm</p>
                </div>
              )}
              {!profile.systolicPressure && !profile.diastolicPressure && !profile.restingHeartRate && (
                <p className="text-sm text-gray-500">Nenhum sinal vital registrado</p>
              )}
            </CardContent>
          </Card>

          {/* Condições e Medicamentos */}
          <Card className="hover:shadow-md transition-shadow lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-purple-600" />
                Condições de Saúde e Medicamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.medicalConditions && profile.medicalConditions.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Condições Médicas</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.medicalConditions.map((condition, idx) => (
                      <Badge key={idx} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.medications && profile.medications.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Medicamentos em Uso</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.medications.map((med, idx) => (
                      <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {med}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.allergies && profile.allergies.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Alergias</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map((allergy, idx) => (
                      <Badge key={idx} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.surgeries && profile.surgeries.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Cirurgias Realizadas</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.surgeries.map((surgery, idx) => (
                      <Badge key={idx} variant="outline">
                        {surgery}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.familyHistory && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Histórico Familiar</p>
                  <p className="text-sm text-gray-700">{profile.familyHistory}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estilo de Vida - Sono */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-600" />
                Sono
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.sleepHours && (
                <div>
                  <p className="text-sm text-gray-500">Horas de Sono</p>
                  <p className="font-semibold">{profile.sleepHours}h por noite</p>
                </div>
              )}
              {profile.sleepQuality && (
                <div>
                  <p className="text-sm text-gray-500">Qualidade do Sono</p>
                  <p className="font-semibold">{profile.sleepQuality}/10</p>
                </div>
              )}
              {profile.sleepIssues && (
                <div>
                  <p className="text-sm text-gray-500">Problemas de Sono</p>
                  <p className="text-sm text-gray-700">{profile.sleepIssues}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercícios */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-blue-600" />
                Exercícios Físicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.exerciseTypes && profile.exerciseTypes.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tipos de Exercício</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.exerciseTypes.map((type, idx) => (
                      <Badge key={idx} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.exerciseFrequency && (
                <div>
                  <p className="text-sm text-gray-500">Frequência</p>
                  <p className="font-semibold">{profile.exerciseFrequency}x por semana</p>
                </div>
              )}
              {profile.exerciseDuration && (
                <div>
                  <p className="text-sm text-gray-500">Duração</p>
                  <p className="font-semibold">{profile.exerciseDuration} minutos</p>
                </div>
              )}
              {profile.exerciseIntensity && (
                <div>
                  <p className="text-sm text-gray-500">Intensidade</p>
                  <p className="font-semibold capitalize">{profile.exerciseIntensity}</p>
                </div>
              )}
              {profile.physicalLimitations && (
                <div>
                  <p className="text-sm text-gray-500">Limitações Físicas</p>
                  <p className="text-sm text-gray-700">{profile.physicalLimitations}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutrição */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-green-600" />
                Nutrição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.currentDiet && (
                <div>
                  <p className="text-sm text-gray-500">Dieta Atual</p>
                  <p className="text-sm text-gray-700">{profile.currentDiet}</p>
                </div>
              )}
              {profile.dailyWaterIntake && (
                <div>
                  <p className="text-sm text-gray-500">Ingestão de Água</p>
                  <p className="font-semibold">{profile.dailyWaterIntake}L por dia</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hábitos */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                Hábitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.smokingStatus && (
                <div>
                  <p className="text-sm text-gray-500">Tabagismo</p>
                  <p className="font-semibold capitalize">{profile.smokingStatus}</p>
                  {profile.smokingDetails && (
                    <p className="text-sm text-gray-600 mt-1">{profile.smokingDetails}</p>
                  )}
                </div>
              )}
              {profile.alcoholConsumption && (
                <div>
                  <p className="text-sm text-gray-500">Consumo de Álcool</p>
                  <p className="font-semibold capitalize">{profile.alcoholConsumption}</p>
                </div>
              )}
              {profile.stressLevel && (
                <div>
                  <p className="text-sm text-gray-500">Nível de Estresse</p>
                  <p className="font-semibold">{profile.stressLevel}/10</p>
                  {profile.stressManagement && (
                    <p className="text-sm text-gray-600 mt-1">Gerenciamento: {profile.stressManagement}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objetivos de Saúde */}
          {profile.healthObjectives && (
            <Card className="hover:shadow-md transition-shadow lg:col-span-2">
              <CardHeader>
                <CardTitle>Objetivos de Saúde</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.healthObjectives}</p>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {profile.notes && (
            <Card className="hover:shadow-md transition-shadow lg:col-span-2">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Última Atualização */}
          {profile.updatedAt && (
            <Card className="lg:col-span-2 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Última atualização:{' '}
                    {format(new Date(profile.updatedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
