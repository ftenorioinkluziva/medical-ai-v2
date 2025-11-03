/**
 * Document Structuring
 * Uses LLM to structure medical documents into JSON format
 */

import { generateText } from 'ai'
import { googleModels } from '@/lib/ai/providers'

/**
 * Structured document interface (following doctor_v0 pattern)
 */
export interface StructuredMedicalDocument {
  documentType: 'lab_report' | 'bioimpedance' | 'medical_report' | 'prescription' | 'imaging' | 'other'
  patientInfo: {
    name?: string
    id_rg?: string
    id_cpf?: string
    dateOfBirth?: string
    age?: number
    sex?: string
  }
  providerInfo: {
    name?: string
    doctor?: string
    address?: string
  }
  examDate?: string
  overallSummary: string
  modules: Array<{
    moduleName: string // e.g., "Hemograma Completo", "TSH"
    category: string // e.g., "Hematologia", "Endocrinologia"
    status: 'normal' | 'abnormal' | 'high' | 'low' | 'borderline' | 'n/a'
    summary: string
    parameters: Array<{
      name: string
      value: string | number
      unit?: string
      referenceRange?: string
      status?: 'normal' | 'high' | 'low'
    }>
  }>
}

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
 * Structure medical document using LLM
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

  console.log(`🧠 [STRUCTURING] Structuring document: ${fileName}`)
  console.log(`📝 [STRUCTURING] Text length: ${extractedText.length} chars`)

  // Classify document type
  const documentType = classifyDocumentType(fileName, extractedText)
  console.log(`📋 [STRUCTURING] Detected type: ${documentType}`)

  try {
    const systemPrompt = `Você é um especialista em análise de documentos médicos. Sua tarefa é estruturar dados médicos extraídos em formato JSON preciso e organizado.

INSTRUÇÕES CRÍTICAS:
1. Extraia TODOS os dados visíveis do documento
2. Organize em módulos por categoria (Hemograma, Lipidograma, Hormônios, etc.)
3. Para cada parâmetro, inclua: nome, valor, unidade, faixa de referência
4. Classifique status como: normal, high, low, abnormal, borderline, n/a
5. Seja extremamente preciso com valores numéricos
6. Mantenha nomes originais dos exames em português

FORMATO DE SAÍDA (JSON):
{
  "patientInfo": {
    "name": "Nome do paciente",
    "age": número,
    "sex": "M/F",
    "id_cpf": "CPF se disponível",
    "dateOfBirth": "data se disponível"
  },
  "providerInfo": {
    "name": "Nome do laboratório/clínica",
    "doctor": "Médico solicitante",
    "address": "Endereço"
  },
  "examDate": "YYYY-MM-DD",
  "overallSummary": "Resumo geral em 2-3 frases",
  "modules": [
    {
      "moduleName": "Nome do módulo (ex: Hemograma Completo)",
      "category": "Categoria (ex: Hematologia)",
      "status": "normal|abnormal|high|low|borderline|n/a",
      "summary": "Resumo dos achados deste módulo",
      "parameters": [
        {
          "name": "Nome do parâmetro",
          "value": valor numérico ou string,
          "unit": "unidade (mg/dL, g/dL, etc)",
          "referenceRange": "faixa de referência",
          "status": "normal|high|low"
        }
      ]
    }
  ]
}

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional.`

    // Gemini 2.5 Flash supports up to 1M tokens (~4M chars)
    // We can send much larger documents, limiting to 200k chars (~50-60 pages)
    const maxChars = 200000
    const documentText = extractedText.length > maxChars
      ? `${extractedText.substring(0, maxChars)}\n\n[DOCUMENTO TRUNCADO - Processadas primeiras ~50 páginas de ${Math.ceil(extractedText.length / 4000)} páginas totais]`
      : extractedText

    const userPrompt = `Analise este documento médico e estruture os dados em JSON:

DOCUMENTO:
${documentText}

NOME DO ARQUIVO: ${fileName}

Retorne APENAS o JSON estruturado conforme o formato especificado.`

    console.log(`🤖 [STRUCTURING] Calling ${provider} ${model}...`)

    const result = await generateText({
      model: googleModels[model] || googleModels.flash,
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      temperature: 0.1, // Low for precision
    })

    const responseText = result.text.trim()

    // Extract JSON from response (sometimes LLM adds markdown code blocks)
    let jsonText = responseText
    if (responseText.includes('```json')) {
      const match = responseText.match(/```json\n([\s\S]*?)\n```/)
      if (match) {
        jsonText = match[1]
      }
    } else if (responseText.includes('```')) {
      const match = responseText.match(/```\n([\s\S]*?)\n```/)
      if (match) {
        jsonText = match[1]
      }
    }

    // Parse JSON
    let structured: StructuredMedicalDocument
    try {
      const parsed = JSON.parse(jsonText)

      // Ensure documentType is set
      structured = {
        documentType,
        patientInfo: parsed.patientInfo || {},
        providerInfo: parsed.providerInfo || {},
        examDate: parsed.examDate,
        overallSummary: parsed.overallSummary || 'Documento médico processado',
        modules: parsed.modules || [],
      }
    } catch (parseError) {
      console.warn('⚠️ [STRUCTURING] JSON parse failed, using fallback structure')

      // Fallback structure
      structured = {
        documentType,
        patientInfo: {},
        providerInfo: {},
        overallSummary: 'Documento médico processado. Estruturação automática parcial.',
        modules: [
          {
            moduleName: 'Dados Gerais',
            category: 'Geral',
            status: 'n/a',
            summary: responseText.substring(0, 500),
            parameters: [],
          },
        ],
      }
    }

    const processingTime = Date.now() - startTime

    console.log(`✅ [STRUCTURING] Structured in ${processingTime}ms`)
    console.log(`📊 [STRUCTURING] Modules: ${structured.modules.length}`)
    console.log(`📊 [STRUCTURING] Tokens: ${result.usage?.totalTokens || 'N/A'}`)

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
