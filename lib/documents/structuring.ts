/**
 * Document Structuring
 * Uses LLM with native structured output (Zod schemas) to structure medical documents
 */

import { generateObject } from 'ai'
import { googleModels } from '@/lib/ai/providers'
import { StructuredMedicalDocumentSchema } from './schemas'

/**
 * Re-export types from schemas
 */
export type {
  StructuredMedicalDocument,
  MedicalModule,
  MedicalParameter,
  PatientInfo,
  ProviderInfo,
} from './schemas'

/**
 * Classify document type from filename and content
 */
function classifyDocumentType(filename: string, text: string): StructuredMedicalDocument['documentType'] {
  const lowerName = filename.toLowerCase()
  const lowerText = text.toLowerCase()

  if (lowerName.includes('bioimpedancia') || lowerName.includes('inbody') ||
      lowerText.includes('bioimpedância') || lowerText.includes('inbody')) {
    return 'bioimpedance'
  }

  if (lowerName.includes('hemograma') || lowerName.includes('sangue') ||
      lowerName.includes('laboratorial') || lowerText.includes('laboratório') ||
      lowerText.includes('exame')) {
    return 'lab_report'
  }

  if (lowerName.includes('ultrassom') || lowerName.includes('raio') ||
      lowerName.includes('tomografia') || lowerName.includes('ressonância')) {
    return 'imaging'
  }

  if (lowerName.includes('prescricao') || lowerName.includes('receita') ||
      lowerName.includes('medicamento')) {
    return 'prescription'
  }

  return 'medical_report'
}

/**
 * Structure medical document using LLM with native structured output
 * Uses Zod schema for guaranteed valid JSON - no more parsing errors!
 */
export async function structureMedicalDocument(
  extractedText: string,
  fileName: string,
  options: {
    model?: string
    provider?: 'google' | 'openai'
  } = {}
): Promise<StructuredMedicalDocument> {
  const {
    model = 'gemini-2.5-flash',
    provider = 'google',
  } = options

  const startTime = Date.now()

  console.log(`🧠 [STRUCTURING] Structuring document with native structured output: ${fileName}`)
  console.log(`📝 [STRUCTURING] Text length: ${extractedText.length} chars`)

  // Classify document type
  const documentType = classifyDocumentType(fileName, extractedText)
  console.log(`📋 [STRUCTURING] Detected type: ${documentType}`)

  try {
    const systemPrompt = `Você é um especialista em análise de documentos médicos. Sua tarefa é estruturar dados médicos extraídos de forma precisa e organizada.

INSTRUÇÕES CRÍTICAS:
1. Extraia TODOS os dados visíveis do documento
2. Organize em módulos por categoria (Hemograma, Lipidograma, Hormônios, etc.)
3. Para cada parâmetro, inclua: nome, valor, unidade, faixa de referência
4. Classifique status como: normal, high, low, abnormal, borderline, n/a
5. Seja extremamente preciso com valores numéricos
6. Mantenha nomes originais dos exames em português
7. Se informações não estiverem disponíveis, use null ou omita o campo opcional`

    // Gemini 2.5 Flash supports up to 1M tokens (~4M chars)
    // Limiting to 200k chars (~50-60 pages)
    const maxChars = 200000
    const documentText = extractedText.length > maxChars
      ? `${extractedText.substring(0, maxChars)}\n\n[DOCUMENTO TRUNCADO - Processadas primeiras ~50 páginas de ${Math.ceil(extractedText.length / 4000)} páginas totais]`
      : extractedText

    const userPrompt = `Analise este documento médico e extraia os dados estruturados:

DOCUMENTO:
${documentText}

NOME DO ARQUIVO: ${fileName}
TIPO DETECTADO: ${documentType}

Extraia todos os dados relevantes seguindo o schema fornecido.`

    console.log(`🤖 [STRUCTURING] Calling ${provider} ${model} with native structured output...`)

    // ✅ Use generateObject with Zod schema - guaranteed valid JSON!
    const result = await generateObject({
      model: googleModels[model] || googleModels.flash,
      schema: StructuredMedicalDocumentSchema,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.1, // Low for precision
    })

    const structured = result.object

    // Override documentType with our detection (more reliable)
    structured.documentType = documentType

    const processingTime = Date.now() - startTime

    console.log(`✅ [STRUCTURING] Structured in ${processingTime}ms`)
    console.log(`📊 [STRUCTURING] Modules: ${structured.modules.length}`)
    console.log(`📊 [STRUCTURING] Tokens: ${result.usage?.totalTokens || 'N/A'}`)
    console.log(`🎯 [STRUCTURING] Schema validation: PASSED (native structured output)`)

    return structured
  } catch (error) {
    console.error('❌ [STRUCTURING] Error:', error)

    // Return minimal fallback structure
    return {
      documentType,
      patientInfo: {},
      providerInfo: {},
      overallSummary: 'Erro ao estruturar documento. Texto bruto disponível.',
      modules: [
        {
          moduleName: 'Dados Brutos',
          category: 'Geral',
          status: 'n/a',
          summary: extractedText.substring(0, 500),
          parameters: [],
        },
      ],
    }
  }
}

/**
 * Extract key health markers from structured document
 * Useful for quick filtering and search
 */
export function extractKeyMarkers(structured: StructuredMedicalDocument): string[] {
  const markers = new Set<string>()

  for (const module of structured.modules) {
    // Add module name as marker
    markers.add(module.moduleName.toLowerCase())

    // Add each parameter name
    for (const param of module.parameters) {
      markers.add(param.name.toLowerCase())
    }
  }

  return Array.from(markers)
}
