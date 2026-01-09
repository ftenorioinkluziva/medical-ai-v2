import postgres from 'postgres';
import 'dotenv/config'; // Make sure you have dotenv installed or just hardcode for this one-off if safe (local)

async function main() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/medical_ai_v2';

    if (!connectionString) {
        console.error('DATABASE_URL not found');
        process.exit(1);
    }

    const sql = postgres(connectionString);

    console.log('Running migration: Add synthesis column...');
    try {
        await sql`ALTER TABLE "analyses" ADD COLUMN IF NOT EXISTS "synthesis" json;`;
        console.log('✅ Migration successful');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await sql.end();
    }
}

main();
