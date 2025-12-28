import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db/client'
import { knowledgeArticles } from '@/lib/db/schema'
import { and, eq, inArray, desc } from 'drizzle-orm'
import { generateText } from 'ai'
import { googleModels } from '@/lib/ai/providers'

// Types
interface GeneratePromptRequest {
  promptType: 'system' | 'analysis'
  agentData: {
    name: string
    title: string
    description: string
    knowledgeAccessType: 'full' | 'restricted'
    allowedCategories: string[]
  }
}

interface GeneratePromptResponse {
  success: boolean
  prompt?: string
  stats?: {
    articlesAnalyzed: number
    processingTimeMs: number
    categoriesIncluded: string[]
  }
  error?: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. Autenticação
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    // 2. Validar Input
    const body = (await request.json()) as GeneratePromptRequest

    if (!body.promptType || !['system', 'analysis'].includes(body.promptType)) {
      return NextResponse.json(
        { success: false, error: 'promptType inválido. Use "system" ou "analysis".' },
        { status: 400 }
      )
    }

    const { promptType, agentData } = body

    if (!agentData.name || !agentData.title || !agentData.description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campos obrigatórios faltando: name, title, description',
        },
        { status: 400 }
      )
    }

    // Validate restricted knowledge access requires categories
    if (
      agentData.knowledgeAccessType === 'restricted' &&
      (!agentData.allowedCategories || agentData.allowedCategories.length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Acesso restrito ao conhecimento requer pelo menos uma categoria selecionada',
        },
        { status: 400 }
      )
    }

    console.log(`🤖 [GENERATE-PROMPT] Iniciando geração de ${promptType} prompt...`)
    console.log(`📋 [GENERATE-PROMPT] Agente: ${agentData.name}`)
    console.log(
      `🔒 [GENERATE-PROMPT] Acesso: ${agentData.knowledgeAccessType}${
        agentData.knowledgeAccessType === 'restricted'
          ? ` - Categorias: ${agentData.allowedCategories.join(', ')}`
          : ''
      }`
    )

    // 3. Buscar Artigos da Knowledge Base
    // SECURITY: Backend validation above ensures restricted access ALWAYS has categories
    // This prevents bypassing frontend validation and fetching all articles
    const articlesQuery = db
      .select({
        title: knowledgeArticles.title,
        content: knowledgeArticles.content,
        category: knowledgeArticles.category,
        subcategory: knowledgeArticles.subcategory,
        tags: knowledgeArticles.tags,
        summary: knowledgeArticles.summary,
      })
      .from(knowledgeArticles)
      .where(
        and(
          eq(knowledgeArticles.isVerified, 'verified'),
          agentData.knowledgeAccessType === 'restricted'
            ? inArray(knowledgeArticles.category, agentData.allowedCategories)
            : undefined
        )
      )
      .orderBy(desc(knowledgeArticles.usageCount))
      .limit(25)

    const articles = await articlesQuery

    console.log(`📚 [GENERATE-PROMPT] Artigos encontrados: ${articles.length}`)

    if (articles.length === 0) {
      return NextResponse.json({
        success: false,
        error:
          'Nenhum artigo encontrado na base de conhecimento com os filtros especificados.',
      })
    }

    // Coletar categorias únicas
    const categoriesIncluded = Array.from(
      new Set(articles.map((a) => a.category).filter(Boolean))
    )

    console.log(`🏷️ [GENERATE-PROMPT] Categorias: ${categoriesIncluded.join(', ')}`)

    // 4. Construir Contexto dos Artigos
    const articlesContext = articles
      .map(
        (article, idx) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARTIGO ${idx + 1}/${articles.length}

Título: ${article.title}
Categoria: ${article.category}${article.subcategory ? ` > ${article.subcategory}` : ''}
${article.tags && article.tags.length > 0 ? `Tags: ${article.tags.join(', ')}` : ''}

${article.summary ? `RESUMO:\n${article.summary}\n\n` : ''}CONTEÚDO COMPLETO:
${article.content}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
      )
      .join('\n\n')

    // 5. Criar Meta-Prompt baseado no tipo
    const metaPrompt =
      promptType === 'system'
        ? createSystemPromptMetaPrompt(agentData, articles.length, categoriesIncluded, articlesContext)
        : createAnalysisPromptMetaPrompt(agentData, articles.length, categoriesIncluded, articlesContext)

    console.log(`🧠 [GENERATE-PROMPT] Chamando Gemini 2.5 Pro...`)

    // 6. Gerar Prompt com Gemini 2.5 Pro
    const result = await generateText({
      model: googleModels['gemini-2.5-pro'],
      messages: [
        {
          role: 'system',
          content:
            'Você é um especialista em criar prompts otimizados para agentes de IA médicos especializados.',
          experimental_providerMetadata: {
            google: {
              cacheControl: { type: 'ephemeral' },
            },
          },
        },
        {
          role: 'user',
          content: metaPrompt,
        },
      ],
      temperature: 0.4,
      maxTokens: 8192,
    })

    const generatedPrompt = result.text.trim()
    const processingTimeMs = Date.now() - startTime

    console.log(`✅ [GENERATE-PROMPT] Prompt gerado com sucesso!`)
    console.log(`📊 [GENERATE-PROMPT] Tempo: ${processingTimeMs}ms`)
    console.log(`📝 [GENERATE-PROMPT] Tamanho: ${generatedPrompt.length} caracteres`)

    const response: GeneratePromptResponse = {
      success: true,
      prompt: generatedPrompt,
      stats: {
        articlesAnalyzed: articles.length,
        processingTimeMs,
        categoriesIncluded,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ [GENERATE-PROMPT] Erro:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro desconhecido ao gerar prompt',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// META-PROMPTS
// ============================================================================

function createSystemPromptMetaPrompt(
  agentData: GeneratePromptRequest['agentData'],
  articlesCount: number,
  categories: string[],
  articlesContext: string
): string {
  return `Você é um especialista em criar System Prompts para agentes de IA médicos especializados.

# INFORMAÇÕES DO AGENTE

**Nome:** ${agentData.name}
**Título:** ${agentData.title}
**Descrição:** ${agentData.description}
**Categorias de Conhecimento:** ${categories.join(', ')}

---

# BASE DE CONHECIMENTO DISPONÍVEL

O agente tem acesso a ${articlesCount} artigos médicos verificados nas seguintes categorias:
${categories.map((c) => `- ${c}`).join('\n')}

${articlesContext}

---

# OBJETIVO

Gere um **System Prompt** profissional e otimizado que define a identidade, expertise e comportamento deste agente de IA médico.

---

# REQUISITOS DO SYSTEM PROMPT

## 1. Estrutura (800-1500 palavras)

O System Prompt deve seguir esta estrutura:

### IDENTIDADE E PAPEL
- Defina claramente quem é o agente
- Estabeleça sua especialidade e área de atuação
- Use linguagem em primeira pessoa (Você é...)

### EXPERTISE E CONHECIMENTO
- Baseie-se nos artigos da base de conhecimento
- Mencione áreas específicas de expertise identificadas nos artigos
- Cite conceitos, métricas e biomarcadores relevantes encontrados
- NÃO liste artigos específicos, mas USE o conhecimento deles

### DIRETRIZES DE COMPORTAMENTO
**OBRIGATÓRIO incluir:**
- "Você SEMPRE cita as fontes da base de conhecimento quando disponíveis"
- "Você é honesto sobre as limitações do seu conhecimento"
- "Você NUNCA substitui a consulta com um médico profissional"
- "Você se baseia em evidências científicas e literatura médica atualizada"
- "Você adapta sua linguagem ao nível de compreensão do usuário"
- "Você reconhece quando um assunto está fora da sua área de expertise"

### TOM E ESTILO
- Profissional, mas acessível
- Empático e compreensivo
- Baseado em evidências científicas
- Educacional e informativo

### ESCOPO DE ATUAÇÃO
- Defina claramente o que o agente PODE fazer
- Especifique os tipos de análises que realiza
- Mencione as limitações claras

## 2. Diretrizes de Qualidade

- Use terminologia médica apropriada
- Seja específico sobre capacidades (baseado nos artigos)
- Mantenha tom profissional mas acessível
- Evite jargões desnecessários
- Seja claro sobre limitações éticas e profissionais

## 3. Formato

- Português brasileiro
- Estilo direto e instrucional
- Use "Você é", "Você deve", "Você pode"
- Parágrafos bem estruturados
- Máximo 1500 palavras

---

# IMPORTANTE

1. **Use os artigos** para identificar expertise específica (biomarcadores, condições, protocolos)
2. **Seja específico** sobre o que o agente analisa e como interpreta dados
3. **Inclua contexto médico** relevante da base de conhecimento
4. **Mantenha ética** - sempre enfatizar que não substitui médico
5. **Adapte o tom** à especialidade (ex: nutrição pode ser mais acessível, cardiologia mais técnica)

---

# OUTPUT

Retorne APENAS o System Prompt otimizado, sem introduções, explicações ou meta-comentários.
Comece diretamente com o prompt.`
}

function createAnalysisPromptMetaPrompt(
  agentData: GeneratePromptRequest['agentData'],
  articlesCount: number,
  categories: string[],
  articlesContext: string
): string {
  return `Você é um especialista em criar Analysis Prompts para agentes de IA médicos especializados.

# INFORMAÇÕES DO AGENTE

**Nome:** ${agentData.name}
**Título:** ${agentData.title}
**Descrição:** ${agentData.description}
**Categorias de Conhecimento:** ${categories.join(', ')}

---

# BASE DE CONHECIMENTO DISPONÍVEL

O agente tem acesso a ${articlesCount} artigos médicos verificados:

${articlesContext}

---

# OBJETIVO

Gere um **Analysis Prompt** estruturado e detalhado que instrui o agente sobre COMO analisar documentos médicos e QUAL formato usar na resposta.

---

# REQUISITOS DO ANALYSIS PROMPT

## 1. Estrutura (1000-2000 palavras)

O Analysis Prompt deve conter:

### CONTEXTO DA ANÁLISE
- O que o agente receberá (documentos, exames, histórico médico)
- O que deve identificar e extrair dos dados
- Objetivos principais da análise

### PROCESSO DE ANÁLISE (Passo-a-Passo)

Baseie-se nos tipos de análises, biomarcadores e métricas dos artigos para criar um processo que inclua:

**Passo 1: Extração de Dados**
- Quais dados buscar nos documentos
- Como identificar informações relevantes
- Que parâmetros/biomarcadores priorizar

**Passo 2: Análise e Interpretação**
- Como analisar os valores encontrados
- Referências e faixas normais (baseadas nos artigos)
- Contexto clínico a considerar

**Passo 3: Identificação de Padrões**
- Correlações importantes
- Sinais de alerta
- Tendências significativas

**Passo 4: Contextualização com Conhecimento Médico**
- Como usar a base de conhecimento
- Quando citar artigos relevantes
- Como aplicar evidências científicas

**Passo 5: Geração de Insights**
- Conclusões baseadas na análise
- Recomendações apropriadas
- Próximos passos sugeridos

### FORMATO DE SAÍDA (Markdown Estruturado)

Defina EXATAMENTE o formato esperado. Exemplo adaptado à especialidade:

\`\`\`markdown
# Análise [Especialidade]: [Nome do Paciente]

## 📋 Resumo Executivo
[Visão geral em 2-3 parágrafos dos principais achados]

## 🔍 Análise Detalhada

### [Seção Específica da Especialidade]
[Análise detalhada baseada nos biomarcadores/métricas relevantes]

### [Outra Seção Relevante]
[Mais análises conforme necessário]

## ⚠️ Achados Importantes
- **[Categoria]**: [Descrição do achado]
- **[Categoria]**: [Descrição do achado]

## 💡 Insights e Interpretação
[Interpretação clínica baseada no conhecimento médico]

## 📚 Recomendações
1. [Recomendação específica baseada nos achados]
2. [Outra recomendação]

## 📖 Referências da Base de Conhecimento
- [Artigos consultados, quando relevante]

## ⚕️ Observações Importantes
[Limitações, disclaimers médicos, sugestões de acompanhamento]
\`\`\`

### DIRETRIZES DE QUALIDADE

**O agente DEVE:**
- Ser específico e objetivo nas análises
- Usar terminologia médica apropriada (com explicações quando necessário)
- Correlacionar achados quando relevante
- Citar fontes da base de conhecimento sempre que aplicável
- Indicar limitações e incertezas honestamente
- Basear conclusões em evidências dos dados fornecidos
- Adaptar linguagem ao perfil do usuário

**O agente NÃO DEVE:**
- Inventar ou inferir dados não presentes nos documentos
- Fazer diagnósticos definitivos
- Prescrever tratamentos
- Substituir avaliação médica profissional
- Usar linguagem alarmista sem fundamento
- Ignorar achados importantes por serem sutis

## 2. Adaptação à Especialidade

- Use os artigos para identificar biomarcadores/métricas específicos da especialidade
- Adapte as seções do formato à área médica (ex: nutrição vs cardiologia)
- Inclua exemplos de tipos de achados relevantes
- Mencione protocolos ou guidelines citados nos artigos

## 3. Formato

- Português brasileiro
- Instruções claras e diretas
- Use exemplos quando ajudar na clareza
- Markdown bem formatado para o template de saída

---

# IMPORTANTE

1. **Personalize à especialidade** - Nutrição analisa de forma diferente de Endocrinologia
2. **Use conhecimento dos artigos** - Incorpore métricas e conceitos relevantes
3. **Seja específico sobre biomarcadores** - Quais buscar, como interpretar
4. **Defina formato claro** - Template exato que o agente deve seguir
5. **Enfatize limitações** - Sempre lembrar que não substitui médico

---

# OUTPUT

Retorne APENAS o Analysis Prompt otimizado, sem introduções, explicações ou meta-comentários.
Comece diretamente com o prompt de instruções para análise.`
}
