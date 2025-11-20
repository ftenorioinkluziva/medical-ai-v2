'use client'

/**
 * Admin Dashboard Page
 * Main admin panel with overview and navigation
 */

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Bot,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  Activity,
  TrendingUp,
  Brain,
} from 'lucide-react'

export default function AdminPage() {
  const adminSections = [
    {
      title: 'Health Agents',
      description: 'Gerenciar agentes de IA especializados',
      icon: Bot,
      href: '/admin/agents',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Usuários',
      description: 'Gerenciar usuários e permissões',
      icon: Users,
      href: '/admin/users',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Base de Conhecimento',
      description: 'Gerenciar artigos médicos e conteúdo',
      icon: BookOpen,
      href: '/admin/knowledge',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      title: 'Cérebro Lógico',
      description: 'Gerenciar biomarcadores e protocolos',
      icon: Brain,
      href: '/admin/medical-knowledge',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
    },
    {
      title: 'Estatísticas',
      description: 'Visualizar métricas e relatórios',
      icon: BarChart3,
      href: '/admin/stats',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      disabled: true,
    },
    {
      title: 'Logs de Auditoria',
      description: 'Acompanhar atividades do sistema',
      icon: Activity,
      href: '/admin/logs',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      disabled: true,
    },
    {
      title: 'Configurações',
      description: 'Configurações gerais do sistema',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      disabled: true,
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie usuários, agentes de IA e configurações do sistema
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Usuários</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-6 w-6 text-muted-foreground" />
              -
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Health Agents Ativos</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Bot className="h-6 w-6 text-muted-foreground" />
              -
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Análises Hoje</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Activity className="h-6 w-6 text-muted-foreground" />
              -
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Artigos na Base</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
              -
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Admin Sections Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Gerenciamento</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => {
            const Icon = section.icon
            const isDisabled = section.disabled

            const CardComponent = (
              <Card
                className={`transition-all ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg cursor-pointer'
                } border-2 ${section.borderColor} ${section.bgColor}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Icon className={`h-6 w-6 ${section.color}`} />
                        {section.title}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                    {isDisabled && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Em breve
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isDisabled ? (
                    <Button variant="outline" className="w-full">
                      Acessar
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Indisponível
                    </Button>
                  )}
                </CardContent>
              </Card>
            )

            return isDisabled ? (
              <div key={section.title}>{CardComponent}</div>
            ) : (
              <Link key={section.title} href={section.href}>
                {CardComponent}
              </Link>
            )
          })}
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">API de IA</span>
              </div>
              <span className="text-sm text-green-700">Operacional</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Banco de Dados</span>
              </div>
              <span className="text-sm text-green-700">Operacional</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Base de Conhecimento</span>
              </div>
              <span className="text-sm text-green-700">Operacional</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Acesso Administrativo</p>
              <p className="text-sm text-yellow-800 mt-1">
                Você está acessando o painel administrativo. Todas as ações são registradas nos logs de auditoria.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
