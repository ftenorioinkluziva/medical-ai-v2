'use client'

/**
 * Analysis Chat Component
 * Real-time chat with AI agent about analysis results
 */

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Send, Loader2, AlertCircle, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface AnalysisChatProps {
  analysisId: string
  agentName: string
  agentColor: string
  agentInitial: string
  className?: string
}

export function AnalysisChat({
  analysisId,
  agentName,
  agentColor,
  agentInitial,
  className = '',
}: AnalysisChatProps) {
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    sendMessage,
    status,
    error,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/chat/${analysisId}`,
    }),
    onFinish: () => {
      setMessageCount(prev => prev + 2) // User message + assistant response
    },
  })

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory()
  }, [analysisId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true)
      setHistoryError(null)

      const response = await fetch(`/api/chat/${analysisId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar histórico')
      }

      if (data.messages && data.messages.length > 0) {
        // Convert legacy format to v5 format
        setMessages(
          data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            parts: [{ type: 'text' as const, text: msg.content }],
            createdAt: new Date(msg.createdAt),
          }))
        )
        setMessageCount(data.messages.length)
      } else {
        // Add welcome message if no history
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            parts: [{ type: 'text' as const, text: `Olá! Sou o ${agentName}. Posso esclarecer qualquer dúvida sobre sua análise médica. Como posso ajudá-lo?` }],
          },
        ])
      }
    } catch (err) {
      console.error('Error loading chat history:', err)
      setHistoryError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageCount >= 50) {
      alert('Limite de 50 mensagens por chat atingido.')
      return
    }
    if (!input.trim()) return

    sendMessage({ text: input })
    setInput('')
  }

  const getAgentColor = (color: string) => {
    const colorMap: Record<string, string> = {
      green: 'bg-green-100 text-green-700 border-green-300',
      purple: 'bg-purple-100 text-purple-700 border-purple-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300',
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      teal: 'bg-teal-100 text-teal-700 border-teal-300',
    }
    return colorMap[color] || colorMap.teal
  }

  const getMessageText = (message: any): string => {
    if (message.parts) {
      const textParts = message.parts.filter((part: any) => part.type === 'text')
      return textParts.map((part: any) => part.text).join('')
    }
    return message.content || ''
  }

  const isStreaming = status === 'streaming'
  const isReady = status === 'ready'

  if (isLoadingHistory) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
            <p className="text-gray-600">Carregando conversa...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (historyError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-red-50 border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Erro ao carregar chat</p>
              <p className="text-sm text-red-700 mt-1">{historyError}</p>
            </div>
            <Button
              onClick={loadChatHistory}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Avatar className={`border-2 ${getAgentColor(agentColor)}`}>
            <AvatarFallback className={getAgentColor(agentColor)}>
              {agentInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5" />
              Conversar com {agentName}
            </CardTitle>
            <CardDescription>
              Tire suas dúvidas sobre a análise • {messageCount}/50 mensagens
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages Container */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <Avatar className={`h-8 w-8 shrink-0 border-2 ${
                message.role === 'user'
                  ? 'bg-muted text-foreground border-gray-300'
                  : getAgentColor(agentColor)
              }`}>
                <AvatarFallback className={
                  message.role === 'user'
                    ? 'bg-muted text-foreground'
                    : getAgentColor(agentColor)
                }>
                  {message.role === 'user' ? <User className="h-4 w-4" /> : agentInitial}
                </AvatarFallback>
              </Avatar>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-muted text-gray-900'
                    : 'bg-card border border-border'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{getMessageText(message)}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{getMessageText(message)}</p>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isStreaming && (
            <div className="flex gap-3">
              <Avatar className={`h-8 w-8 shrink-0 border-2 ${getAgentColor(agentColor)}`}>
                <AvatarFallback className={getAgentColor(agentColor)}>
                  {agentInitial}
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-gray-500">Pensando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-700">
              ❌ Erro: {error.message || 'Falha ao enviar mensagem'}
            </p>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua pergunta sobre a análise..."
              className="min-h-[60px] resize-none"
              disabled={!isReady || messageCount >= 50}
              maxLength={1000}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleFormSubmit(e)
                }
              }}
            />
            <Button
              type="submit"
              disabled={!isReady || !input.trim() || messageCount >= 50}
              className="shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Pressione Enter para enviar, Shift+Enter para nova linha • {input.length}/1000
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
