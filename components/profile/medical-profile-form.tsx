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
} from 'lucide-react'
import { toast } from 'sonner'

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
  sleepQuality: number | null
  sleepIssues: string | null
  // Lifestyle - Stress
  stressLevel: number | null
  stressManagement: string | null
  // Exercise
  exerciseTypes: string[] | null
  exerciseFrequency: number | null
  exerciseDuration: number | null
  exerciseIntensity: string | null
  physicalLimitations: string | null
  // Functional Tests
  handgripStrength: number | null
  sitToStandTime: number | null
  // Nutrition
  currentDiet: string | null
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

export function MedicalProfileForm({ userId, onProfileSaved }: MedicalProfileFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
    sleepQuality: 5,
    sleepIssues: null,
    stressLevel: 5,
    stressManagement: null,
    exerciseTypes: [],
    exerciseFrequency: null,
    exerciseDuration: null,
    exerciseIntensity: null,
    physicalLimitations: null,
    handgripStrength: null,
    sitToStandTime: null,
    currentDiet: null,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Perfil Médico Completo
        </CardTitle>
        <CardDescription>
          Mantenha suas informações atualizadas para análises médicas mais precisas e personalizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || null)}
                  placeholder="Ex: 35"
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
                  placeholder="Ex: 70.5"
                />
              </div>

              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value) || null)}
                  placeholder="Ex: 175"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="systolicPressure">Pressão Sistólica (mmHg)</Label>
                <Input
                  id="systolicPressure"
                  type="number"
                  value={profile.systolicPressure || ''}
                  onChange={(e) => handleInputChange('systolicPressure', parseInt(e.target.value) || null)}
                  placeholder="Ex: 120"
                />
              </div>

              <div>
                <Label htmlFor="diastolicPressure">Pressão Diastólica (mmHg)</Label>
                <Input
                  id="diastolicPressure"
                  type="number"
                  value={profile.diastolicPressure || ''}
                  onChange={(e) => handleInputChange('diastolicPressure', parseInt(e.target.value) || null)}
                  placeholder="Ex: 80"
                />
              </div>

              <div>
                <Label htmlFor="restingHeartRate">Frequência Cardíaca em Repouso</Label>
                <Input
                  id="restingHeartRate"
                  type="number"
                  value={profile.restingHeartRate || ''}
                  onChange={(e) => handleInputChange('restingHeartRate', parseInt(e.target.value) || null)}
                  placeholder="Ex: 70"
                />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm space-y-1">
              <p className="font-medium text-green-900">📊 Valores de Referência:</p>
              <p className="text-green-800">
                <strong>Pressão Arterial:</strong> Ideal &lt; 120/80 mmHg | Normal &lt; 130/85 mmHg
              </p>
              <p className="text-green-800">
                <strong>Frequência Cardíaca:</strong> Normal 60-100 bpm | Atletas 40-60 bpm
              </p>
            </div>
          </div>

          <Separator />

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

          <Separator />

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sleepHours">Horas de Sono/Noite</Label>
                <Input
                  id="sleepHours"
                  type="number"
                  step="0.5"
                  value={profile.sleepHours || ''}
                  onChange={(e) => handleInputChange('sleepHours', parseFloat(e.target.value) || null)}
                  placeholder="Ex: 7.5"
                />
              </div>

              <div>
                <Label htmlFor="sleepQuality">Qualidade do Sono (1-10)</Label>
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
                <Label htmlFor="dailyWaterIntake" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Hidratação (L/dia)
                </Label>
                <Input
                  id="dailyWaterIntake"
                  type="number"
                  step="0.1"
                  value={profile.dailyWaterIntake || ''}
                  onChange={(e) => handleInputChange('dailyWaterIntake', parseFloat(e.target.value) || null)}
                  placeholder="Ex: 2.5"
                />
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

            <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3 text-sm space-y-1">
              <p className="font-medium text-indigo-900">💤 Recomendações:</p>
              <p className="text-indigo-800">
                <strong>Duração:</strong> Adultos precisam de 7-9 horas por noite. Qualidade é mais importante que quantidade.
              </p>
              <p className="text-indigo-800">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stressLevel">Nível de Estresse (1-10)</Label>
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
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-md p-3 text-sm space-y-1">
              <p className="font-medium text-purple-900">🧠 Impacto na Saúde:</p>
              <p className="text-purple-800">
                <strong>Estresse crônico:</strong> Aumenta cortisol, prejudica sono, eleva pressão arterial e enfraquece o sistema imunológico.
              </p>
              <p className="text-purple-800">
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

            <div>
              <Label className="mb-2">Exercícios Praticados</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newExerciseType}
                  onChange={(e) => setNewExerciseType(e.target.value)}
                  placeholder="Digite um tipo de exercício"
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addItem('exerciseTypes', newExerciseType))
                  }
                />
                <Button type="button" onClick={() => addItem('exerciseTypes', newExerciseType)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.exerciseTypes?.map((exercise, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {exercise}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('exerciseTypes', index)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="exerciseFrequency">Frequência (vezes/semana)</Label>
                <Input
                  id="exerciseFrequency"
                  type="number"
                  value={profile.exerciseFrequency || ''}
                  onChange={(e) => handleInputChange('exerciseFrequency', parseInt(e.target.value) || null)}
                  placeholder="Ex: 3"
                />
              </div>

              <div>
                <Label htmlFor="exerciseDuration">Duração (minutos)</Label>
                <Input
                  id="exerciseDuration"
                  type="number"
                  value={profile.exerciseDuration || ''}
                  onChange={(e) => handleInputChange('exerciseDuration', parseInt(e.target.value) || null)}
                  placeholder="Ex: 45"
                />
              </div>

              <div>
                <Label htmlFor="exerciseIntensity">Intensidade</Label>
                <Select
                  value={profile.exerciseIntensity || ''}
                  onValueChange={(value) => handleInputChange('exerciseIntensity', value)}
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

            <div className="bg-teal-50 border border-teal-200 rounded-md p-3 text-sm space-y-1">
              <p className="font-medium text-teal-900">🏃 Diretrizes OMS:</p>
              <p className="text-teal-800">
                <strong>Adultos:</strong> Mínimo de 150 minutos/semana de atividade moderada OU 75 minutos de atividade intensa.
              </p>
              <p className="text-teal-800">
                <strong>Benefícios:</strong> Reduz risco de doenças cardiovasculares, diabetes, câncer, ansiedade e depressão.
              </p>
            </div>
          </div>

          <Separator />

          {/* Testes Funcionais */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 mt-1 text-primary" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Biomarcadores Funcionais</h3>
                <p className="text-sm text-muted-foreground">
                  Testes que avaliam a integridade neuromuscular e predizem risco de sarcopenia e mortalidade
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Força de Preensão Manual */}
              <div className="space-y-2">
                <Label htmlFor="handgripStrength" className="text-base font-medium">
                  Força de Preensão Manual (kg)
                </Label>
                <Input
                  id="handgripStrength"
                  type="number"
                  step="0.1"
                  value={profile.handgripStrength || ''}
                  onChange={(e) => handleInputChange('handgripStrength', parseFloat(e.target.value) || null)}
                  placeholder="Ex: 35.5"
                />
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm space-y-2">
                  <p className="font-medium text-blue-900">📊 Sobre este teste:</p>
                  <p className="text-blue-800">
                    Biomarcador funcional que reflete a integridade do sistema neuromuscular geral.
                    Estudos mostram que baixa força de preensão é um preditor de mortalidade mais forte
                    que a massa muscular isoladamente.
                  </p>
                  <p className="text-blue-800">
                    <strong>Como fazer:</strong> Use um dinamômetro manual. Compare seus resultados
                    com valores normativos para sua idade e sexo. Quedas anuais são um sinal de alerta.
                  </p>
                </div>
              </div>

              {/* Teste de Sentar-Levantar */}
              <div className="space-y-2">
                <Label htmlFor="sitToStandTime" className="text-base font-medium">
                  Teste Sentar-Levantar 5x (segundos)
                </Label>
                <Input
                  id="sitToStandTime"
                  type="number"
                  step="0.1"
                  value={profile.sitToStandTime || ''}
                  onChange={(e) => handleInputChange('sitToStandTime', parseFloat(e.target.value) || null)}
                  placeholder="Ex: 12.5"
                />
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm space-y-2">
                  <p className="font-medium text-orange-900">📊 Sobre este teste:</p>
                  <p className="text-orange-800">
                    Mede a potência dos membros inferiores (Força x Velocidade). A perda de potência é
                    uma das primeiras manifestações de sarcopenia, ligada ao risco de quedas e perda de
                    independência.
                  </p>
                  <p className="text-orange-800">
                    <strong>Como fazer:</strong> Sente em uma cadeira (joelhos a 90°), braços cruzados
                    no peito. Levante e sente 5 vezes o mais rápido possível.
                    <strong> Alerta:</strong> Tempo &gt; 15s indica alto risco de sarcopenia.
                  </p>
                </div>
              </div>
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
              <Input
                id="currentDiet"
                value={profile.currentDiet || ''}
                onChange={(e) => handleInputChange('currentDiet', e.target.value)}
                placeholder="Ex: Mediterrânea, Vegana, Low-carb, Cetogênica..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm space-y-1">
              <p className="font-medium text-yellow-900">🥗 Nutrição de Qualidade:</p>
              <p className="text-yellow-800">
                <strong>Fundamentos:</strong> Priorize alimentos integrais, vegetais variados, proteínas de qualidade e gorduras saudáveis.
              </p>
              <p className="text-yellow-800">
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

          <Separator />

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

          {/* Botão de Salvar */}
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
        </form>
      </CardContent>
    </Card>
  )
}
