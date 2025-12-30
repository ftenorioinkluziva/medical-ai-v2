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
        { href: '/compare', label: 'Comparar', icon: GitCompare },
        { href: '/documents', label: 'Documentos', icon: FolderOpen },
        { href: '/dashboard/credits', label: 'Créditos', icon: Coins },
        { href: '/profile', label: 'Perfil', icon: User },
      ]

  const isActive = (href: string) => pathname === href

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-0 z-40 border-r bg-card transition-all duration-300 hidden lg:block',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-card shadow-sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <ScrollArea className="h-full py-6">
        <nav className="space-y-1 px-3">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
