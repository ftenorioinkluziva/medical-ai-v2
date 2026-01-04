import { pgTable, uuid, varchar, integer, real, text, json, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

// Medical Profiles table
export const medicalProfiles = pgTable('medical_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Basic Info
  age: integer('age'),
  gender: varchar('gender', { length: 50 }),
  height: real('height'), // cm
  weight: real('weight'), // kg

  // Vital Signs
  systolicPressure: integer('systolic_pressure'),
  diastolicPressure: integer('diastolic_pressure'),
  restingHeartRate: integer('resting_heart_rate'),

  // Lifestyle - Sleep
  sleepHours: real('sleep_hours'),
  napTime: integer('nap_time'), // minutes
  sleepQuality: integer('sleep_quality'), // 1-10
  sleepIssues: text('sleep_issues'),

  // Lifestyle - Stress
  stressLevel: integer('stress_level'), // 1-10
  stressManagement: text('stress_management'),
  morningSunlightExposure: varchar('morning_sunlight_exposure', { length: 10 }), // 'yes' or 'no'

  // Exercise
  exerciseActivities: json('exercise_activities').$type<Array<{
    type: string
    frequency: number // times per week
    duration: number // minutes
    intensity: string // 'low', 'moderate', 'high'
  }>>(),
  physicalLimitations: text('physical_limitations'),

  // Functional Tests (Biomarcadores Funcionais)
  handgripStrength: real('handgrip_strength'), // kg - Força de Preensão Manual (dinamômetro)
  sitToStandTime: real('sit_to_stand_time'), // seconds - Teste Sentar-Levantar 5x
  co2ToleranceTest: real('co2_tolerance_test'), // seconds - Teste de Tolerância ao CO2
  vo2Max: real('vo2_max'), // ml/kg/min - Capacidade Aeróbica Máxima
  bodyFatPercentage: real('body_fat_percentage'), // % - Percentual de Gordura Corporal (para calcular FFMI)

  // Nutrition
  currentDiet: text('current_diet'),
  supplementation: text('supplementation'),
  dailyWaterIntake: real('daily_water_intake'), // liters

  // Health
  medicalConditions: json('medical_conditions').$type<string[]>(),
  medications: json('medications').$type<string[]>(),
  allergies: json('allergies').$type<string[]>(),
  surgeries: json('surgeries').$type<string[]>(),
  familyHistory: text('family_history'),

  // Habits
  smokingStatus: varchar('smoking_status', { length: 50 }),
  smokingDetails: text('smoking_details'),
  alcoholConsumption: varchar('alcohol_consumption', { length: 50 }),

  // Goals
  healthObjectives: text('health_objectives'),
  notes: text('notes'),

  // Biomarkers Snapshot (from Logical Brain)
  latestBiomarkers: json('latest_biomarkers').$type<{
    [slug: string]: {
      value: number
      unit?: string
      date: string
      documentId: string
      status: 'optimal' | 'suboptimal' | 'abnormal'
    }
  }>(),
  biomarkersUpdatedAt: timestamp('biomarkers_updated_at'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
