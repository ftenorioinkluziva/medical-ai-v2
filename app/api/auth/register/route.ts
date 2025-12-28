import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { registerBackendSchema } from '@/lib/validators/auth'
import { initializeUserCredits } from '@/lib/billing/credits'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input (backend schema without confirmPassword)
    const validatedData = registerBackendSchema.parse(body)

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hash(validatedData.password, 10)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        role: 'patient', // Default role
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      })

    // Initialize user credits account
    await initializeUserCredits(newUser.id)

    return NextResponse.json(
      {
        success: true,
        user: newUser,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos fornecidos' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    )
  }
}
