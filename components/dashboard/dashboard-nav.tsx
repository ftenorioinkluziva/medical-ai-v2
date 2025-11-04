'use client'

/**
 * Dashboard Navigation Component
 * Responsive navigation with mobile menu
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { handleSignOut } from '@/app/actions/auth'
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

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/analyze', label: 'Análise' },
    { href: '/analyses', label: 'Histórico' },
    { href: '/recommendations', label: 'Recomendações' },
    { href: '/weekly-plan', label: 'Plano Semanal' },
    { href: '/compare', label: 'Comparar' },
    { href: '/documents', label: 'Documentos' },
    { href: '/profile', label: 'Perfil' },
  ]

  if (userRole === 'admin') {
    navLinks.push({ href: '/admin', label: 'Admin' })
  }

  const isActive = (href: string) => pathname === href

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            Medical AI v2
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive(link.href)
                    ? 'text-primary font-medium underline'
                    : 'text-muted-foreground hover:text-foreground hover:underline'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side - User & Actions */}
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-muted-foreground">
            {userName}
          </span>

          {/* Desktop Sign Out */}
          <form action={handleSignOut} className="hidden lg:block">
            <Button type="submit" variant="outline" size="sm">
              Sair
            </Button>
          </form>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* User Info */}
                <div className="pb-4 border-b">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {userRole}
                  </p>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive(link.href)
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Sign Out */}
                <div className="pt-4 border-t">
                  <form action={handleSignOut}>
                    <Button type="submit" variant="outline" className="w-full">
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
