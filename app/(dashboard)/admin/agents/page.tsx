'use client'

/**
 * Admin Health Agents Management Page
 * CRUD interface for health agents
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Bot,
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { AgentForm } from '@/components/admin/agent-form'

interface HealthAgent {
  id: string
  agentKey: string
  name: string
  title: string
  description: string
  color: string
  icon: string
  systemPrompt: string
  analysisPrompt: string
  modelName: string
  modelConfig: any
  isActive: boolean
  requiresApproval: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function AgentsManagementPage() {
  const [agents, setAgents] = useState<HealthAgent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<HealthAgent | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<HealthAgent | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/agents')
      if (!response.ok) {
        throw new Error('Erro ao carregar agentes')
      }

      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Error loading agents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAgent = () => {
    setSelectedAgent(null)
    setIsFormOpen(true)
  }

  const handleEditAgent = (agent: HealthAgent) => {
    setSelectedAgent(agent)
    setIsFormOpen(true)
  }

  const handleDeleteAgent = (agent: HealthAgent) => {
    setAgentToDelete(agent)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!agentToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/agents/${agentToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar agente')
      }

      await loadAgents()
      setIsDeleteDialogOpen(false)
      setAgentToDelete(null)
    } catch (error) {
      console.error('Error deleting agent:', error)
      alert('Erro ao deletar agente')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleActive = async (agent: HealthAgent) => {
    try {
      const response = await fetch(`/api/admin/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !agent.isActive,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      await loadAgents()
    } catch (error) {
      console.error('Error toggling agent status:', error)
      alert('Erro ao atualizar status do agente')
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedAgent(null)
    loadAgents()
  }

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agentKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando agentes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bot className="h-8 w-8" />
              Health Agents
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Gerenciar agentes de IA especializados do sistema
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateAgent} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedAgent ? 'Editar Agente' : 'Novo Agente'}
              </DialogTitle>
              <DialogDescription>
                {selectedAgent
                  ? 'Atualize as configurações do agente de IA'
                  : 'Configure um novo agente de IA especializado'}
              </DialogDescription>
            </DialogHeader>
            <AgentForm
              agent={selectedAgent}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Agentes</CardDescription>
            <CardTitle className="text-3xl">{agents.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Agentes Ativos</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">
              {agents.filter((a) => a.isActive).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Agentes Inativos</CardDescription>
            <CardTitle className="text-3xl text-gray-600 dark:text-gray-400">
              {agents.filter((a) => !a.isActive).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Agentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, chave ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Agents List */}
      {filteredAgents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'Nenhum agente encontrado' : 'Nenhum agente cadastrado'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Tente ajustar sua busca'
                : 'Crie seu primeiro agente de IA para começar'}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateAgent}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Agente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      agent.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      agent.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                      agent.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                      agent.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      agent.color === 'teal' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' :
                      agent.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                      agent.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                      'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                    }`}>
                      <Bot className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{agent.name}</h3>
                        {agent.isActive ? (
                          <Badge variant="default" className="bg-green-600 dark:bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                        <Badge variant="outline">{agent.agentKey}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{agent.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {agent.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          {agent.modelName}
                        </Badge>
                        {agent.tags && agent.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleActive(agent)}
                      title={agent.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {agent.isActive ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditAgent(agent)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteAgent(agent)}
                      title="Deletar"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o agente <strong>{agentToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
