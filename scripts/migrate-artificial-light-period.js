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
        console.log('Running migration: Update artificial light exposure to period...');

        // Add new fields for period (start and end)
        console.log('Adding artificial_light_exposure_start column...');
        await client.query('ALTER TABLE "medical_profiles" ADD COLUMN IF NOT EXISTS "artificial_light_exposure_start" varchar(5);');

        console.log('Adding artificial_light_exposure_end column...');
        await client.query('ALTER TABLE "medical_profiles" ADD COLUMN IF NOT EXISTS "artificial_light_exposure_end" varchar(5);');

        // Drop old single time field
        console.log('Removing artificial_light_exposure_time column (if exists)...');
        await client.query('ALTER TABLE "medical_profiles" DROP COLUMN IF EXISTS "artificial_light_exposure_time";');

        console.log('✅ Migration successful');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.end();
    }
}

main();
