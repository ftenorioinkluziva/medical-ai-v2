import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { healthAgents, knowledgeArticles } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

export async function GET() {
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

  // Get articles with allowed categories
  let articles: any[] = []
  if (agent && agent.allowedCategories && agent.allowedCategories.length > 0) {
    articles = await db
      .select({
        id: knowledgeArticles.id,
        title: knowledgeArticles.title,
        category: knowledgeArticles.category,
        isVerified: knowledgeArticles.isVerified,
      })
      .from(knowledgeArticles)
      .where(
        inArray(knowledgeArticles.category, agent.allowedCategories as string[])
      )
  }

  return NextResponse.json({
    agent,
    articles,
    articlesCount: articles.length,
  })
}
