/**
 * Biomarker Evaluation API Endpoint
 * POST /api/medical-knowledge/evaluate
 * Evaluate biomarker values against protocols and calculate metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { evaluateBiomarkers } from '@/lib/logic/evaluator'

interface BiomarkerValue {
  slug: string
  value: number
}

interface EvaluationRequest {
  biomarkers: BiomarkerValue[]
}

export async function POST(request: NextRequest) {
  try {
    const body: EvaluationRequest = await request.json()
    const { biomarkers } = body

    if (!biomarkers || !Array.isArray(biomarkers)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Formato inválido. Esperado: { biomarkers: [{ slug, value }] }',
        },
        { status: 400 }
      )
    }

    console.log('🔬 [EVALUATE-API] Evaluating biomarkers', { count: biomarkers.length })

    // Use shared evaluation logic
    const result = await evaluateBiomarkers(biomarkers)

    console.log(`✅ [EVALUATE-API] Evaluation complete:`)
    console.log(`   - Biomarkers evaluated: ${result.biomarkers.length}`)
    console.log(`   - Metrics calculated: ${result.metrics.length}`)
    console.log(`   - Protocols triggered: ${result.triggeredProtocols.length}`)

    return NextResponse.json({
      success: true,
      evaluation: {
        biomarkers: result.biomarkers,
        metrics: result.metrics,
        triggeredProtocols: result.triggeredProtocols,
      },
      summary: result.summary,
    })
  } catch (error) {
    console.error('❌ [EVALUATE-API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
