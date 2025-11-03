/**
 * Document Chunking
 * Intelligent chunking strategy for medical documents
 */

import type { DocumentChunk } from './types'

export interface ChunkingOptions {
  maxChunkSize?: number // Characters per chunk
  minChunkSize?: number // Minimum chunk size
  overlap?: number // Character overlap between chunks
  preserveSections?: boolean // Try to keep sections together
}

const DEFAULT_OPTIONS: Required<ChunkingOptions> = {
  maxChunkSize: 1000,
  minChunkSize: 100,
  overlap: 200,
  preserveSections: true,
}

/**
 * Split text into intelligent chunks for medical documents
 */
export function chunkDocument(
  text: string,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  console.log(`✂️ [CHUNKING] Creating chunks (max: ${opts.maxChunkSize}, overlap: ${opts.overlap})`)

  const chunks: DocumentChunk[] = []

  // If text is short enough, return as single chunk
  if (text.length <= opts.maxChunkSize) {
    chunks.push({
      content: text,
      chunkIndex: 0,
      metadata: {
        startChar: 0,
        endChar: text.length,
        isSingleChunk: true,
      },
    })

    console.log(`✅ [CHUNKING] Text is short, created 1 chunk`)
    return chunks
  }

  // Try to split by sections first (if enabled)
  if (opts.preserveSections) {
    const sectionChunks = chunkBySections(text, opts)
    if (sectionChunks.length > 0) {
      console.log(`✅ [CHUNKING] Created ${sectionChunks.length} section-based chunks`)
      return sectionChunks
    }
  }

  // Fallback to sliding window chunking
  const slidingChunks = chunkBySlidingWindow(text, opts)

  console.log(`✅ [CHUNKING] Created ${slidingChunks.length} sliding window chunks`)
  return slidingChunks
}

/**
 * Chunk by medical sections (headings, separators)
 */
function chunkBySections(
  text: string,
  opts: Required<ChunkingOptions>
): DocumentChunk[] {
  const chunks: DocumentChunk[] = []

  // Medical document section patterns
  const sectionPatterns = [
    /^#{1,3}\s+.+$/gm, // Markdown headings
    /^[A-ZÇÁÀÂÃÉÊÍÓÔÕÚ\s]{3,}:?\s*$/gm, // UPPERCASE HEADINGS
    /^-{3,}$/gm, // Horizontal rules (---)
    /^={3,}$/gm, // Horizontal rules (===)
    /^\d+\.\s+[A-Z].+$/gm, // Numbered sections
  ]

  // Try to split by sections
  const sections: Array<{ start: number; end: number; content: string }> = []
  let lastSectionEnd = 0

  // Find all section boundaries
  const allMatches: Array<{ index: number; text: string }> = []

  for (const pattern of sectionPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      allMatches.push({
        index: match.index,
        text: match[0],
      })
    }
  }

  // Sort by index
  allMatches.sort((a, b) => a.index - b.index)

  // Create sections
  for (let i = 0; i < allMatches.length; i++) {
    const match = allMatches[i]
    const nextMatch = allMatches[i + 1]

    const sectionStart = match.index
    const sectionEnd = nextMatch ? nextMatch.index : text.length

    const sectionContent = text.slice(sectionStart, sectionEnd).trim()

    if (sectionContent.length >= opts.minChunkSize) {
      sections.push({
        start: sectionStart,
        end: sectionEnd,
        content: sectionContent,
      })
    }
  }

  // If no sections found, return empty (will use sliding window)
  if (sections.length === 0) {
    return []
  }

  // Convert sections to chunks (split large sections if needed)
  let chunkIndex = 0

  for (const section of sections) {
    if (section.content.length <= opts.maxChunkSize) {
      // Section fits in one chunk
      chunks.push({
        content: section.content,
        chunkIndex: chunkIndex++,
        metadata: {
          startChar: section.start,
          endChar: section.end,
          isSection: true,
        },
      })
    } else {
      // Section is too large, split it
      const subChunks = chunkBySlidingWindow(section.content, opts)
      for (const subChunk of subChunks) {
        chunks.push({
          content: subChunk.content,
          chunkIndex: chunkIndex++,
          metadata: {
            startChar: section.start + subChunk.metadata.startChar,
            endChar: section.start + subChunk.metadata.endChar,
            isSection: true,
            isSubChunk: true,
          },
        })
      }
    }
  }

  return chunks
}

/**
 * Chunk using sliding window with overlap
 */
function chunkBySlidingWindow(
  text: string,
  opts: Required<ChunkingOptions>
): DocumentChunk[] {
  const chunks: DocumentChunk[] = []
  let chunkIndex = 0
  let startChar = 0

  while (startChar < text.length) {
    // Calculate end position
    let endChar = startChar + opts.maxChunkSize

    // If this is not the last chunk, try to break at a sentence or paragraph
    if (endChar < text.length) {
      // Look for paragraph break first (double newline)
      const paragraphBreak = text.lastIndexOf('\n\n', endChar)
      if (paragraphBreak > startChar && paragraphBreak > startChar + opts.minChunkSize) {
        endChar = paragraphBreak + 2
      } else {
        // Look for sentence break (period + space or newline)
        const sentenceBreaks = [
          text.lastIndexOf('. ', endChar),
          text.lastIndexOf('.\n', endChar),
          text.lastIndexOf('! ', endChar),
          text.lastIndexOf('? ', endChar),
        ]

        const bestBreak = Math.max(...sentenceBreaks)
        if (bestBreak > startChar && bestBreak > startChar + opts.minChunkSize) {
          endChar = bestBreak + 2
        }
      }
    }

    // Extract chunk
    const chunkContent = text.slice(startChar, endChar).trim()

    if (chunkContent.length >= opts.minChunkSize) {
      chunks.push({
        content: chunkContent,
        chunkIndex: chunkIndex++,
        metadata: {
          startChar,
          endChar,
          isSlidingWindow: true,
        },
      })
    }

    // Move to next chunk with overlap
    startChar = endChar - opts.overlap

    // Prevent infinite loop
    if (startChar <= chunks[chunks.length - 1]?.metadata.startChar) {
      startChar = endChar
    }
  }

  return chunks
}

/**
 * Chunk specifically for medical lab reports
 * Tries to keep each test/parameter together
 */
export function chunkLabReport(text: string): DocumentChunk[] {
  console.log(`🧪 [CHUNKING] Using lab report chunking strategy`)

  // Lab reports often have patterns like:
  // PARAMETER NAME
  // Value: X Unit
  // Reference: Y-Z
  // Or tables with test names and values

  // For now, use section-based chunking with smaller chunks
  return chunkDocument(text, {
    maxChunkSize: 800,
    minChunkSize: 100,
    overlap: 150,
    preserveSections: true,
  })
}

/**
 * Chunk for bioimpedance reports (InBody, etc.)
 * These often have structured sections
 */
export function chunkBioimpedanceReport(text: string): DocumentChunk[] {
  console.log(`⚖️ [CHUNKING] Using bioimpedance chunking strategy`)

  return chunkDocument(text, {
    maxChunkSize: 600,
    minChunkSize: 100,
    overlap: 100,
    preserveSections: true,
  })
}
