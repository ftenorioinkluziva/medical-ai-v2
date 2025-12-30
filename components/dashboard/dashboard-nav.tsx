'use client'

/**
 * Dashboard Navigation Component - Minimal Health Design
 * Clean, professional navigation focused on usability
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Menu,
  Heart,
  LogOut,
  User,
  Home,
  FileText,
  FolderOpen,
  TrendingUp,
  Calendar,
  GitCompare,
  Coins,
  Sparkles,
} from 'lucide-react'
import { handleSignOut } from '@/app/actions/auth'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CreditBadge } from '@/components/credits/credit-badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface DashboardNavProps {
  userName: string
  userRole: string
}

export function DashboardNav({ userName, userRole }: DashboardNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Desktop navigation (all links) - shown on lg+ screens
  const desktopNavLinks = userRole === 'admin'
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

  // Mobile menu navigation (secondary actions only - primary ones are in BottomNav)
  const mobileMenuLinks = userRole === 'admin'
    ? [
        { href: '/admin', label: 'Admin', icon: Home },
        { href: '/admin/credits', label: 'Créditos', icon: Coins },
      ]
    : [
        { href: '/analyze', label: 'Análise', icon: FileText },
        { href: '/analyze-complete', label: 'Análise Completa', icon: Sparkles },
        { href: '/recommendations', label: 'Recomendações', icon: TrendingUp },
        { href: '/weekly-plan', label: 'Plano Semanal', icon: Calendar },
        { href: '/compare', label: 'Comparar', icon: GitCompare },
        { href: '/dashboard/credits', label: 'Créditos', icon: Coins },
      ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href={userRole === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">Medical AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-2">
            {desktopNavLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Side - User & Actions */}
        <div className="flex items-center gap-4">
          {/* Credits Badge */}
          {userRole !== 'admin' && (
            <div className="hidden sm:block">
              <CreditBadge />
            </div>
          )}

          {/* Divider */}
          <div className="hidden lg:block h-8 w-px bg-border" />

          {/* User Info */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-lg bg-accent/50 border border-border/50">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-tight">{userName}</span>
              <span className="text-xs text-muted-foreground capitalize leading-tight">{userRole}</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>

          {/* Desktop Sign Out */}
          <form action={handleSignOut} className="hidden lg:block">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </form>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* User Info Card */}
                <div className="p-4 rounded-lg bg-accent border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{userName}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{userRole}</p>
                    </div>
                  </div>
                  {userRole !== 'admin' && (
                    <div className="pt-3 border-t border-border/50">
                      <CreditBadge />
                    </div>
                  )}
                </div>

                {/* Mobile Navigation Links - Secondary only */}
                {mobileMenuLinks.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                      Mais Opções
                    </div>
                    <nav className="flex flex-col gap-1">
                      {mobileMenuLinks.map((link) => {
                        const Icon = link.icon
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                              isActive(link.href)
                                ? 'bg-accent text-accent-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span>{link.label}</span>
                          </Link>
                        )
                      })}
                    </nav>
                  </>
                )}

                {/* Theme Toggle Mobile */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-sm font-medium text-foreground">Tema</span>
                    <ThemeToggle />
                  </div>
                </div>

                {/* Mobile Sign Out */}
                <div className="pt-4 border-t">
                  <form action={handleSignOut}>
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full h-11"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </form>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
