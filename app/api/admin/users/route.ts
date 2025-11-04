/**
 * Admin Users API
 * List and manage users
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { desc, sql, count } from 'drizzle-orm'

/**
 * GET /api/admin/users
 * List all users with statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and check admin role
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    console.log(`👥 [ADMIN-USERS-API] Listing all users`)

    // Get all users with basic info
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))

    // Get user statistics
    // Note: These would ideally join with analyses, documents tables
    // For now, returning basic user info
    const usersWithStats = allUsers.map(user => ({
      ...user,
      analysesCount: 0, // TODO: Add actual count
      documentsCount: 0, // TODO: Add actual count
      lastActivity: user.updatedAt,
    }))

    console.log(`✅ [ADMIN-USERS-API] Found ${allUsers.length} users`)

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      total: allUsers.length,
      stats: {
        total: allUsers.length,
        admins: allUsers.filter(u => u.role === 'admin').length,
        doctors: allUsers.filter(u => u.role === 'doctor').length,
        patients: allUsers.filter(u => u.role === 'patient').length,
        verified: allUsers.filter(u => u.emailVerified).length,
      }
    })
  } catch (error) {
    console.error('❌ [ADMIN-USERS-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
