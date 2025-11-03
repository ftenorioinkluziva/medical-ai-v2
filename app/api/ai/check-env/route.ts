/**
 * Check environment variables
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    googleKey: process.env.GOOGLE_AI_API_KEY ? 'Present (' + process.env.GOOGLE_AI_API_KEY.substring(0, 10) + '...)' : 'Missing',
    openaiKey: process.env.OPENAI_API_KEY ? 'Present (' + process.env.OPENAI_API_KEY.substring(0, 10) + '...)' : 'Missing',
  })
}
