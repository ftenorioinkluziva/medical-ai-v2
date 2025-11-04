/**
 * Migration: Create weekly_plans table
 * Stores personalized weekly plans (supplements, meals, workouts, shopping)
 */

import 'dotenv/config'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function migrate() {
  const client = await pool.connect()

  try {
    console.log('🚀 Starting weekly_plans migration...')

    await client.query('BEGIN')

    // Create weekly_plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS weekly_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
        week_start_date DATE NOT NULL,
        supplementation_strategy JSONB NOT NULL,
        shopping_list JSONB NOT NULL,
        meal_plan JSONB NOT NULL,
        workout_plan JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)

    console.log('✅ Created weekly_plans table')

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_weekly_plans_user_id
      ON weekly_plans(user_id);
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_weekly_plans_analysis_id
      ON weekly_plans(analysis_id);
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_weekly_plans_week_start_date
      ON weekly_plans(week_start_date);
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_weekly_plans_created_at
      ON weekly_plans(created_at DESC);
    `)

    console.log('✅ Created indexes')

    // Create trigger for updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_weekly_plans_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_weekly_plans_updated_at ON weekly_plans;
    `)

    await client.query(`
      CREATE TRIGGER trigger_update_weekly_plans_updated_at
      BEFORE UPDATE ON weekly_plans
      FOR EACH ROW
      EXECUTE FUNCTION update_weekly_plans_updated_at();
    `)

    console.log('✅ Created updated_at trigger')

    await client.query('COMMIT')

    console.log('✅ Migration completed successfully!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch(console.error)
