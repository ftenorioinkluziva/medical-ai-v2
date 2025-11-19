/**
 * Doctor Patient Details API
 * Get detailed information about a specific patient
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { users, medicalProfiles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    // Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Check if user is doctor or admin
    if (session.user.role !== 'doctor' && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { patientId } = await params

    console.log(`👨‍⚕️ [DOCTOR-API] Doctor ${session.user.id} accessing patient ${patientId}`)

    // Fetch patient with complete profile
    const patient = await db
      .select({
        // User data
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        createdAt: users.createdAt,
        // Profile data
        age: medicalProfiles.age,
        gender: medicalProfiles.gender,
        height: medicalProfiles.height,
        weight: medicalProfiles.weight,
        allergies: medicalProfiles.allergies,
        medicalConditions: medicalProfiles.medicalConditions,
        medications: medicalProfiles.medications,
        surgeries: medicalProfiles.surgeries,
        familyHistory: medicalProfiles.familyHistory,
        healthObjectives: medicalProfiles.healthObjectives,
        notes: medicalProfiles.notes,
        updatedAt: medicalProfiles.updatedAt,
      })
      .from(users)
      .leftJoin(medicalProfiles, eq(medicalProfiles.userId, users.id))
      .where(
        and(
          eq(users.id, patientId),
          eq(users.role, 'patient')
        )
      )
      .limit(1)

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    console.log(`👨‍⚕️ [DOCTOR-API] Patient ${patientId} data retrieved successfully`)

    return NextResponse.json({
      success: true,
      patient: patient[0],
    })
  } catch (error) {
    console.error('Error fetching patient details:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados do paciente' },
      { status: 500 }
    )
  }
}
