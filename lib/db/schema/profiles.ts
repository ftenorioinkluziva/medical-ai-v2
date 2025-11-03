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
  sleepQuality: integer('sleep_quality'), // 1-10
  sleepIssues: text('sleep_issues'),

  // Lifestyle - Stress
  stressLevel: integer('stress_level'), // 1-10
  stressManagement: text('stress_management'),

  // Exercise
  exerciseTypes: json('exercise_types').$type<string[]>(),
  exerciseFrequency: integer('exercise_frequency'), // times per week
  exerciseDuration: integer('exercise_duration'), // minutes
  exerciseIntensity: varchar('exercise_intensity', { length: 50 }),
  physicalLimitations: text('physical_limitations'),

  // Nutrition
  currentDiet: text('current_diet'),
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

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
