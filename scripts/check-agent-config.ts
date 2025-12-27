import 'dotenv/config'
import { db } from '@/lib/db/client'
import { healthAgents, knowledgeArticles } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

async function main() {
  const agentId = '9fcfb0d8-8abb-440c-b660-42aaaa993101'

  // Get agent config
  const [agent] = await db
  .select({
    id: healthAgents.id,
    agentKey: healthAgents.agentKey,
    name: healthAgents.name,
    knowledgeAccessType: healthAgents.knowledgeAccessType,
    allowedCategories: healthAgents.allowedCategories,
    excludedArticleIds: healthAgents.excludedArticleIds,
    includedArticleIds: healthAgents.includedArticleIds,
  })
  .from(healthAgents)
  .where(eq(healthAgents.id, agentId))

console.log('=== AGENT CONFIGURATION ===')
console.log(JSON.stringify(agent, null, 2))

// Get articles with allowed categories
if (agent && agent.allowedCategories && agent.allowedCategories.length > 0) {
  console.log('\n=== ARTICLES IN ALLOWED CATEGORIES ===')
  console.log('Categories:', agent.allowedCategories)

  const articles = await db
    .select({
      id: knowledgeArticles.id,
      title: knowledgeArticles.title,
      category: knowledgeArticles.category,
      isVerified: knowledgeArticles.isVerified,
    })
    .from(knowledgeArticles)
    .where(
      inArray(knowledgeArticles.category, agent.allowedCategories)
    )

  console.log(`\nFound ${articles.length} articles:`)
  articles.forEach(a => {
    console.log(`- [${a.category}] ${a.title} (verified: ${a.isVerified})`)
  })
}
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
