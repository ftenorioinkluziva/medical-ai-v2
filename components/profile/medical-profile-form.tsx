'use client'

/**
 * Medical Profile Form Component
 * Comprehensive medical profile with lifestyle data
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  User,
  Heart,
  Pill,
  AlertTriangle,
  Plus,
  X,
  Save,
  Loader2,
  Activity,
  Brain,
  Droplets,
  Moon,
  Utensils,
  Cigarette,
  Target,
  Edit,
  Trash2,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

interface ExerciseActivity {
  type: string
  frequency: number
  duration: number
  intensity: string
}

interface MedicalProfile {
  id?: string
  userId: string
  // Basic Info
  age: number | null
  gender: string | null
  weight: number | null
  height: number | null
  // Vital Signs
  systolicPressure: number | null
  diastolicPressure: number | null
  restingHeartRate: number | null
  // Lifestyle - Sleep
  sleepHours: number | null
  napTime: number | null
  sleepQuality: number | null
  sleepIssues: string | null
  // Lifestyle - Stress
  stressLevel: number | null
  stressManagement: string | null
  morningSunlightExposure: string | null
  // Exercise (old fields for backward compatibility)
  exerciseTypes: string[] | null
  exerciseFrequency: number | null
  exerciseDuration: number | null
  exerciseIntensity: string | null
  // Exercise (new structure)
  exerciseActivities: ExerciseActivity[] | null
  physicalLimitations: string | null
  // Functional Tests
  handgripStrength: number | null
  sitToStandTime: number | null
  co2ToleranceTest: number | null
  vo2Max: number | null
  bodyFatPercentage: number | null
  // Nutrition
  currentDiet: string | null
  supplementation: string | null
  dailyWaterIntake: number | null
  // Health
  medicalConditions: string[] | null
  medications: string[] | null
  allergies: string[] | null
  surgeries: string[] | null
  familyHistory: string | null
  // Habits
  smokingStatus: string | null
  smokingDetails: string | null
  alcoholConsumption: string | null
  // Goals
  healthObjectives: string | null
  notes: string | null
}

interface MedicalProfileFormProps {
  userId: string
  onProfileSaved?: (profile: MedicalProfile) => void
}

// Helper function to calculate FFMI
function calculateFFMI(weight: number | null, height: number | null, bodyFatPercentage: number | null): number | null {
  if (!weight || !height || bodyFatPercentage === null) return null

  const fatMass = weight * (bodyFatPercentage / 100)
  const leanMass = weight - fatMass
  const heightInMeters = height / 100
  const ffmi = leanMass / (heightInMeters * heightInMeters)

  return Number(ffmi.toFixed(1))
}

// Helper function to calculate profile completion
function calculateProfileCompletion(profile: MedicalProfile): number {
  const fields = [
    // Basic Info (20%)
    profile.age,
    profile.gender,
    profile.weight,
    profile.height,

    // Vital Signs (15%)
    profile.systolicPressure,
    profile.diastolicPressure,
    profile.restingHeartRate,

    // Lifestyle (30%)
    profile.sleepHours,
    profile.sleepQuality,
    profile.stressLevel,
    profile.exerciseActivities && profile.exerciseActivities.length > 0,
    profile.currentDiet,

    // Health (20%)
    profile.medicalConditions && profile.medicalConditions.length > 0,
    profile.medications && profile.medications.length > 0,
    profile.allergies && profile.allergies.length > 0,

    // Functional Tests (10%)
    profile.handgripStrength,
    profile.sitToStandTime,

    // Goals (5%)
    profile.healthObjectives,
  ]

  const filledFields = fields.filter(field => {
    if (typeof field === 'boolean') return field
    return field !== null && field !== undefined && field !== ''
  }).length

  return Math.round((filledFields / fields.length) * 100)
}

export function MedicalProfileForm({ userId, onProfileSaved }: MedicalProfileFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [profile, setProfile] = useState<MedicalProfile>({
    userId,
    age: null,
    gender: null,
    weight: null,
    height: null,
    systolicPressure: null,
    diastolicPressure: null,
    restingHeartRate: null,
    sleepHours: null,
    napTime: null,
    sleepQuality: 5,
    sleepIssues: null,
    stressLevel: 5,
    stressManagement: null,
    morningSunlightExposure: null,
    exerciseTypes: [],
    exerciseFrequency: null,
    exerciseDuration: null,
    exerciseIntensity: null,
    exerciseActivities: [],
    physicalLimitations: null,
    handgripStrength: null,
    sitToStandTime: null,
    co2ToleranceTest: null,
    vo2Max: null,
    bodyFatPercentage: null,
    currentDiet: null,
    supplementation: null,
    dailyWaterIntake: null,
    medicalConditions: [],
    medications: [],
    allergies: [],
    surgeries: [],
    familyHistory: null,
    smokingStatus: null,
    smokingDetails: null,
    alcoholConsumption: null,
    healthObjectives: null,
    notes: null,
  })

  // Estados para novos itens
  const [newAllergy, setNewAllergy] = useState('')
  const [newMedication, setNewMedication] = useState('')
  const [newCondition, setNewCondition] = useState('')
  const [newExerciseType, setNewExerciseType] = useState('')
  const [newSurgery, setNewSurgery] = useState('')

  // Estados para nova atividade física
  const [newActivity, setNewActivity] = useState({
    type: '',
    frequency: 1,
    duration: 30,
    intensity: 'moderada' as string,
  })
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null)

  // Estado para distância do Cooper (VO2)
  const [cooperDistance, setCooperDistance] = useState<number | string>('')

  // Sincronizar distância do perfil se existir VO2 salvo
  useEffect(() => {
    if (profile.vo2Max && !cooperDistance && !loading) {
      // Fórmula inversa: d = VO2 * 44.73 + 504.9
      const dist = Math.round(profile.vo2Max * 44.73 + 504.9)
      setCooperDistance(dist)
    }
  }, [profile.vo2Max, loading])

  const handleDistanceChange = (value: string) => {
    setCooperDistance(value)
    const dist = parseFloat(value)
    if (dist && dist > 0) {
      // Fórmula: VO2 = (d - 504.9) / 44.73
      // Se d < 504.9, o VO2 seria negativo, então limitamos a 0 ou null
      const vo2 = Math.max(0, (dist - 504.9) / 44.73)
      handleInputChange('vo2Max', Number(vo2.toFixed(1)))
    } else {
      handleInputChange('vo2Max', null)
    }
  }

  // Carregar perfil existente
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const endpoint = userId
          ? `/api/profile?patientId=${userId}`
          : '/api/profile'
        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error('Erro ao carregar perfil')
        }

        const data = await response.json()

        if (data.profile) {
          setProfile({
            ...data.profile,
            allergies: data.profile.allergies || [],
            medications: data.profile.medications || [],
            medicalConditions: data.profile.medicalConditions || [],
            exerciseTypes: data.profile.exerciseTypes || [],
            exerciseActivities: data.profile.exerciseActivities || [],
            surgeries: data.profile.surgeries || [],
          })
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        toast.error('Erro ao carregar perfil médico')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [userId])

  // Auto-save with debounce
  useEffect(() => {
    if (loading) return // Don't auto-save while loading initial data

    const timer = setTimeout(async () => {
      try {
        setAutoSaving(true)
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...profile,
            patientId: userId,
          }),
        })

        if (response.ok) {
          setLastSaved(new Date())
        }
      } catch (error) {
        console.error('Auto-save error:', error)
      } finally {
        setAutoSaving(false)
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(timer)
  }, [profile, userId, loading])

  const handleInputChange = (field: keyof MedicalProfile, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addItem = (
    field: 'allergies' | 'medications' | 'medicalConditions' | 'exerciseTypes' | 'surgeries',
    value: string
  ) => {
    if (value.trim()) {
      setProfile((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()],
      }))

      // Limpar o campo correspondente
      if (field === 'allergies') setNewAllergy('')
      if (field === 'medications') setNewMedication('')
      if (field === 'medicalConditions') setNewCondition('')
      if (field === 'exerciseTypes') setNewExerciseType('')
      if (field === 'surgeries') setNewSurgery('')
    }
  }

  const removeItem = (
    field: 'allergies' | 'medications' | 'medicalConditions' | 'exerciseTypes' | 'surgeries',
    index: number
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }))
  }

  // Funções para gerenciar atividades físicas
  const addActivity = () => {
    if (!newActivity.type.trim()) {
      toast.error('Digite o tipo de atividade')
      return
    }

    setProfile((prev) => ({
      ...prev,
      exerciseActivities: [...(prev.exerciseActivities || []), { ...newActivity }],
    }))

    // Reset form
    setNewActivity({
      type: '',
      frequency: 1,
      duration: 30,
      intensity: 'moderada',
    })
    toast.success('Atividade adicionada')
  }

  const removeActivity = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      exerciseActivities: (prev.exerciseActivities || []).filter((_, i) => i !== index),
    }))
    toast.success('Atividade removida')
  }

  const startEditActivity = (index: number) => {
    const activity = profile.exerciseActivities?.[index]
    if (activity) {
      setNewActivity({ ...activity })
      setEditingActivityIndex(index)
    }
  }

  const saveEditActivity = () => {
    if (editingActivityIndex === null) return
    if (!newActivity.type.trim()) {
      toast.error('Digite o tipo de atividade')
      return
    }

    setProfile((prev) => {
      const activities = [...(prev.exerciseActivities || [])]
      activities[editingActivityIndex] = { ...newActivity }
      return {
        ...prev,
        exerciseActivities: activities,
      }
    })

    // Reset form
    setNewActivity({
      type: '',
      frequency: 1,
      duration: 30,
      intensity: 'moderada',
    })
    setEditingActivityIndex(null)
    toast.success('Atividade atualizada')
  }

  const cancelEditActivity = () => {
    setNewActivity({
      type: '',
      frequency: 1,
      duration: 30,
      intensity: 'moderada',
    })
    setEditingActivityIndex(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          patientId: userId, // Include patientId for doctors editing patient profiles
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar perfil')
      }

      const data = await response.json()
      toast.success('Perfil médico salvo com sucesso!')
      onProfileSaved?.(data.profile)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast.error('Erro ao salvar perfil médico')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando perfil médico...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const completion = calculateProfileCompletion(profile)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil Médico Completo
            </CardTitle>
            <CardDescription>
              Mantenha suas informações atualizadas para análises médicas mais precisas
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <div className="text-sm font-medium">
              {completion}% completo
            </div>
            {autoSaving && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Salvando...
              </div>
            )}
            {!autoSaving && lastSaved && (
              <div className="text-xs text-muted-foreground">
                Salvo {new Date(lastSaved).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
        <Progress value={completion} className="mt-4" />
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-100"
            >
              Básico
            </TabsTrigger>
            <TabsTrigger
              value="health"
              className="data-[state=active]:bg-red-100 data-[state=active]:text-red-900 dark:data-[state=active]:bg-red-900/30 dark:data-[state=active]:text-red-100"
            >
              Saúde
            </TabsTrigger>
            <TabsTrigger
              value="lifestyle"
              className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 dark:data-[state=active]:bg-green-900/30 dark:data-[state=active]:text-green-100"
            >
              Estilo de Vida
            </TabsTrigger>
            <TabsTrigger
              value="tests"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-100"
            >
              Testes
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-100"
            >
              Objetivos
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-6 mt-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age || ''}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value) || null)}
                      placeholder="35"
                      className="max-w-[120px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gênero</Label>
                    <Select value={profile.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                        <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={profile.weight || ''}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || null)}
                      placeholder="70.5"
                      className="max-w-[140px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profile.height || ''}
                      onChange={(e) => handleInputChange('height', parseInt(e.target.value) || null)}
                      placeholder="175"
                      className="max-w-[140px]"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sinais Vitais */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 mt-1 text-primary" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Sinais Vitais</h3>
                    <p className="text-sm text-muted-foreground">
                      Indicadores fundamentais da sua saúde cardiovascular e metabólica
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="systolicPressure">Pressão Sistólica</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="systolicPressure"
                        type="number"
                        value={profile.systolicPressure || ''}
                        onChange={(e) => handleInputChange('systolicPressure', parseInt(e.target.value) || null)}
                        placeholder="120"
                        className="max-w-[140px]"
                      />
                      <span className="text-sm text-muted-foreground">mmHg</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="diastolicPressure">Pressão Diastólica</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="diastolicPressure"
                        type="number"
                        value={profile.diastolicPressure || ''}
                        onChange={(e) => handleInputChange('diastolicPressure', parseInt(e.target.value) || null)}
                        placeholder="80"
                        className="max-w-[140px]"
                      />
                      <span className="text-sm text-muted-foreground">mmHg</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="restingHeartRate">Frequência Cardíaca</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="restingHeartRate"
                        type="number"
                        value={profile.restingHeartRate || ''}
                        onChange={(e) => handleInputChange('restingHeartRate', parseInt(e.target.value) || null)}
                        placeholder="70"
                        className="max-w-[140px]"
                      />
                      <span className="text-sm text-muted-foreground">bpm</span>
                    </div>
                  </div>
                </div>
                {/* Ajustar o dark mode */}
                <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm space-y-1 dark:bg-green-900/10 dark:border-green-900/20">
                  <p className="font-medium text-green-900  dark:text-green-600">📊 Valores de Referência:</p>
                  <p className="text-green-800">
                    <strong>Pressão Arterial:</strong> Ideal &lt; 120/80 mmHg | Normal &lt; 130/85 mmHg
                  </p>
                  <p className="text-green-800">
                    <strong>Frequência Cardíaca:</strong> Normal 60-100 bpm | Atletas 40-60 bpm
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-6 mt-6">
              {/* Saúde */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Condições de Saúde
                </h3>

                {/* Alergias */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Alergias
                  </Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Digite uma alergia"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('allergies', newAllergy))}
                    />
                    <Button type="button" onClick={() => addItem('allergies', newAllergy)} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies?.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center gap-1">
                        {allergy}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('allergies', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Medicamentos */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Pill className="h-4 w-4" />
                    Medicamentos Atuais
                  </Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Digite um medicamento"
                      onKeyPress={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), addItem('medications', newMedication))
                      }
                    />
                    <Button type="button" onClick={() => addItem('medications', newMedication)} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.medications?.map((medication, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {medication}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('medications', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Condições Médicas */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4" />
                    Condições Médicas
                  </Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      placeholder="Digite uma condição médica"
                      onKeyPress={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), addItem('medicalConditions', newCondition))
                      }
                    />
                    <Button type="button" onClick={() => addItem('medicalConditions', newCondition)} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.medicalConditions?.map((condition, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {condition}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('medicalConditions', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Cirurgias */}
                <div>
                  <Label className="mb-2">Cirurgias Prévias</Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newSurgery}
                      onChange={(e) => setNewSurgery(e.target.value)}
                      placeholder="Digite uma cirurgia"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('surgeries', newSurgery))}
                    />
                    <Button type="button" onClick={() => addItem('surgeries', newSurgery)} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.surgeries?.map((surgery, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {surgery}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('surgeries', index)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Histórico Familiar */}
                <div>
                  <Label htmlFor="familyHistory">Histórico Familiar</Label>
                  <Textarea
                    id="familyHistory"
                    value={profile.familyHistory || ''}
                    onChange={(e) => handleInputChange('familyHistory', e.target.value)}
                    placeholder="Doenças ou condições médicas na família (diabetes, hipertensão, câncer...)"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lifestyle" className="space-y-6 mt-6">
              {/* Estilo de Vida - Sono */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Moon className="h-5 w-5 mt-1 text-primary" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Sono e Descanso</h3>
                    <p className="text-sm text-muted-foreground">
                      O sono de qualidade é essencial para recuperação, função cognitiva e saúde metabólica
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="sleepHours">Horas de Sono</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sleepHours"
                        type="number"
                        step="0.5"
                        value={profile.sleepHours || ''}
                        onChange={(e) => handleInputChange('sleepHours', parseFloat(e.target.value) || null)}
                        placeholder="7.5"
                        className="max-w-[120px]"
                      />
                      <span className="text-sm text-muted-foreground">h/noite</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="napTime">Tempo de Soneca</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="napTime"
                        type="number"
                        value={profile.napTime || ''}
                        onChange={(e) => handleInputChange('napTime', parseInt(e.target.value) || null)}
                        placeholder="30"
                        className="max-w-[120px]"
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sleepQuality">Qualidade do Sono</Label>
                    <Select
                      value={String(profile.sleepQuality || 5)}
                      onValueChange={(value) => handleInputChange('sleepQuality', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num} - {num <= 3 ? 'Ruim' : num <= 6 ? 'Regular' : num <= 8 ? 'Boa' : 'Excelente'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dailyWaterIntake">Hidratação</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="dailyWaterIntake"
                        type="number"
                        step="0.1"
                        value={profile.dailyWaterIntake || ''}
                        onChange={(e) => handleInputChange('dailyWaterIntake', parseFloat(e.target.value) || null)}
                        placeholder="2.5"
                        className="max-w-[120px]"
                      />
                      <span className="text-sm text-muted-foreground">L/dia</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sleepIssues">Problemas de Sono</Label>
                  <Input
                    id="sleepIssues"
                    value={profile.sleepIssues || ''}
                    onChange={(e) => handleInputChange('sleepIssues', e.target.value)}
                    placeholder="Ex: Insônia, apneia do sono, roncos..."
                  />
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3 text-sm space-y-1 dark:bg-indigo-900/10 dark:border-indigo-900/20">
                  <p className="font-medium text-indigo-900 dark:text-indigo-400">💤 Recomendações:</p>
                  <p className="text-indigo-800 dark:text-indigo-600">
                    <strong>Duração:</strong> Adultos precisam de 7-9 horas por noite. Qualidade é mais importante que quantidade.
                  </p>
                  <p className="text-indigo-800 dark:text-indigo-600">
                    <strong>Impacto:</strong> Sono inadequado está associado a obesidade, diabetes, doenças cardiovasculares e declínio cognitivo.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Estresse */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 mt-1 text-primary" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Estresse e Bem-Estar Mental</h3>
                    <p className="text-sm text-muted-foreground">
                      O estresse crônico impacta diretamente sua saúde física, imunidade e qualidade de vida
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stressLevel">Nível de Estresse</Label>
                    <Select
                      value={String(profile.stressLevel || 5)}
                      onValueChange={(value) => handleInputChange('stressLevel', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num} - {num <= 3 ? 'Baixo' : num <= 6 ? 'Moderado' : num <= 8 ? 'Alto' : 'Muito Alto'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="stressManagement">Manejo do Estresse</Label>
                    <Input
                      id="stressManagement"
                      value={profile.stressManagement || ''}
                      onChange={(e) => handleInputChange('stressManagement', e.target.value)}
                      placeholder="Ex: Meditação, yoga, terapia..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="morningSunlightExposure">Luz Solar Matinal</Label>
                    <Select
                      value={profile.morningSunlightExposure || ''}
                      onValueChange={(value) => handleInputChange('morningSunlightExposure', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Sim (primeiros 60min)</SelectItem>
                        <SelectItem value="no">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-md p-3 text-sm space-y-1 dark:bg-purple-900/10 dark:border-purple-900/20">
                  <p className="font-medium text-purple-900 dark:text-purple-400">🧠 Impacto na Saúde:</p>
                  <p className="text-purple-800 dark:text-purple-600">
                    <strong>Estresse crônico:</strong> Aumenta cortisol, prejudica sono, eleva pressão arterial e enfraquece o sistema imunológico.
                  </p>
                  <p className="text-purple-800 dark:text-purple-600">
                    <strong>Gestão:</strong> Práticas como mindfulness, exercício regular e sono adequado são essenciais para redução do estresse.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Exercícios */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 mt-1 text-primary" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Atividade Física</h3>
                    <p className="text-sm text-muted-foreground">
                      Exercício regular previne doenças crônicas, melhora função cognitiva e aumenta longevidade
                    </p>
                  </div>
                </div>

                {/* Nova Atividade Form */}
                <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
                  <Label className="text-base font-medium">
                    {editingActivityIndex !== null ? 'Editar Atividade' : 'Adicionar Nova Atividade'}
                  </Label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="activityType">Tipo</Label>
                      <Input
                        id="activityType"
                        value={newActivity.type}
                        onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                        placeholder="Musculação, Corrida..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            editingActivityIndex !== null ? saveEditActivity() : addActivity()
                          }
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="activityFrequency">Frequência</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="activityFrequency"
                          type="number"
                          min="1"
                          max="7"
                          value={newActivity.frequency}
                          onChange={(e) =>
                            setNewActivity({ ...newActivity, frequency: parseInt(e.target.value) || 1 })
                          }
                          placeholder="3"
                          className="max-w-[100px]"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">x/sem</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="activityDuration">Duração</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="activityDuration"
                          type="number"
                          min="1"
                          value={newActivity.duration}
                          onChange={(e) =>
                            setNewActivity({ ...newActivity, duration: parseInt(e.target.value) || 30 })
                          }
                          placeholder="45"
                          className="max-w-[100px]"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="activityIntensity">Intensidade</Label>
                      <Select
                        value={newActivity.intensity}
                        onValueChange={(value) => setNewActivity({ ...newActivity, intensity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="leve">Leve</SelectItem>
                          <SelectItem value="moderada">Moderada</SelectItem>
                          <SelectItem value="intensa">Intensa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {editingActivityIndex !== null ? (
                      <>
                        <Button type="button" onClick={saveEditActivity} size="sm" variant="default">
                          <Check className="h-4 w-4 mr-1" />
                          Salvar Alterações
                        </Button>
                        <Button type="button" onClick={cancelEditActivity} size="sm" variant="outline">
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button type="button" onClick={addActivity} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Atividade
                      </Button>
                    )}
                  </div>
                </div>

                {/* Lista de Atividades */}
                {profile.exerciseActivities && profile.exerciseActivities.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Atividades Cadastradas</Label>
                    <div className="grid gap-3">
                      {profile.exerciseActivities.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                            <div>
                              <p className="text-sm font-medium">{activity.type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Frequência</p>
                              <p className="text-sm">{activity.frequency}x/semana</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Duração</p>
                              <p className="text-sm">{activity.duration} min</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Intensidade</p>
                              <Badge
                                variant={
                                  activity.intensity === 'intensa'
                                    ? 'destructive'
                                    : activity.intensity === 'moderada'
                                      ? 'default'
                                      : 'secondary'
                                }
                              >
                                {activity.intensity}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditActivity(index)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeActivity(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="physicalLimitations">Limitações Físicas ou Restrições</Label>
                  <Textarea
                    id="physicalLimitations"
                    value={profile.physicalLimitations || ''}
                    onChange={(e) => handleInputChange('physicalLimitations', e.target.value)}
                    placeholder="Descreva limitações físicas, lesões ou restrições médicas para exercícios..."
                    rows={3}
                  />
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-md p-3 text-sm space-y-1 dark:bg-teal-900/10 dark:border-teal-900/20">
                  <p className="font-medium text-teal-900 dark:text-teal-400">🏃 Diretrizes OMS:</p>
                  <p className="text-teal-800 dark:text-teal-600">
                    <strong>Adultos:</strong> Mínimo de 150 minutos/semana de atividade moderada OU 75 minutos de atividade intensa.
                  </p>
                  <p className="text-teal-800 dark:text-teal-600">
                    <strong>Benefícios:</strong> Reduz risco de doenças cardiovasculares, diabetes, câncer, ansiedade e depressão.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Nutrição */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Utensils className="h-5 w-5 mt-1 text-primary" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Nutrição</h3>
                    <p className="text-sm text-muted-foreground">
                      Alimentação balanceada é fundamental para energia, imunidade e prevenção de doenças
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="currentDiet">Dieta Atual</Label>
                  <Textarea
                    id="currentDiet"
                    value={profile.currentDiet || ''}
                    onChange={(e) => handleInputChange('currentDiet', e.target.value)}
                    placeholder="Descreva sua dieta atual: tipo de alimentação, padrões alimentares, restrições, etc. (Ex: Mediterrânea com foco em vegetais e peixes, redução de carboidratos refinados...)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="supplementation">Suplementação</Label>
                  <Textarea
                    id="supplementation"
                    value={profile.supplementation || ''}
                    onChange={(e) => handleInputChange('supplementation', e.target.value)}
                    placeholder="Liste os suplementos que você toma, dosagens e frequência (Ex: Vitamina D 5000 UI/dia, Ômega 3 1g 2x/dia, Magnésio 400mg antes de dormir...)"
                    rows={3}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm space-y-1 dark:bg-yellow-900/10 dark:border-yellow-900/20">
                  <p className="font-medium text-yellow-900 dark:text-yellow-600">🥗 Nutrição de Qualidade:</p>
                  <p className="text-yellow-800 dark:text-yellow-400">
                    <strong>Fundamentos:</strong> Priorize alimentos integrais, vegetais variados, proteínas de qualidade e gorduras saudáveis.
                  </p>
                  <p className="text-yellow-800 dark:text-yellow-400">
                    <strong>Evite:</strong> Alimentos ultraprocessados, excesso de açúcar e gorduras trans estão associados a inflamação crônica e doenças metabólicas.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Hábitos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Cigarette className="h-5 w-5" />
                  Hábitos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smokingStatus">Status de Tabagismo</Label>
                    <Select
                      value={profile.smokingStatus || ''}
                      onValueChange={(value) => handleInputChange('smokingStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nunca_fumou">Nunca fumou</SelectItem>
                        <SelectItem value="fumante">Fumante</SelectItem>
                        <SelectItem value="ex_fumante">Ex-fumante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="alcoholConsumption">Consumo de Álcool</Label>
                    <Select
                      value={profile.alcoholConsumption || ''}
                      onValueChange={(value) => handleInputChange('alcoholConsumption', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nao_bebe">Não bebe</SelectItem>
                        <SelectItem value="social">Social (ocasionalmente)</SelectItem>
                        <SelectItem value="moderado">Moderado (1-2x por semana)</SelectItem>
                        <SelectItem value="frequente">Frequente (3+ vezes por semana)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {profile.smokingStatus && profile.smokingStatus !== 'nunca_fumou' && (
                  <div>
                    <Label htmlFor="smokingDetails">Detalhes do Tabagismo</Label>
                    <Textarea
                      id="smokingDetails"
                      value={profile.smokingDetails || ''}
                      onChange={(e) => handleInputChange('smokingDetails', e.target.value)}
                      placeholder="Ex: 1 maço por dia, parou há 2 anos..."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tests" className="space-y-6 mt-6">
              {/* Testes Funcionais */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 mt-1 text-primary" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Biomarcadores Funcionais</h3>
                    <p className="text-sm text-muted-foreground">
                      Testes que avaliam capacidade cardiorrespiratória, integridade neuromuscular e composição corporal
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="handgripStrength" className="text-base font-medium">
                      Força de Preensão Manual
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="handgripStrength"
                        type="number"
                        step="0.1"
                        value={profile.handgripStrength || ''}
                        onChange={(e) => handleInputChange('handgripStrength', parseFloat(e.target.value) || null)}
                        placeholder="35.5"
                        className="max-w-[140px]"
                      />
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm space-y-2 dark:bg-blue-900/10 dark:border-blue-900/20">
                      <p className="font-medium text-blue-900 dark:text-blue-400">📊 Sobre este teste:</p>
                      <p className="text-blue-800 dark:text-blue-600">
                        Biomarcador funcional que reflete a integridade do sistema neuromuscular geral.
                        Estudos mostram que baixa força de preensão é um preditor de mortalidade mais forte
                        que a massa muscular isoladamente.
                      </p>
                      <p className="text-blue-800 dark:text-blue-600">
                        <strong>Como fazer:</strong> Use um dinamômetro manual. Compare seus resultados
                        com valores normativos para sua idade e sexo. Quedas anuais são um sinal de alerta.
                      </p>
                    </div>
                  </div>

                  {/* Teste de Sentar-Levantar */}
                  <div className="space-y-2">
                    <Label htmlFor="sitToStandTime" className="text-base font-medium">
                      Teste Sentar-Levantar 5x
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sitToStandTime"
                        type="number"
                        step="0.1"
                        value={profile.sitToStandTime || ''}
                        onChange={(e) => handleInputChange('sitToStandTime', parseFloat(e.target.value) || null)}
                        placeholder="12.5"
                        className="max-w-[140px]"
                      />
                      <span className="text-sm text-muted-foreground">seg</span>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm space-y-2 dark:bg-orange-900/10 dark:border-orange-900/20">
                      <p className="font-medium text-orange-900 dark:text-orange-400">📊 Sobre este teste:</p>
                      <p className="text-orange-800 dark:text-orange-600">
                        Mede a potência dos membros inferiores (Força x Velocidade). A perda de potência é
                        uma das primeiras manifestações de sarcopenia, ligada ao risco de quedas e perda de
                        independência.
                      </p>
                      <p className="text-orange-800 dark:text-orange-600">
                        <strong>Como fazer:</strong> Sente em uma cadeira (joelhos a 90°), braços cruzados
                        no peito. Levante e sente 5 vezes o mais rápido possível.
                        <strong> Alerta:</strong> Tempo &gt; 15s indica alto risco de sarcopenia.
                      </p>
                    </div>
                  </div>

                  {/* Teste de Tolerância ao CO2 */}
                  <div className="space-y-2">
                    <Label htmlFor="co2ToleranceTest" className="text-base font-medium">
                      Teste de Tolerância ao CO2
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="co2ToleranceTest"
                        type="number"
                        step="0.1"
                        value={profile.co2ToleranceTest || ''}
                        onChange={(e) => handleInputChange('co2ToleranceTest', parseFloat(e.target.value) || null)}
                        placeholder="40"
                        className="max-w-[140px]"
                      />
                      <span className="text-sm text-muted-foreground">seg</span>
                    </div>
                    <div className="bg-cyan-50 border border-cyan-200 rounded-md p-3 text-sm space-y-2 dark:bg-cyan-900/10 dark:border-cyan-900/20">
                      <p className="font-medium text-cyan-900 dark:text-cyan-400">📊 Sobre este teste:</p>
                      <p className="text-cyan-800 dark:text-cyan-600">
                        Avalia a tolerância ao CO2 e controle autonômico. Maior tolerância indica melhor
                        controle da respiração e menor estresse no sistema nervoso.
                      </p>
                      <p className="text-cyan-800 dark:text-cyan-600">
                        <strong>Como fazer:</strong> Inspire ao máximo, expire o mais lentamente possível.
                        Cronometre. <strong>Referência:</strong> &lt;25s (Recuperação ruim/Estresse alto) | &gt;65s (Excelente controle)
                      </p>
                    </div>
                  </div>

                  {/* VO2 Máx */}
                  {/* VO2 Máx (Via Teste de Cooper) */}
                  <div className="space-y-2">
                    <Label htmlFor="cooperDistance" className="text-base font-medium">
                      Distância em 12 min (metros) (Teste de Cooper)
                    </Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Input
                          id="cooperDistance"
                          type="number"
                          value={cooperDistance}
                          onChange={(e) => handleDistanceChange(e.target.value)}
                          placeholder="Ex: 2400"
                          className="max-w-[140px]"
                        />
                        <span className="text-sm text-muted-foreground">metros</span>
                      </div>

                      {/* Feedback Visual Automático */}
                      {profile.vo2Max !== null && profile.vo2Max > 0 && (
                        <div className={`text-sm font-medium flex items-center gap-2 p-2 rounded-md ${(profile.gender === 'masculino' && profile.vo2Max > 50) ||
                          (profile.gender === 'feminino' && profile.vo2Max > 45)
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                          <Activity className="h-4 w-4" />
                          VO₂ estimado: {profile.vo2Max} ml/kg/min
                          <span className="text-xs font-normal opacity-80">
                            {((profile.gender === 'masculino' && profile.vo2Max > 50) ||
                              (profile.gender === 'feminino' && profile.vo2Max > 45))
                              ? '(Excelente)'
                              : '(A melhorar)'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-sm space-y-2 dark:bg-emerald-900/10 dark:border-emerald-900/20">
                      <p className="font-medium text-emerald-900 dark:text-emerald-400">📊 Sobre este teste:</p>
                      <p className="text-emerald-800 dark:text-emerald-600">
                        Capacidade aeróbica máxima - forte preditor de longevidade. Quanto maior, melhor
                        sua resistência e saúde cardiovascular.
                      </p>
                      <p className="text-emerald-800 dark:text-emerald-600">
                        <strong>Teste:</strong> Corra a maior distância possível em 12 minutos.
                        <strong> Ideal:</strong> Homens &gt;50 | Mulheres &gt;45 (VO₂ Máx)
                      </p>
                    </div>
                  </div>

                  {/* Percentual de Gordura Corporal e FFMI */}
                  <div className="space-y-2">
                    <Label htmlFor="bodyFatPercentage" className="text-base font-medium">
                      Percentual de Gordura Corporal
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="bodyFatPercentage"
                        type="number"
                        step="0.1"
                        value={profile.bodyFatPercentage || ''}
                        onChange={(e) => handleInputChange('bodyFatPercentage', parseFloat(e.target.value) || null)}
                        placeholder="18.5"
                        className="max-w-[140px]"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    {profile.bodyFatPercentage !== null && profile.weight && profile.height && (
                      <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-md dark:bg-indigo-900/10 dark:border-indigo-900/20">
                        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-400">
                          FFMI Calculado: {calculateFFMI(profile.weight, profile.height, profile.bodyFatPercentage)}
                        </p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-500 mt-1">
                          {profile.gender === 'masculino'
                            ? 'Ideal: >20 | Sinal de Alerta: <17'
                            : 'Ideal: >18 | Sinal de Alerta: <15'}
                        </p>
                      </div>
                    )}
                    <div className="bg-violet-50 border border-violet-200 rounded-md p-3 text-sm space-y-2 dark:bg-violet-900/10 dark:border-violet-900/20">
                      <p className="font-medium text-violet-900 dark:text-violet-400">📊 FFMI (Índice de Massa Livre de Gordura):</p>
                      <p className="text-violet-800 dark:text-violet-600">
                        Avalia a quantidade de massa magra em relação à altura. Mais importante que IMC
                        para avaliação de saúde e longevidade.
                      </p>
                      <p className="text-violet-800 dark:text-violet-600">
                        <strong>Medição:</strong> Bioimpedância, dobras cutâneas ou DEXA scan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6 mt-6">
              {/* Objetivos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Objetivos de Saúde</h3>
                <div>
                  <Label htmlFor="healthObjectives">Seus Objetivos</Label>
                  <Textarea
                    id="healthObjectives"
                    value={profile.healthObjectives || ''}
                    onChange={(e) => handleInputChange('healthObjectives', e.target.value)}
                    placeholder="Descreva seus objetivos de saúde (ex: perder peso, ganhar massa muscular, melhorar performance, controlar diabetes...)"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Observações Adicionais</Label>
                  <Textarea
                    id="notes"
                    value={profile.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Informações adicionais relevantes para sua saúde..."
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Botão de Salvar */}
            <div className="mt-6">
              <Button type="submit" className="w-full" size="lg" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Perfil Médico
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  )
}
