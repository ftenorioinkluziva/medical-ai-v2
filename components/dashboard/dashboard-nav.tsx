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
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Medical AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
            <User className="h-4 w-4 text-gray-600" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{userName}</span>
              <span className="text-xs text-gray-500 capitalize">{userRole}</span>
            </div>
          </div>

          {/* Desktop Sign Out */}
          <form action={handleSignOut} className="hidden lg:block">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
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
                  <Heart className="h-5 w-5 text-teal-600" />
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* User Info Card */}
                <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-600 capitalize mt-0.5">{userRole}</p>
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
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

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
