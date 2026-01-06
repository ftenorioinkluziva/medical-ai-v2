/**
 * Apply migration 0015 - API Keys table only
 * This script manually applies only the api_keys table creation
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import pkg from 'pg'
const { Client } = pkg

// Load .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL não encontrada no .env.local')
  process.exit(1)
}

console.log('🔄 Aplicando migration 0015 - API Keys...\n')

const client = new Client({
  connectionString,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
})

await client.connect()

try {
  // Check if table already exists
  const tableExists = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'api_keys'
    );
  `)

  if (tableExists.rows[0].exists) {
    console.log('✅ Tabela api_keys já existe, nada a fazer.')
  } else {
    console.log('📝 Criando tabela api_keys...')

    // Create api_keys table
    await client.query(`
      CREATE TABLE "api_keys" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "key_hash" varchar(255) NOT NULL,
        "key_prefix" varchar(16) NOT NULL,
        "name" varchar(255),
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "last_used_at" timestamp,
        "expires_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
      );
    `)

    console.log('✅ Tabela api_keys criada')

    // Add foreign key
    await client.query(`
      ALTER TABLE "api_keys"
      ADD CONSTRAINT "api_keys_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE cascade
      ON UPDATE no action;
    `)

    console.log('✅ Foreign key adicionada')
  }

  console.log('\n✅ Migration 0015 aplicada com sucesso!')
} catch (error) {
  console.error('❌ Erro ao aplicar migration:', error.message)
  process.exit(1)
} finally {
  await client.end()
}
