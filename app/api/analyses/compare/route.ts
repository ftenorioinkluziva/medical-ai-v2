/**
 * Analyses Comparison API
 * Compares multiple analyses to track treatment progress
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { analyses, healthAgents } from '@/lib/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { buildKnowledgeContext } from '@/lib/ai/knowledge'

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { analysisIds } = body

    if (!analysisIds || !Array.isArray(analysisIds) || analysisIds.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Selecione pelo menos 2 análises para comparar' },
        { status: 400 }
      )
    }

    console.log(`🔍 [COMPARE-ANALYSES] Comparing ${analysisIds.length} analyses for user: ${session.user.id}`)

    // Get selected analyses with agent info
    const selectedAnalyses = await db
      .select({
        id: analyses.id,
        analysis: analyses.analysis,
        prompt: analyses.prompt,
        createdAt: analyses.createdAt,
        agentName: healthAgents.name,
        agentTitle: healthAgents.title,
        agentColor: healthAgents.color,
      })
      .from(analyses)
      .leftJoin(healthAgents, eq(analyses.agentId, healthAgents.id))
      .where(inArray(analyses.id, analysisIds))
      .orderBy(analyses.createdAt)

    if (selectedAnalyses.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Análises não encontradas' },
        { status: 404 }
      )
    }

    console.log(`📊 [COMPARE-ANALYSES] Found ${selectedAnalyses.length} analyses`)

    // Build context from all analyses
    let context = '# Análises Médicas para Comparação\n\n'
    context += `Total de análises: ${selectedAnalyses.length}\n`
    context += `Período: ${new Date(selectedAnalyses[0].createdAt).toLocaleDateString('pt-BR')} até ${new Date(selectedAnalyses[selectedAnalyses.length - 1].createdAt).toLocaleDateString('pt-BR')}\n\n`

    selectedAnalyses.forEach((analysis, index) => {
      context += `## Análise ${index + 1} - ${new Date(analysis.createdAt).toLocaleDateString('pt-BR')}\n`
      context += `**Especialista:** ${analysis.agentTitle}\n\n`
      context += `**Análise Completa:**\n${analysis.analysis}\n\n`
      context += '---\n\n'
    })

    // Build knowledge context
    console.log('🧠 [COMPARE-ANALYSES] Searching knowledge base...')
    let knowledgeContext = ''
    try {
      const searchQuery = `progressão tratamento evolução saúde monitoramento`
      knowledgeContext = await buildKnowledgeContext(searchQuery, {
        maxChunks: 3,
        maxCharsPerChunk: 1200,
      })

      if (knowledgeContext) {
        console.log(`✅ [COMPARE-ANALYSES] Knowledge context: ${knowledgeContext.length} chars`)
        context += '\n# Base de Conhecimento Médico (Referências)\n\n'
        context += knowledgeContext
      }
    } catch (error) {
      console.warn('⚠️ [COMPARE-ANALYSES] Knowledge search failed:', error)
    }

    console.log(`🤖 [COMPARE-ANALYSES] Generating comparison analysis...`)

    // Generate comparison using AI
    const { text: comparisonAnalysis } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: `Você é um médico especializado em medicina integrativa e preventiva.

Sua tarefa é analisar a evolução do paciente comparando múltiplas análises médicas ao longo do tempo.

${context}

**Instruções para Análise Comparativa:**

1. **Resumo Executivo:**
   - Faça uma visão geral da evolução do paciente
   - Destaque os pontos mais importantes
   - Use uma linguagem clara e encorajadora

2. **Progressos Identificados:**
   - Liste as MELHORIAS observadas entre as análises
   - Cite valores específicos quando mencionados
   - Destaque hábitos ou tratamentos que funcionaram
   - Use marcadores (•) para facilitar leitura

3. **Áreas que Precisam de Atenção:**
   - Liste os pontos que NÃO melhoraram ou pioraram
   - Cite valores específicos quando mencionados
   - Sugira possíveis causas (sem afirmar)
   - Use marcadores (•) para facilitar leitura

4. **Tendências Observadas:**
   - Identifique padrões ao longo do tempo
   - Parâmetros que mostram melhora consistente
   - Parâmetros que mostram piora ou estagnação
   - Correlações entre diferentes aspectos da saúde

5. **Recomendações para Continuidade:**
   - O que deve ser MANTIDO (está funcionando)
   - O que deve ser AJUSTADO (precisa de mudanças)
   - O que deve ser INICIADO (novos tratamentos/hábitos)
   - Próximos exames ou avaliações recomendados

6. **Perspectiva Geral:**
   - Avalie o progresso geral (melhorando, estável, piorando)
   - Forneça uma perspectiva motivadora mas realista
   - Reconheça os esforços do paciente

**IMPORTANTE:**
- Use a base de conhecimento para fundamentar observações
- Seja ESPECÍFICO - cite valores e datas das análises
- Compare diretamente os achados entre as análises
- Use linguagem acessível e encorajadora
- Estruture bem o texto com títulos e subtítulos
- Use marcadores e listas para facilitar leitura
- SEMPRE mantenha postura educacional - não substitui consulta médica

**Formato da resposta:**
Use markdown para formatar, com:
- # para títulos principais
- ## para subtítulos
- **negrito** para destaque
- • para marcadores
- Separe bem as seções

Gere uma análise comparativa completa, profunda e útil para o paciente entender seu progresso.`,
    })

    console.log(`✅ [COMPARE-ANALYSES] Comparison generated (${comparisonAnalysis.length} chars)`)

    return NextResponse.json({
      success: true,
      comparison: comparisonAnalysis,
      analysesCompared: selectedAnalyses.map(a => ({
        id: a.id,
        date: a.createdAt,
        agent: a.agentName,
      })),
      generatedAt: new Date().toISOString(),
      disclaimer: 'Esta análise comparativa é educacional e não substitui consulta médica profissional.',
    })
  } catch (error) {
    console.error('❌ [COMPARE-ANALYSES] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
