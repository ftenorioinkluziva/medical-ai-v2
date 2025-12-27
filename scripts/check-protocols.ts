import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from '../lib/db/client'
import { protocols } from '../lib/db/schema'

async function check() {
  const result = await db.select().from(protocols)
  console.log('Total protocols:', result.length)
  console.log('\nProtocols:')
  result.forEach(p => {
    console.log(`- [${p.id}] ${p.title}`)
    console.log(`  Condition: ${p.triggerCondition}`)
  })
  process.exit(0)
}

check()
