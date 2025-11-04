/**
 * Admin User Individual API
 * Update user role and status
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/admin/users/[id]
 * Get specific user details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        image: users.image,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('❌ [ADMIN-USER-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user (role, etc)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const body = await request.json()

    console.log(`👥 [ADMIN-USER-API] Updating user: ${id}`)

    // Prevent admin from changing their own role
    if (id === session.user.id && body.role && body.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Você não pode alterar seu próprio papel' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (body.role !== undefined) {
      // Validate role
      if (!['patient', 'doctor', 'admin'].includes(body.role)) {
        return NextResponse.json(
          { success: false, error: 'Papel inválido' },
          { status: 400 }
        )
      }
      updateData.role = body.role
    }

    if (body.name !== undefined) {
      updateData.name = body.name
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        updatedAt: users.updatedAt,
      })

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    console.log(`✅ [ADMIN-USER-API] User updated: ${id}`)

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Usuário atualizado com sucesso',
    })
  } catch (error) {
    console.error('❌ [ADMIN-USER-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar usuário',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (soft delete or hard delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await context.params

    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Você não pode deletar sua própria conta' },
        { status: 400 }
      )
    }

    console.log(`👥 [ADMIN-USER-API] Deleting user: ${id}`)

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
      })

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    console.log(`✅ [ADMIN-USER-API] User deleted: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Usuário deletado com sucesso',
    })
  } catch (error) {
    console.error('❌ [ADMIN-USER-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao deletar usuário',
      },
      { status: 500 }
    )
  }
}
