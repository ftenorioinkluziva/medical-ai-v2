import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { creditPackages } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  try {
    const packages = await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.isActive, true))
      .orderBy(asc(creditPackages.displayOrder))

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Error fetching credit packages:', error)
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}
