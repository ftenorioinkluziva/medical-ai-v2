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
        console.log('Running migration: Add synthesis column...');

        await client.query('ALTER TABLE "analyses" ADD COLUMN IF NOT EXISTS "synthesis" json;');

        console.log('✅ Migration successful');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.end();
    }
}

main();
