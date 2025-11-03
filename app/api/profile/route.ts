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

    console.log(`👤 [PROFILE-API] Fetching profile for user: ${session.user.id}`)

    // Get user profile
    const [profile] = await db
      .select()
      .from(medicalProfiles)
      .where(eq(medicalProfiles.userId, session.user.id))
      .limit(1)

    if (!profile) {
      console.log(`👤 [PROFILE-API] No profile found for user: ${session.user.id}`)
      return NextResponse.json({
        success: true,
        profile: null,
      })
    }

    console.log(`✅ [PROFILE-API] Profile found for user: ${session.user.id}`)

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('❌ [PROFILE-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
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

    console.log(`👤 [PROFILE-API] Saving profile for user: ${session.user.id}`)

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(medicalProfiles)
      .where(eq(medicalProfiles.userId, session.user.id))
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
          sleepQuality: body.sleepQuality || null,
          sleepIssues: body.sleepIssues || null,

          // Lifestyle - Stress
          stressLevel: body.stressLevel || null,
          stressManagement: body.stressManagement || null,

          // Exercise
          exerciseTypes: body.exerciseTypes || null,
          exerciseFrequency: body.exerciseFrequency || null,
          exerciseDuration: body.exerciseDuration || null,
          exerciseIntensity: body.exerciseIntensity || null,
          physicalLimitations: body.physicalLimitations || null,

          // Nutrition
          currentDiet: body.currentDiet || null,
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
        .where(eq(medicalProfiles.userId, session.user.id))
        .returning()

      savedProfile = updated
      console.log(`✅ [PROFILE-API] Profile updated for user: ${session.user.id}`)
    } else {
      // Create new profile
      const [created] = await db
        .insert(medicalProfiles)
        .values({
          userId: session.user.id,
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
          sleepQuality: body.sleepQuality || null,
          sleepIssues: body.sleepIssues || null,

          // Lifestyle - Stress
          stressLevel: body.stressLevel || null,
          stressManagement: body.stressManagement || null,

          // Exercise
          exerciseTypes: body.exerciseTypes || null,
          exerciseFrequency: body.exerciseFrequency || null,
          exerciseDuration: body.exerciseDuration || null,
          exerciseIntensity: body.exerciseIntensity || null,
          physicalLimitations: body.physicalLimitations || null,

          // Nutrition
          currentDiet: body.currentDiet || null,
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
      console.log(`✅ [PROFILE-API] Profile created for user: ${session.user.id}`)
    }

    return NextResponse.json({
      success: true,
      profile: savedProfile,
    })
  } catch (error) {
    console.error('❌ [PROFILE-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
