/**
 * Knowledge Base Analyzer
 * Extrai biomarcadores e protocolos de artigos médicos usando IA
 */

import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

// Schema de Biomarcador Extraído
const ExtractedBiomarkerSchema = z.object({
  name: z.string().describe('Nome completo do biomarcador'),
  possibleSlugs: z.array(z.string()).describe('Possíveis identificadores (slugs)'),
  optimalMin: z.number().optional().describe('Valor mínimo ótimo/funcional'),
  optimalMax: z.number().optional().describe('Valor máximo ótimo/funcional'),
  labMin: z.number().optional().describe('Valor mínimo laboratorial padrão'),
  labMax: z.number().optional().describe('Valor máximo laboratorial padrão'),
  unit: z.string().optional().describe('Unidade de medida'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Nível de confiança da extração'),
})

// Schema de Protocolo Extraído
const ExtractedProtocolSchema = z.object({
  condition: z.string().describe('Condição que ativa o protocolo'),
  recommendation: z.string().describe('Recomendação específica'),
  dosage: z.string().optional().describe('Dosagem recomendada'),
  type: z.enum(['supplement', 'diet', 'exercise', 'medical']).describe('Tipo de protocolo'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Nível de confiança da extração'),
})

// Schema de Resultado da Análise
const AnalysisResultSchema = z.object({
  biomarkers: z.array(ExtractedBiomarkerSchema),
  protocols: z.array(ExtractedProtocolSchema),
})

export type ExtractedBiomarker = z.infer<typeof ExtractedBiomarkerSchema>
export type ExtractedProtocol = z.infer<typeof ExtractedProtocolSchema>
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>

export interface AnalyzerOptions {
  model?: string
  temperature?: number
}

/**
 * Analisa um artigo da base de conhecimento e extrai biomarcadores e protocolos
 */
export async function analyzeArticle(
  article: {
    id: string
    title: string
    content: string
    category?: string
    source?: string
  },
  options: AnalyzerOptions = {}
): Promise<AnalysisResult> {
  const {
    model = 'gemini-2.5-pro',
    temperature = 0.1,
  } = options

  console.log(`🔬 [ANALYZER] Analyzing article: ${article.title}`)

  const prompt = `Analise o seguinte artigo médico e extraia TODAS as informações sobre biomarcadores e protocolos clínicos.

ARTIGO:
Título: ${article.title}
Categoria: ${article.category || 'Não especificada'}
Fonte: ${article.source || 'Base de Conhecimento'}
Conteúdo: ${article.content}

INSTRUÇÕES DETALHADAS:

1. BIOMARCADORES - Identifique TODOS os biomarcadores mencionados com valores de referência:

   Para cada biomarcador, extraia:
   - Nome completo (ex: "Vitamina D3", "TSH", "Ferritina")
   - Possíveis slugs/identificadores em diferentes formatos:
     * snake_case (vitamina_d3, tsh, ferritina)
     * kebab-case (vitamina-d3)
     * camelCase (vitaminaD3)
     * Abreviações (vit_d, d3)
     * Nomes alternativos (25-hidroxi-vitamina-d)

   - Valores ÓTIMOS/FUNCIONAIS (medicina funcional):
     * Se o artigo mencionar "níveis ideais", "faixa ótima", "valores funcionais"
     * Use optimalMin e optimalMax

   - Valores LABORATORIAIS (medicina convencional):
     * Se mencionar "limites laboratoriais", "valores de referência padrão"
     * Use labMin e labMax

   - Unidade de medida (ng/mL, mg/dL, UI/L, etc.)

   - Confiança:
     * HIGH: Valores numéricos explícitos e claros
     * MEDIUM: Valores com alguma ambiguidade ou menção indireta
     * LOW: Valores vagos ou apenas mencionados sem números específicos

2. PROTOCOLOS - Identifique TODOS os protocolos clínicos mencionados:

   Para cada protocolo, extraia:
   - Condição de ativação (ex: "vitamina_d3 < 40", "tsh > 4.0")
   - Recomendação específica (o que fazer)
   - Dosagem recomendada (se mencionada)
   - Tipo:
     * supplement: Suplementação
     * diet: Dieta/alimentação
     * exercise: Exercício físico
     * medical: Intervenção médica

   - Confiança:
     * HIGH: Protocolo explícito com dosagem clara
     * MEDIUM: Recomendação geral sem dosagem específica
     * LOW: Menção vaga ou indireta

REGRAS IMPORTANTES:
- Seja CONSERVADOR: Se não tiver certeza, marque como "low confidence"
- NÃO invente valores: Se não estiver no texto, deixe como undefined
- Prefira PRECISÃO a QUANTIDADE: Melhor extrair menos itens com alta confiança
- Se encontrar MÚLTIPLAS fontes com valores diferentes no mesmo artigo, extraia AMBOS
- Retorne array vazio se não houver informações relevantes

EXEMPLOS DE EXTRAÇÃO:

Texto: "Vitamina D3 ideal entre 70-90 ng/mL, laboratorial 20-100 ng/mL"
→ {
    name: "Vitamina D3",
    possibleSlugs: ["vitamina_d3", "vitamina-d3", "vit_d3", "25_hidroxi_vitamina_d"],
    optimalMin: 70,
    optimalMax: 90,
    labMin: 20,
    labMax: 100,
    unit: "ng/mL",
    confidence: "high"
  }

Texto: "TSH funcional deve estar entre 1 e 2.2"
→ {
    name: "TSH",
    possibleSlugs: ["tsh", "hormonio_tireoestimulante"],
    optimalMin: 1,
    optimalMax: 2.2,
    unit: "mUI/L",
    confidence: "high"
  }

Texto: "Se Vitamina D abaixo de 40, suplementar 10.000 UI diárias"
→ {
    condition: "vitamina_d3 < 40",
    recommendation: "Suplementar Vitamina D3",
    dosage: "10.000 UI/dia",
    type: "supplement",
    confidence: "high"
  }

Agora analise o artigo acima e retorne a estrutura solicitada.`

  try {
    const result = await generateObject({
      model: google(model),
      prompt,
      schema: AnalysisResultSchema,
      temperature,
    })

    console.log(`✅ [ANALYZER] Found ${result.object.biomarkers.length} biomarkers, ${result.object.protocols.length} protocols`)

    return result.object
  } catch (error) {
    console.error(`❌ [ANALYZER] Error analyzing article:`, error)
    throw error
  }
}

/**
 * Analisa múltiplos artigos em batch
 */
export async function analyzeArticles(
  articles: Array<{
    id: string
    title: string
    content: string
    category?: string
    source?: string
  }>,
  options: AnalyzerOptions = {}
): Promise<Map<string, AnalysisResult>> {
  const results = new Map<string, AnalysisResult>()

  for (const article of articles) {
    try {
      const result = await analyzeArticle(article, options)
      results.set(article.id, result)

      // Delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`❌ [ANALYZER] Failed to analyze article ${article.id}:`, error)
      // Continue com próximo artigo
    }
  }

  return results
}
