import { requireAuth } from '@/lib/auth/session'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/config'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold">
              Medical AI v2
            </Link>
            <nav className="hidden md:flex gap-4">
              <Link href="/dashboard" className="text-sm hover:underline">
                Dashboard
              </Link>
              <Link href="/analyze" className="text-sm hover:underline">
                Análise
              </Link>
              <Link href="/analyses" className="text-sm hover:underline">
                Histórico
              </Link>
              <Link href="/compare" className="text-sm hover:underline">
                Comparar
              </Link>
              <Link href="/documents" className="text-sm hover:underline">
                Documentos
              </Link>
              <Link href="/profile" className="text-sm hover:underline">
                Perfil
              </Link>
              {session.user?.role === 'admin' && (
                <Link href="/admin" className="text-sm hover:underline">
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user?.name}
            </span>
            <form
              action={async () => {
                'use server'
                await signOut()
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
