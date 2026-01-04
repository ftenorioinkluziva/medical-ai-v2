#!/bin/sh
set -e

echo "🔍 Starting Medical AI V2..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set!"
  exit 1
fi

echo "📊 Checking database connectivity..."
# Simple connectivity test using node
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Database connection successful');
    pool.end();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
"

echo "🔄 Syncing migration state (one-time check)..."
# First sync: mark existing migrations as applied
node scripts/sync-migration-state.mjs
SYNC_EXIT_CODE=$?

if [ $SYNC_EXIT_CODE -eq 10 ]; then
  echo "⏭️  Skipping migrations - all already applied"
elif [ $SYNC_EXIT_CODE -eq 0 ]; then
  echo ""
  echo "🔄 Running database migrations..."
  # Run migrations using production script (doesn't require drizzle-kit)
  node scripts/migrate-production.mjs

  if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
  else
    echo "❌ Migrations failed!"
    exit 1
  fi
else
  echo "❌ Sync failed!"
  exit 1
fi

echo "🚀 Starting Next.js application..."
exec "$@"
