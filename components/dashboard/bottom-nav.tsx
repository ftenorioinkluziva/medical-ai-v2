'use client'

/**
 * Bottom Navigation Component - Mobile Only
 * Fixed bottom navigation bar with primary actions
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, FolderOpen, User, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  userRole: string
}

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname()

  // Admin users have different primary navigation
  const navItems = userRole === 'admin'
    ? [
        { href: '/admin', label: 'Admin', icon: Home },
        { href: '/admin/credits', label: 'Créditos', icon: FileText },
      ]
    : [
        { href: '/dashboard', label: 'Início', icon: Home },
        { href: '/analyze', label: 'Análise', icon: FileText },
        { href: '/chat', label: 'Chat', icon: MessageCircle },
        { href: '/documents', label: 'Docs', icon: FolderOpen },
        { href: '/profile', label: 'Perfil', icon: User },
      ]

  const isActive = (href: string) => {
    // Exact match for dashboard/admin
    if (href === '/dashboard' || href === '/admin') {
      return pathname === href
    }
    // Starts with for other routes
    return pathname.startsWith(href)
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[44px] transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform",
                active && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
