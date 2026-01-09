/**
 * Chat API Endpoint
 * Real-time chat with AI agent based on analysis context
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { analyses, chatMessages, healthAgents, documents, weeklyPlans } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'
import { googleModels } from '@/lib/ai/providers'
import { buildKnowledgeContext } from '@/lib/ai/knowledge'
import { getUserCredits, calculateCreditsFromTokens, debitCredits } from '@/lib/billing/credits'

const MAX_MESSAGES_PER_CHAT = 50

/**
 * POST - Send a message and get streaming response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { analysisId } = await params
    const body = await request.json()
    const { messages: clientMessages } = body as { messages: UIMessage[] }

    if (!clientMessages || !Array.isArray(clientMessages) || clientMessages.length === 0) {
      return new Response('Invalid messages', { status: 400 })
    }

    // Get the last user message
    const lastMessage = clientMessages[clientMessages.length - 1]
    if (!lastMessage || lastMessage.role !== 'user') {
      return new Response('Last message must be from user', { status: 400 })
    }

    // Extract text from the message parts
    const messageText = lastMessage.parts
      ?.filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
      .join('') || ''

    if (!messageText.trim()) {
      return new Response('Message cannot be empty', { status: 400 })
    }

    if (messageText.length > 1000) {
      return new Response('Message too long (max 1000 chars)', { status: 400 })
    }

    console.log(`💬 [CHAT-API] User ${session.user.id} sending message to analysis ${analysisId}`)

    // Get analysis and verify ownership
    const [analysis] = await db
      .select({
        id: analyses.id,
        userId: analyses.userId,
        agentId: analyses.agentId,
        synthesis: analyses.synthesis, // Use synthesis instead of raw analysis
        documentIds: analyses.documentIds,
        medicalProfileSnapshot: analyses.medicalProfileSnapshot,
        createdAt: analyses.createdAt,
      })
      .from(analyses)
      .where(eq(analyses.id, analysisId))
      .limit(1)

    if (!analysis) {
      return new Response('Analysis not found', { status: 404 })
    }

    if (analysis.userId !== session.user.id) {
      return new Response('Forbidden', { status: 403 })
    }

    // Get agent info
    const [agent] = await db
      .select()
      .from(healthAgents)
      .where(eq(healthAgents.id, analysis.agentId))
      .limit(1)

    if (!agent) {
      return new Response('Agent not found', { status: 404 })
    }

    // Get chat history (limit to last 20 messages for context)
    const chatHistory = await db
      .select({
        role: chatMessages.role,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.analysisId, analysisId),
          eq(chatMessages.userId, session.user.id)
        )
      )
      .orderBy(desc(chatMessages.createdAt))
      .limit(20)

    // Check message limit
    if (chatHistory.length >= MAX_MESSAGES_PER_CHAT) {
      return new Response('Message limit reached (50 messages per chat)', { status: 429 })
    }

    // ============ CREDIT CHECK ============
    // Estimate credits needed for chat (typically 20-80 credits depending on context)
    const ESTIMATED_CHAT_CREDITS = 50
    const userCreditsData = await getUserCredits(session.user.id)

    if (!userCreditsData) {
      return new Response('Erro ao verificar créditos', { status: 500 })
    }

    if (userCreditsData.balance < ESTIMATED_CHAT_CREDITS) {
      console.log(`❌ [CHAT-API] Insufficient credits: ${userCreditsData.balance} < ${ESTIMATED_CHAT_CREDITS}`)
      return new Response(
        JSON.stringify({
          error: 'Créditos insuficientes',
          details: {
            required: ESTIMATED_CHAT_CREDITS,
            current: userCreditsData.balance,
            shortfall: ESTIMATED_CHAT_CREDITS - userCreditsData.balance,
          },
        }),
        {
          status: 402,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    console.log(`✅ [CHAT-API] Credit check passed: ${userCreditsData.balance} credits available`)
    // ======================================

    // Reverse to get chronological order
    chatHistory.reverse()

    // Get weekly plan for this analysis (if available)
    console.log('📋 [CHAT-API] Fetching weekly plan for analysis...')
    const [weeklyPlan] = await db
      .select()
      .from(weeklyPlans)
      .where(eq(weeklyPlans.analysisId, analysisId))
      .limit(1)

    let weeklyPlanContext = ''
    if (weeklyPlan) {
      const planParts = []

      if (weeklyPlan.supplementationStrategy) {
        planParts.push(`### ESTRATÉGIA DE SUPLEMENTAÇÃO:\n${JSON.stringify(weeklyPlan.supplementationStrategy, null, 2)}`)
      }

      if (weeklyPlan.mealPlan) {
        planParts.push(`### PLANO ALIMENTAR:\n${JSON.stringify(weeklyPlan.mealPlan, null, 2)}`)
      }

      if (weeklyPlan.workoutPlan) {
        planParts.push(`### PLANO DE TREINO:\n${JSON.stringify(weeklyPlan.workoutPlan, null, 2)}`)
      }

      if (weeklyPlan.shoppingList) {
        planParts.push(`### LISTA DE COMPRAS:\n${JSON.stringify(weeklyPlan.shoppingList, null, 2)}`)
      }

      weeklyPlanContext = planParts.join('\n\n')
      console.log(`✅ [CHAT-API] Weekly plan found: ${weeklyPlanContext.length} chars`)
    } else {
      console.log('ℹ️ [CHAT-API] No weekly plan found for this analysis')
    }

    // Search knowledge base for relevant information based on user question
    console.log('🧠 [CHAT-API] Searching knowledge base for user question...')
    let knowledgeContext = ''
    try {
      knowledgeContext = await buildKnowledgeContext(messageText, {
        maxChunks: 3,
        maxCharsPerChunk: 1000,
        agentId: agent.id, // Use agent's knowledge configuration
      })

      if (knowledgeContext) {
        console.log(`✅ [CHAT-API] Knowledge context found: ${knowledgeContext.length} chars`)
      } else {
        console.log('ℹ️ [CHAT-API] No relevant knowledge found')
      }
    } catch (error) {
      console.warn('⚠️ [CHAT-API] Knowledge search failed:', error)
      // Continue without knowledge context if search fails
    }

    // Build context for the agent
    const systemPrompt = `${agent.systemPrompt}

## CONTEXTO DESTA CONVERSA

Você está conversando com o paciente sobre uma análise médica que você mesmo gerou anteriormente.

### ANÁLISE ORIGINAL QUE VOCÊ FEZ:
${JSON.stringify(analysis.synthesis, null, 2)}

${analysis.medicalProfileSnapshot ? `### PERFIL DO PACIENTE:\n${JSON.stringify(analysis.medicalProfileSnapshot, null, 2)}` : ''}

${weeklyPlanContext ? `### PLANO SEMANAL DO PACIENTE:\n${weeklyPlanContext}\n\nUse este plano para responder perguntas específicas sobre suplementação, alimentação, exercícios e lista de compras.` : ''}

${knowledgeContext ? `### CONHECIMENTO MÉDICO RELEVANTE:\n${knowledgeContext}\n\nUse este conhecimento para enriquecer suas respostas com informações médicas precisas e atualizadas.` : ''}

## INSTRUÇÕES PARA ESTA CONVERSA:

1. Você já conhece o contexto completo do paciente (análise + documentos + perfil + plano semanal)
2. Se o paciente perguntar sobre suplementação, alimentação ou treino, use o PLANO SEMANAL como referência principal
3. Se houver conhecimento médico relevante fornecido, use-o para enriquecer sua resposta com informações precisas
4. Responda perguntas de forma clara, empática e educativa
5. Use os dados da análise original como base factual
6. Você pode expandir, esclarecer e educar sobre os tópicos usando o conhecimento médico disponível
7. Se o paciente perguntar algo não relacionado aos seus dados, responda de forma geral mas sempre conecte com a análise dele
8. Seja conciso mas completo (máximo 300 palavras por resposta)
9. Use linguagem acessível, evite jargões técnicos excessivos
10. Sempre reforce que suas orientações são educacionais e não substituem consulta médica

IMPORTANTE: Esta é uma conversa de follow-up. O paciente já leu sua análise e quer esclarecer dúvidas específicas.`

    console.log(`机器人 [CHAT-API] Generating streaming response with ${agent.modelName}`)
    console.log(`📊 [CHAT-API] Context sizes:`)
    console.log(`   - Chat history: ${chatHistory.length} messages`)
    // Documents context removed
    console.log(`   - Weekly plan: ${weeklyPlanContext.length} chars`)
    console.log(`   - Knowledge: ${knowledgeContext.length} chars`)
    console.log(`   - Total system prompt: ${systemPrompt.length} chars`)

    // Save user message to database (before streaming)
    await db.insert(chatMessages).values({
      userId: session.user.id,
      agentId: agent.id,
      analysisId,
      role: 'user',
      content: messageText,
    })

    // Convert UI messages to model messages
    const modelMessages = convertToModelMessages(clientMessages)

    // Stream response using Vercel AI SDK
    const result = streamText({
      model: (googleModels[agent.modelName as keyof typeof googleModels] as any) || googleModels.flash,
      system: systemPrompt,
      messages: modelMessages,
      temperature: agent.modelConfig.temperature || 0.3,
      // maxTokens removed to fix type error
      async onFinish({ text, usage }) {
        // Extract token usage
        const tokensUsed = usage?.totalTokens || 0
        const promptTokens = (usage as any)?.promptTokens || 0
        const completionTokens = (usage as any)?.completionTokens || 0

        console.log(`📊 [CHAT-API] Token usage: ${tokensUsed} total (${promptTokens} prompt + ${completionTokens} completion)`)

        // Save assistant message to database after streaming completes
        await db.insert(chatMessages).values({
          userId: session.user.id,
          agentId: agent.id,
          analysisId,
          role: 'assistant',
          content: text,
          modelUsed: agent.modelName,
          tokensUsed,
        })

        // ============ DEBIT CREDITS ============
        if (tokensUsed > 0) {
          try {
            const creditsDebited = calculateCreditsFromTokens(tokensUsed)
            await debitCredits(session.user.id, tokensUsed, {
              analysisId,
              operation: 'chat_message',
              modelName: agent.modelName,
              promptTokens,
              completionTokens,
              // messagePreview removed
            })
            console.log(`💳 [CHAT-API] Debited ${creditsDebited} credits (${tokensUsed} tokens)`)
          } catch (creditError) {
            console.error('❌ [CHAT-API] Failed to debit credits:', creditError)
            // Don't fail the chat, just log the error for manual review
          }
        }
        // =======================================

        console.log(`✅ [CHAT-API] Response completed and saved`)
      },
    })

    // Convert to UI message stream response for DefaultChatTransport
    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('❌ [CHAT-API] Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    )
  }
}

/**
 * GET - Retrieve chat history for an analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { analysisId } = await params

    console.log(`💬 [CHAT-API] Fetching chat history for analysis ${analysisId}`)

    // Verify analysis ownership
    const [analysis] = await db
      .select({ userId: analyses.userId })
      .from(analyses)
      .where(eq(analyses.id, analysisId))
      .limit(1)

    if (!analysis) {
      return Response.json({ error: 'Analysis not found' }, { status: 404 })
    }

    if (analysis.userId !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get chat messages
    const messages = await db
      .select({
        id: chatMessages.id,
        role: chatMessages.role,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.analysisId, analysisId),
          eq(chatMessages.userId, session.user.id)
        )
      )
      .orderBy(chatMessages.createdAt)

    console.log(`✅ [CHAT-API] Retrieved ${messages.length} messages`)

    return Response.json({
      success: true,
      messages,
      count: messages.length,
      limit: MAX_MESSAGES_PER_CHAT,
    })
  } catch (error) {
    console.error('❌ [CHAT-API] Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
