require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// COLE AQUI OS PRICE IDs DO STRIPE
const PRICE_IDS = {
  starter: 'price_1SjKmo9WEAc8PReOlOQnIguo',      // ← Cole o Price ID do Starter
  professional: 'price_1SjKmp9WEAc8PReOzgYeCFwa', // ← Cole o Price ID do Professional
  enterprise: 'price_1SjKmp9WEAc8PReOP84Pcy9u',   // ← Cole o Price ID do Enterprise
}

async function updatePrices() {
  try {
    console.log('🔄 Updating Stripe Price IDs...\n')

    // Update Starter
    await pool.query(
      `UPDATE credit_packages SET stripe_price_id = $1 WHERE name = 'Starter'`,
      [PRICE_IDS.starter]
    )
    console.log('✅ Updated Starter:', PRICE_IDS.starter)

    // Update Professional
    await pool.query(
      `UPDATE credit_packages SET stripe_price_id = $1 WHERE name = 'Professional'`,
      [PRICE_IDS.professional]
    )
    console.log('✅ Updated Professional:', PRICE_IDS.professional)

    // Update Enterprise
    await pool.query(
      `UPDATE credit_packages SET stripe_price_id = $1 WHERE name = 'Enterprise'`,
      [PRICE_IDS.enterprise]
    )
    console.log('✅ Updated Enterprise:', PRICE_IDS.enterprise)

    console.log('\n✅ All Price IDs updated successfully!')

    // Verify
    const result = await pool.query(`
      SELECT name, stripe_price_id
      FROM credit_packages
      ORDER BY display_order
    `)

    console.log('\n📦 Current packages:')
    result.rows.forEach(row => {
      console.log(`   ${row.name}: ${row.stripe_price_id}`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

updatePrices()
