/**
 * Create Admin User Script (Standalone)
 * Usage: node scripts/create-admin-standalone.js
 */

const { config } = require('dotenv')
const { drizzle } = require('drizzle-orm/node-postgres')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const { eq } = require('drizzle-orm')
const { pgTable, uuid, varchar, timestamp, boolean } = require('drizzle-orm/pg-core')

// Load environment variables
config({ path: '.env.local' })

// Define schemas inline
const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
})

const userRoles = pgTable('user_roles', {
  userId: uuid('user_id').notNull(),
  roleId: uuid('role_id').notNull(),
})

const ADMIN_EMAIL = 'admin@medical.com'
const ADMIN_PASSWORD = 'admin123'
const ADMIN_NAME = 'Admin User'

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...')

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in environment variables')
      process.exit(1)
    }

    // Connect to database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const db = drizzle(pool)

    // Hash password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    console.log('✅ Password hashed')

    // Check if user exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1)

    let userId

    if (existingUsers.length > 0) {
      console.log(`ℹ️  User already exists: ${existingUsers[0].email}`)
      userId = existingUsers[0].id

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
      const newUsers = await db
        .insert(users)
        .values({
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          passwordHash,
          emailVerified: true,
        })
        .returning()

      userId = newUsers[0].id
      console.log(`✅ User created: ${newUsers[0].email} (${newUsers[0].id})`)
    }

    // Get admin role
    const adminRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'admin'))
      .limit(1)

    if (adminRoles.length === 0) {
      console.error('❌ Admin role not found in database!')
      console.log('ℹ️  Run the RBAC schema migration first')
      await pool.end()
      process.exit(1)
    }

    const adminRole = adminRoles[0]

    // Check if role assignment exists
    const existingRoles = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1)

    if (existingRoles.length === 0) {
      await db.insert(userRoles).values({
        userId,
        roleId: adminRole.id,
      })
      console.log('✅ Admin role assigned')
    } else {
      console.log('ℹ️  User already has a role assigned')
    }

    console.log('\n✅ Admin user ready!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Email: ${ADMIN_EMAIL}`)
    console.log(`Password: ${ADMIN_PASSWORD}`)
    console.log(`Name: ${ADMIN_NAME}`)
    console.log(`Role: admin`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('🌐 You can now login at: http://localhost:3000/auth/login')

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdminUser()
