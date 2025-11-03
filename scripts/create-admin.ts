/**
 * Create Admin User Script
 * Usage: npx tsx scripts/create-admin.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '@/lib/db/client'
import { users, userRoles, roles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = 'admin@medical.com'
const ADMIN_PASSWORD = 'admin123'
const ADMIN_NAME = 'Admin User'

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...')

    // Hash password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    console.log('✅ Password hashed')

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1)

    let userId: string

    if (existingUser) {
      console.log(`ℹ️  User already exists: ${existingUser.email}`)
      userId = existingUser.id

      // Update password
      await db
        .update(users)
        .set({
          passwordHash,
          emailVerified: true,
        })
        .where(eq(users.id, userId))

      console.log('✅ Password updated')
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          passwordHash,
          emailVerified: true,
        })
        .returning()

      userId = newUser.id
      console.log(`✅ User created: ${newUser.email} (${newUser.id})`)
    }

    // Get admin role
    const [adminRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'admin'))
      .limit(1)

    if (!adminRole) {
      console.error('❌ Admin role not found in database!')
      console.log('ℹ️  Run the RBAC schema migration first')
      process.exit(1)
    }

    // Assign admin role
    const [existingRole] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1)

    if (!existingRole) {
      await db.insert(userRoles).values({
        userId,
        roleId: adminRole.id,
      })
      console.log('✅ Admin role assigned')
    } else {
      console.log('ℹ️  User already has a role assigned')
    }

    // Verify
    const [verifiedUser] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        emailVerified: users.emailVerified,
        roleId: userRoles.roleId,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(userRoles, eq(users.id, userRoles.userId))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1)

    console.log('\n✅ Admin user ready!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Email: ${verifiedUser.email}`)
    console.log(`Password: ${ADMIN_PASSWORD}`)
    console.log(`Name: ${verifiedUser.name}`)
    console.log(`Role: ${verifiedUser.roleName || 'none'}`)
    console.log(`Verified: ${verifiedUser.emailVerified}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('🌐 You can now login at: http://localhost:3000/auth/login')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdminUser()
