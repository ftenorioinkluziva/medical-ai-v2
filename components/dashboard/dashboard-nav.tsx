'use client'

/**
 * Dashboard Navigation Component - Minimal Health Design
 * Clean, professional navigation focused on usability
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, Heart, LogOut, User } from 'lucide-react'
import { handleSignOut } from '@/app/actions/auth'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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

  // Admin users only see Admin link, others see regular dashboard links
  const navLinks = userRole === 'admin'
    ? [{ href: '/admin', label: 'Admin' }]
    : [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/analyze', label: 'Análise' },
        { href: '/analyze-complete', label: 'Análise Completa' },
        { href: '/recommendations', label: 'Recomendações' },
        { href: '/weekly-plan', label: 'Plano Semanal' },
        { href: '/compare', label: 'Comparar' },
        { href: '/documents', label: 'Documentos' },
        { href: '/profile', label: 'Perfil' },
      ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href={userRole === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">Medical AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side - User & Actions */}
        <div className="flex items-center gap-3">
          {/* User Info */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{userName}</span>
              <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
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
              variant="ghost"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
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
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* User Info Card */}
                <div className="p-3 rounded-lg bg-accent border border-border">
                  <p className="text-sm font-semibold text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{userRole}</p>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Theme Toggle Mobile */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
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
                      className="w-full"
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
