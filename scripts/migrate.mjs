import { db } from '../lib/db/client.js'
import { sql } from 'drizzle-orm'

async function apply() {
  try {
    console.log('📦 Applying migration...')
    
    await db.execute(sql`ALTER TABLE health_agents ADD COLUMN knowledge_access_type varchar(20) DEFAULT 'full' NOT NULL`)
    console.log('✅ 1/4 knowledge_access_type added')
    
    await db.execute(sql`ALTER TABLE health_agents ADD COLUMN allowed_categories json DEFAULT '[]'`)
    console.log('✅ 2/4 allowed_categories added')
    
    await db.execute(sql`ALTER TABLE health_agents ADD COLUMN excluded_article_ids json DEFAULT '[]'`)
    console.log('✅ 3/4 excluded_article_ids added')
    
    await db.execute(sql`ALTER TABLE health_agents ADD COLUMN included_article_ids json DEFAULT '[]'`)
    console.log('✅ 4/4 included_article_ids added')
    
    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

apply()
