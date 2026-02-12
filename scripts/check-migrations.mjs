
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
} else {
    dotenv.config();
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    try {
        const res = await pool.query('SELECT * FROM "drizzle_migrations" ORDER BY created_at DESC'); // Default table name is usually drizzle_migrations or __drizzle_migrations
        console.log('Migrations in DB:', res.rows);
    } catch (e) {
        if (e.code === '42P01') {
            console.log('drizzle_migrations table does not exist. Checking __drizzle_migrations...');
            try {
                const res2 = await pool.query('SELECT * FROM "__drizzle_migrations" ORDER BY created_at DESC');
                console.log('Migrations in DB (__drizzle_migrations) count:', res2.rows.length);
                fs.writeFileSync('migrations_dump.json', JSON.stringify(res2.rows, null, 2));
            } catch (e2) {
                console.error('Neither migration table exists');
            }
        } else {
            console.log('Migrations in DB (drizzle_migrations) count:', res.rows.length);
            fs.writeFileSync('migrations_dump.json', JSON.stringify(res.rows, null, 2));
        }
    } finally {
        pool.end();
    }
}

main();
