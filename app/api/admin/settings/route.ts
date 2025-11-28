/**
 * App Settings API
 * Manage application-wide configuration settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { appSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Default settings
const DEFAULT_SETTINGS = {
  'knowledge.maxChunks': '184',
  'knowledge.maxCharsPerChunk': '1200',
  'knowledge.similarityThreshold': '0.5',
}

/**
 * GET - Retrieve a setting value
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      // Get specific setting
      const [setting] = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.key, key))
        .limit(1)

      if (!setting) {
        // Return default if exists
        const defaultValue = DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS]
        if (defaultValue) {
          return NextResponse.json({
            success: true,
            setting: {
              key,
              value: defaultValue,
              isDefault: true,
            },
          })
        }

        return NextResponse.json(
          { success: false, error: 'Setting not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        setting: {
          key: setting.key,
          value: setting.value,
          description: setting.description,
          updatedAt: setting.updatedAt,
          isDefault: false,
        },
      })
    } else {
      // Get all settings
      const settings = await db.select().from(appSettings)

      // Merge with defaults
      const allSettings = { ...DEFAULT_SETTINGS }
      settings.forEach(s => {
        allSettings[s.key as keyof typeof DEFAULT_SETTINGS] = s.value
      })

      return NextResponse.json({
        success: true,
        settings: allSettings,
      })
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

/**
 * POST - Update or create a setting
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { key, value, description } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      )
    }

    // Check if setting exists
    const [existing] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, key))
      .limit(1)

    if (existing) {
      // Update existing
      const [updated] = await db
        .update(appSettings)
        .set({
          value: String(value),
          description: description || existing.description,
          updatedAt: new Date(),
        })
        .where(eq(appSettings.key, key))
        .returning()

      return NextResponse.json({
        success: true,
        setting: updated,
        message: 'Setting updated successfully',
      })
    } else {
      // Create new
      const [created] = await db
        .insert(appSettings)
        .values({
          key,
          value: String(value),
          description: description || null,
        })
        .returning()

      return NextResponse.json({
        success: true,
        setting: created,
        message: 'Setting created successfully',
      })
    }
  } catch (error) {
    console.error('Error saving setting:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save setting' },
      { status: 500 }
    )
  }
}
