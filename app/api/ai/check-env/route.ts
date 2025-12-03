/**
 * Check environment variables for AI providers
 * Primary: Google AI (required)
 * Legacy: OpenAI (optional)
 */

import { NextResponse } from 'next/server'

export async function GET() {
  const googleKey = process.env.GOOGLE_AI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  return NextResponse.json({
    providers: {
      google: {
        status: googleKey ? 'configured' : 'missing',
        key: googleKey ? googleKey.substring(0, 10) + '...' : null,
        required: true,
      },
      openai: {
        status: openaiKey ? 'configured' : 'not-configured',
        key: openaiKey ? openaiKey.substring(0, 10) + '...' : null,
        required: false,
        note: 'Legacy support only - not required for system operation',
      },
    },
    systemReady: !!googleKey,
  })
}
