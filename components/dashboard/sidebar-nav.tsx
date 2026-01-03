'use client'

/**
 * Sidebar Navigation Component
 * Clean sidebar navigation with all menu options
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Home,
  FileText,
  FolderOpen,
  TrendingUp,
  Calendar,
  GitCompare,
  Coins,
  Sparkles,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarNavProps {
  userRole: string
}

export function SidebarNav({ userRole }: SidebarNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const navLinks = userRole === 'admin'
    ? [
        { href: '/admin', label: 'Admin', icon: Home },
        { href: '/admin/credits', label: 'Créditos', icon: Coins },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/analyze', label: 'Análise', icon: FileText },
        { href: '/analyze-complete', label: 'Análise Completa', icon: Sparkles },
        { href: '/recommendations', label: 'Recomendações', icon: TrendingUp },
        { href: '/weekly-plan', label: 'Plano Semanal', icon: Calendar },
        { href: '/analyses/compare', label: 'Comparar Análises', icon: ArrowLeftRight },
        { href: '/compare', label: 'Comparar Exames', icon: GitCompare },
        { href: '/documents', label: 'Documentos', icon: FolderOpen },
        { href: '/dashboard/credits', label: 'Créditos', icon: Coins },
        { href: '/profile', label: 'Perfil', icon: User },
      ]

  const isActive = (href: string) => pathname === href

  // Group navigation links
  const mainLinks = navLinks.slice(0, 3) // Dashboard, Análise, Análise Completa
  const toolLinks = navLinks.slice(3, 8) // Recomendações, Plano Semanal, Comparar Análises, Comparar Exames, Documentos
  const settingsLinks = navLinks.slice(8) // Créditos, Perfil

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-0 z-40 border-r bg-card/50 backdrop-blur-sm transition-all duration-300 hidden lg:flex flex-col',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Collapse Toggle - Integrated */}
      <div className={cn('flex items-center justify-between p-4 border-b', isCollapsed && 'justify-center')}>
        {!isCollapsed && (
          <span className="text-sm font-semibold text-foreground">Menu</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-4 space-y-6">
          {/* Main Navigation */}
          <nav className={cn('space-y-1', isCollapsed ? 'px-2' : 'px-3')}>
            {mainLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                    isCollapsed && 'justify-center px-2'
                  )}
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon className={cn('shrink-0', isCollapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                  {!isCollapsed && <span className="flex-1">{link.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Tools Section */}
          {toolLinks.length > 0 && (
            <>
              {!isCollapsed && (
                <div className="px-5 pt-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ferramentas
                  </h3>
                </div>
              )}
              {isCollapsed && <div className="h-px bg-border mx-4" />}

              <nav className={cn('space-y-1', isCollapsed ? 'px-2' : 'px-3')}>
                {toolLinks.map((link) => {
                  const Icon = link.icon
                  const active = isActive(link.href)

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                        isCollapsed && 'justify-center px-2'
                      )}
                      title={isCollapsed ? link.label : undefined}
                    >
                      <Icon className={cn('shrink-0', isCollapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                      {!isCollapsed && <span className="flex-1">{link.label}</span>}
                    </Link>
                  )
                })}
              </nav>
            </>
          )}

          {/* Settings Section */}
          {settingsLinks.length > 0 && (
            <>
              {!isCollapsed && (
                <div className="px-5 pt-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Configurações
                  </h3>
                </div>
              )}
              {isCollapsed && <div className="h-px bg-border mx-4" />}

              <nav className={cn('space-y-1', isCollapsed ? 'px-2' : 'px-3')}>
                {settingsLinks.map((link) => {
                  const Icon = link.icon
                  const active = isActive(link.href)

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                        isCollapsed && 'justify-center px-2'
                      )}
                      title={isCollapsed ? link.label : undefined}
                    >
                      <Icon className={cn('shrink-0', isCollapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                      {!isCollapsed && <span className="flex-1">{link.label}</span>}
                    </Link>
                  )
                })}
              </nav>
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
