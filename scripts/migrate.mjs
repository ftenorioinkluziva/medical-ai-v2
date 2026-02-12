
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

// Load .env.local if it exists
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
} else {
    dotenv.config();
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('ERROR: DATABASE_URL is not defined in .env or .env.local');
    process.exit(1);
}

console.log('Using database:', connectionString.split('@')[1]); // Log host only for safety

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function main() {
    console.log('Running migrations...');
    try {
        await migrate(db, { migrationsFolder: 'lib/db/migrations', migrationsTable: 'drizzle_migrations' });
        console.log('Migrations complete!');
    } catch (e) {
        console.error('Migration failed during execution:', e);
        throw e;
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error('Migration failed!', err);
    fs.writeFileSync('migration_error.log', JSON.stringify(err, null, 2) + '\n' + err.stack);
    process.exit(1);
});
