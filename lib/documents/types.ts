/**
 * Document Processing Types
 */

export type DocumentType =
  | 'lab_report'           // Exames laboratoriais
  | 'bioimpedance'         // Bioimpedância (InBody, etc.)
  | 'medical_report'       // Relatórios médicos gerais
  | 'prescription'         // Receitas médicas
  | 'imaging'              // Exames de imagem (raio-x, ressonância, etc.)
  | 'other'                // Outros documentos médicos

export type FileType =
  | 'pdf'
  | 'image'
  | 'unknown'

export interface DocumentMetadata {
  fileName: string
  fileSize: number
  fileType: FileType
  mimeType: string
  uploadedAt: Date
  documentType?: DocumentType
  examDate?: string
  patientName?: string
  providerName?: string
  [key: string]: any
}

export interface ProcessedDocument {
  text: string
  metadata: DocumentMetadata
  processedBy: 'pdf' | 'vision' | 'hybrid'
  confidence?: number
  extractedData?: Record<string, any>
}

export interface DocumentChunk {
  content: string
  chunkIndex: number
  metadata: {
    startChar: number
    endChar: number
    [key: string]: any
  }
}

export interface ChunkWithEmbedding extends DocumentChunk {
  embedding: number[]
  embeddingModel: string
  embeddingProvider: 'google' | 'openai'
}

export interface ProcessingResult {
  success: boolean
  documentId?: string
  text: string
  chunks: DocumentChunk[]
  chunksWithEmbeddings: ChunkWithEmbedding[]
  metadata: DocumentMetadata
  modulesCount?: number // Number of structured medical modules extracted
  stats: {
    textLength: number
    chunksCount: number
    processingTimeMs: number
    embeddingTimeMs: number
  }
  error?: string
}
