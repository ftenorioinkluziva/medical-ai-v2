/**
 * Apply Complete Analyses Migration
 * Run this script to create the complete_analyses table
 */

import { sql } from 'drizzle-orm'
import { db } from '../lib/db/client'

async function applyMigration() {
  console.log('📦 Applying complete_analyses table migration...')

  try {
    // Create table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS complete_analyses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL,
        document_ids jsonb NOT NULL,
        integrative_analysis_id uuid,
        nutrition_analysis_id uuid,
        exercise_analysis_id uuid,
        synthesis jsonb,
        recommendations_id uuid,
        weekly_plan_id uuid,
        status text DEFAULT 'pending' NOT NULL,
        error_message text,
        created_at timestamp DEFAULT now() NOT NULL,
        completed_at timestamp
      )
    `)

    console.log('✅ Table created')

    // Add foreign keys
    await db.execute(sql`
      ALTER TABLE complete_analyses
      DROP CONSTRAINT IF EXISTS complete_analyses_user_id_users_id_fk
    `)
    await db.execute(sql`
      ALTER TABLE complete_analyses
      ADD CONSTRAINT complete_analyses_user_id_users_id_fk
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
    `)

    await db.execute(sql`
      ALTER TABLE complete_analyses
      DROP CONSTRAINT IF EXISTS complete_analyses_integrative_analysis_id_analyses_id_fk
    `)
    await db.execute(sql`
      ALTER TABLE complete_analyses
      ADD CONSTRAINT complete_analyses_integrative_analysis_id_analyses_id_fk
      FOREIGN KEY (integrative_analysis_id) REFERENCES analyses(id) ON DELETE cascade
    `)

    await db.execute(sql`
      ALTER TABLE complete_analyses
      DROP CONSTRAINT IF EXISTS complete_analyses_nutrition_analysis_id_analyses_id_fk
    `)
    await db.execute(sql`
      ALTER TABLE complete_analyses
      ADD CONSTRAINT complete_analyses_nutrition_analysis_id_analyses_id_fk
      FOREIGN KEY (nutrition_analysis_id) REFERENCES analyses(id) ON DELETE cascade
    `)

    await db.execute(sql`
      ALTER TABLE complete_analyses
      DROP CONSTRAINT IF EXISTS complete_analyses_exercise_analysis_id_analyses_id_fk
    `)
    await db.execute(sql`
      ALTER TABLE complete_analyses
      ADD CONSTRAINT complete_analyses_exercise_analysis_id_analyses_id_fk
      FOREIGN KEY (exercise_analysis_id) REFERENCES analyses(id) ON DELETE cascade
    `)

    await db.execute(sql`
      ALTER TABLE complete_analyses
      DROP CONSTRAINT IF EXISTS complete_analyses_recommendations_id_recommendations_id_fk
    `)
    await db.execute(sql`
      ALTER TABLE complete_analyses
      ADD CONSTRAINT complete_analyses_recommendations_id_recommendations_id_fk
      FOREIGN KEY (recommendations_id) REFERENCES recommendations(id) ON DELETE cascade
    `)

    await db.execute(sql`
      ALTER TABLE complete_analyses
      DROP CONSTRAINT IF EXISTS complete_analyses_weekly_plan_id_weekly_plans_id_fk
    `)
    await db.execute(sql`
      ALTER TABLE complete_analyses
      ADD CONSTRAINT complete_analyses_weekly_plan_id_weekly_plans_id_fk
      FOREIGN KEY (weekly_plan_id) REFERENCES weekly_plans(id) ON DELETE cascade
    `)

    console.log('✅ Foreign keys added')
    console.log('✅ Migration completed successfully!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

applyMigration()
