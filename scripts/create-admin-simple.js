/**
 * Create Admin User Script (Simple)
 * Usage: node scripts/create-admin-simple.js
 */

const { config } = require('dotenv')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// Load environment variables
config({ path: '.env.local' })

const ADMIN_EMAIL = 'admin@medical.com'
const ADMIN_PASSWORD = 'admin123'
const ADMIN_NAME = 'Admin User'

async function createAdminUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  try {
    console.log('🔐 Creating admin user...')

    // Hash password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    console.log('✅ Password hashed')

    // Check if user exists
    const { rows: existingUsers } = await pool.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    )

    if (existingUsers.length > 0) {
      console.log(`ℹ️  User already exists: ${existingUsers[0].email}`)

      // Update to admin and set password
      await pool.query(
        'UPDATE users SET password_hash = $1, role = $2, email_verified = NOW() WHERE email = $3',
        [passwordHash, 'admin', ADMIN_EMAIL]
      )

      console.log('✅ User updated to admin role with new password')
    } else {
      // Create new user
      const { rows } = await pool.query(
        `INSERT INTO users (email, name, password_hash, role, email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
         RETURNING id, email, name, role`,
        [ADMIN_EMAIL, ADMIN_NAME, passwordHash, 'admin']
      )

      console.log(`✅ Admin user created: ${rows[0].email} (${rows[0].id})`)
    }

    // Verify
    const { rows: verifiedUsers } = await pool.query(
      'SELECT id, email, name, role, email_verified FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    )

    const user = verifiedUsers[0]

    console.log('\n✅ Admin user ready!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Email: ${user.email}`)
    console.log(`Password: ${ADMIN_PASSWORD}`)
    console.log(`Name: ${user.name}`)
    console.log(`Role: ${user.role}`)
    console.log(`Verified: ${user.email_verified ? 'Yes' : 'No'}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('🌐 You can now login at: http://localhost:3000/auth/login')

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    await pool.end()
    process.exit(1)
  }
}

createAdminUser()
