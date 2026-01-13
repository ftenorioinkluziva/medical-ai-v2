const { Client } = require('pg');
const path = require('path');
// Load .env.local first (common in Next.js)
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
// Also load .env as fallback
require('dotenv').config();

async function main() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/medical_ai_v2';

    if (!connectionString) {
        console.error('DATABASE_URL not found');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('Running migration: Update sleep and timing fields...');

        // Add new sleep fields
        console.log('Adding time_in_bed column...');
        await client.query('ALTER TABLE "medical_profiles" ADD COLUMN IF NOT EXISTS "time_in_bed" real;');

        console.log('Adding sleep_regularity column...');
        await client.query('ALTER TABLE "medical_profiles" ADD COLUMN IF NOT EXISTS "sleep_regularity" integer;');

        console.log('Adding first_sunlight_exposure_time column...');
        await client.query('ALTER TABLE "medical_profiles" ADD COLUMN IF NOT EXISTS "first_sunlight_exposure_time" varchar(5);');

        console.log('Adding last_meal_time column...');
        await client.query('ALTER TABLE "medical_profiles" ADD COLUMN IF NOT EXISTS "last_meal_time" varchar(5);');

        console.log('Adding artificial_light_exposure_time column...');
        await client.query('ALTER TABLE "medical_profiles" ADD COLUMN IF NOT EXISTS "artificial_light_exposure_time" varchar(5);');

        // Drop old fields (only if they exist)
        console.log('Removing nap_time column (if exists)...');
        await client.query('ALTER TABLE "medical_profiles" DROP COLUMN IF EXISTS "nap_time";');

        console.log('Removing morning_sunlight_exposure column (if exists)...');
        await client.query('ALTER TABLE "medical_profiles" DROP COLUMN IF EXISTS "morning_sunlight_exposure";');

        console.log('✅ Migration successful');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.end();
    }
}

main();
