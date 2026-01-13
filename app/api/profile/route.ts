/**
 * Medical Profile API
 * Get and update user medical profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { medicalProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Support patientId for doctors
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const userId = patientId && session.user.role === 'doctor' ? patientId : session.user.id

    console.log(`👤 [PROFILE-API] Fetching profile for user: ${userId}${patientId ? ' (doctor view)' : ''}`)

    // Get user profile
    const [profile] = await db
      .select()
      .from(medicalProfiles)
      .where(eq(medicalProfiles.userId, userId))
      .limit(1)

    if (!profile) {
      console.log(`👤 [PROFILE-API] No profile found for user: ${userId}`)
      return NextResponse.json({
        success: true,
        profile: null,
      })
    }

    console.log(`✅ [PROFILE-API] Profile found for user: ${userId}`)

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('❌ [PROFILE-API-GET] Error:', error)

    // Return null profile instead of error for better UX
    return NextResponse.json({
      success: true,
      profile: null,
      warning: 'Ocorreu um erro ao carregar o perfil. Por favor, tente novamente.',
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Support patientId for doctors
    const patientId = body.patientId
    const userId = patientId && session.user.role === 'doctor' ? patientId : session.user.id

    console.log(`👤 [PROFILE-API] Saving profile for user: ${userId}${patientId ? ' (doctor editing)' : ''}`)

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(medicalProfiles)
      .where(eq(medicalProfiles.userId, userId))
      .limit(1)

    let savedProfile

    if (existingProfile) {
      // Update existing profile
      const [updated] = await db
        .update(medicalProfiles)
        .set({
          // Basic Info
          age: body.age || null,
          gender: body.gender || null,
          height: body.height || null,
          weight: body.weight || null,

          // Vital Signs
          systolicPressure: body.systolicPressure || null,
          diastolicPressure: body.diastolicPressure || null,
          restingHeartRate: body.restingHeartRate || null,

          // Lifestyle - Sleep
          sleepHours: body.sleepHours || null,
          timeInBed: body.timeInBed || null,
          sleepQuality: body.sleepQuality || null,
          sleepRegularity: body.sleepRegularity || null,
          sleepIssues: body.sleepIssues || null,
          firstSunlightExposureTime: body.firstSunlightExposureTime || null,
          lastMealTime: body.lastMealTime || null,
          artificialLightExposureStart: body.artificialLightExposureStart || null,
          artificialLightExposureEnd: body.artificialLightExposureEnd || null,

          // Lifestyle - Stress
          stressLevel: body.stressLevel || null,
          stressManagement: body.stressManagement || null,

          // Exercise
          exerciseTypes: body.exerciseTypes || null,
          exerciseFrequency: body.exerciseFrequency || null,
          exerciseDuration: body.exerciseDuration || null,
          exerciseIntensity: body.exerciseIntensity || null,
          exerciseActivities: body.exerciseActivities || null,
          physicalLimitations: body.physicalLimitations || null,

          // Functional Tests
          handgripStrength: body.handgripStrength || null,
          sitToStandTime: body.sitToStandTime || null,
          co2ToleranceTest: body.co2ToleranceTest || null,
          vo2Max: body.vo2Max || null,
          bodyFatPercentage: body.bodyFatPercentage || null,

          // Nutrition
          currentDiet: body.currentDiet || null,
          supplementation: body.supplementation || null,
          dailyWaterIntake: body.dailyWaterIntake || null,

          // Health
          medicalConditions: body.medicalConditions || null,
          medications: body.medications || null,
          allergies: body.allergies || null,
          surgeries: body.surgeries || null,
          familyHistory: body.familyHistory || null,

          // Habits
          smokingStatus: body.smokingStatus || null,
          smokingDetails: body.smokingDetails || null,
          alcoholConsumption: body.alcoholConsumption || null,

          // Goals
          healthObjectives: body.healthObjectives || null,
          notes: body.notes || null,

          updatedAt: new Date(),
        })
        .where(eq(medicalProfiles.userId, userId))
        .returning()

      savedProfile = updated
      console.log(`✅ [PROFILE-API] Profile updated for user: ${userId}`)
    } else {
      // Create new profile
      const [created] = await db
        .insert(medicalProfiles)
        .values({
          userId: userId,
          // Basic Info
          age: body.age || null,
          gender: body.gender || null,
          height: body.height || null,
          weight: body.weight || null,

          // Vital Signs
          systolicPressure: body.systolicPressure || null,
          diastolicPressure: body.diastolicPressure || null,
          restingHeartRate: body.restingHeartRate || null,

          // Lifestyle - Sleep
          sleepHours: body.sleepHours || null,
          timeInBed: body.timeInBed || null,
          sleepQuality: body.sleepQuality || null,
          sleepRegularity: body.sleepRegularity || null,
          sleepIssues: body.sleepIssues || null,
          firstSunlightExposureTime: body.firstSunlightExposureTime || null,
          lastMealTime: body.lastMealTime || null,
          artificialLightExposureStart: body.artificialLightExposureStart || null,
          artificialLightExposureEnd: body.artificialLightExposureEnd || null,

          // Lifestyle - Stress
          stressLevel: body.stressLevel || null,
          stressManagement: body.stressManagement || null,

          // Exercise
          exerciseTypes: body.exerciseTypes || null,
          exerciseFrequency: body.exerciseFrequency || null,
          exerciseDuration: body.exerciseDuration || null,
          exerciseIntensity: body.exerciseIntensity || null,
          exerciseActivities: body.exerciseActivities || null,
          physicalLimitations: body.physicalLimitations || null,

          // Functional Tests
          handgripStrength: body.handgripStrength || null,
          sitToStandTime: body.sitToStandTime || null,
          co2ToleranceTest: body.co2ToleranceTest || null,
          vo2Max: body.vo2Max || null,
          bodyFatPercentage: body.bodyFatPercentage || null,

          // Nutrition
          currentDiet: body.currentDiet || null,
          supplementation: body.supplementation || null,
          dailyWaterIntake: body.dailyWaterIntake || null,

          // Health
          medicalConditions: body.medicalConditions || null,
          medications: body.medications || null,
          allergies: body.allergies || null,
          surgeries: body.surgeries || null,
          familyHistory: body.familyHistory || null,

          // Habits
          smokingStatus: body.smokingStatus || null,
          smokingDetails: body.smokingDetails || null,
          alcoholConsumption: body.alcoholConsumption || null,

          // Goals
          healthObjectives: body.healthObjectives || null,
          notes: body.notes || null,
        })
        .returning()

      savedProfile = created
      console.log(`✅ [PROFILE-API] Profile created for user: ${userId}`)
    }

    return NextResponse.json({
      success: true,
      profile: savedProfile,
    })
  } catch (error) {
    console.error('❌ [PROFILE-API-POST] Error:', error)
    console.error('❌ [PROFILE-API-POST] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao salvar perfil. Verifique os dados e tente novamente.',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
