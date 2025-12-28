'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface UserCredit {
  userId: string
  balance: number
  totalPurchased: number
  totalUsed: number
  userName: string | null
  userEmail: string | null
}

export function UserCreditsTable() {
  const [users, setUsers] = useState<UserCredit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/credits/users')
      const data = await res.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Carregando usuários...</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créditos por Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-muted-foreground">Nenhum usuário com créditos encontrado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Total Comprado</TableHead>
                <TableHead className="text-right">Total Usado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.userName || 'Sem nome'}</p>
                      <p className="text-sm text-muted-foreground">{user.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{user.balance}</TableCell>
                  <TableCell className="text-right">{user.totalPurchased}</TableCell>
                  <TableCell className="text-right">{user.totalUsed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
