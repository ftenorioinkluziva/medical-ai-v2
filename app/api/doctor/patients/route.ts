/**
 * Doctor Patients API
 * Lists all patients for doctor access
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { users, medicalProfiles, documents, analyses } from '@/lib/db/schema'
import { eq, and, or, ilike, desc, sql } from 'drizzle-orm'

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

    // Check if user is doctor or admin
    if (session.user.role !== 'doctor' && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas médicos podem acessar esta funcionalidade.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log(`👨‍⚕️ [DOCTOR-API] Doctor ${session.user.id} listing patients (search: "${search}")`)

    // Build query conditions
    const conditions = [eq(users.role, 'patient')]

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )!
      )
    }

    // Fetch patients with profile data and statistics
    const patients = await db
      .select({
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
        // Statistics (count documents and analyses)
        documentsCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${documents}
          WHERE ${documents.userId} = ${users.id}
        )`,
        analysesCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${analyses}
          WHERE ${analyses.userId} = ${users.id}
        )`,
        lastActivity: sql<Date>`(
          SELECT MAX(created_at)
          FROM ${analyses}
          WHERE ${analyses.userId} = ${users.id}
        )`,
      })
      .from(users)
      .leftJoin(medicalProfiles, eq(medicalProfiles.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset)

    // Count total patients
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(...conditions))

    console.log(`👨‍⚕️ [DOCTOR-API] Found ${patients.length} patients (total: ${count})`)

    return NextResponse.json({
      success: true,
      patients,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + patients.length < count,
      },
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar pacientes' },
      { status: 500 }
    )
  }
}
