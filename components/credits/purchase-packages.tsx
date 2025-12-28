'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Package {
  id: string
  name: string
  credits: number
  priceInCents: number
  displayOrder: number
}

export function PurchasePackages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  async function fetchPackages() {
    try {
      const res = await fetch('/api/credits/packages')
      const data = await res.json()
      setPackages(data.packages)
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePurchase(packageId: string) {
    setPurchasing(packageId)

    try {
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Falha ao iniciar compra. Tente novamente.')
        setPurchasing(null)
        return
      }

      const { url } = data

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Falha ao iniciar compra. Tente novamente.')
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return <p>Carregando pacotes...</p>
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{pkg.name}</CardTitle>
            <CardDescription>{pkg.credits.toLocaleString('pt-BR')} créditos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-4">
              <span className="text-4xl font-bold">
                R$ {(pkg.priceInCents / 100).toFixed(2)}
              </span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>{pkg.credits.toLocaleString('pt-BR')} créditos</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Créditos não expiram</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>~{Math.floor(pkg.credits / 75)} análises completas</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handlePurchase(pkg.id)}
              disabled={purchasing === pkg.id}
            >
              {purchasing === pkg.id ? 'Processando...' : 'Comprar'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
