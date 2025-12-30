/**
 * Data fetching functions for Complete Analysis
 */

import { db } from '@/lib/db' // Assumindo que a instância do Prisma está em lib/db
import { auth } from '@/lib/auth/config'

/**
 * Fetches a single complete analysis by its ID, ensuring user ownership.
 * @param id The ID of the complete analysis.
 * @returns An object with the analysis data or an error message.
 */
export async function getCompleteAnalysisById(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { analysis: null, error: 'Não autenticado. Faça login para ver a análise.' }
    }

    const analysis = await db.completeAnalysis.findUnique({
      where: {
        id: id,
        userId: session.user.id, // Security check: user can only access their own analyses
      },
    })

    if (!analysis) {
      return { analysis: null, error: 'Análise não encontrada ou você não tem permissão para visualizá-la.' }
    }

    return { analysis, error: null }
  } catch (error) {
    console.error('[GET_COMPLETE_ANALYSIS_BY_ID]', error)
    return { analysis: null, error: 'Ocorreu um erro no servidor ao buscar a análise.' }
  }
}