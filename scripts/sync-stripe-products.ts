#!/usr/bin/env tsx
/**
 * Script para criar/sincronizar produtos e preços no Stripe
 */

import { db } from '../lib/db/client'
import { creditPackages } from '../lib/db/schema'
import { stripe } from '../lib/billing/stripe-client'
import { eq } from 'drizzle-orm'

async function main() {
  console.log('🔄 Sincronizando produtos com Stripe...\n')

  // Get all packages from database
  const packages = await db
    .select()
    .from(creditPackages)
    .orderBy(creditPackages.displayOrder)

  console.log(`📦 Encontrados ${packages.length} pacotes no banco de dados\n`)

  for (const pkg of packages) {
    console.log(`📦 Processando: ${pkg.name}`)
    console.log(`   Créditos: ${pkg.credits}`)
    console.log(`   Preço: R$ ${(pkg.priceInCents / 100).toFixed(2)}`)

    try {
      // Check if product already exists
      if (pkg.stripePriceId) {
        console.log(`   ⏭️  Já possui Price ID: ${pkg.stripePriceId}`)
        console.log()
        continue
      }

      // Create product in Stripe
      console.log('   🔄 Criando produto no Stripe...')
      const product = await stripe.products.create({
        name: `${pkg.name} - ${pkg.credits} Créditos`,
        description: `Pacote de ${pkg.credits} créditos para análises médicas com IA`,
        metadata: {
          package_id: pkg.id,
          credits: pkg.credits.toString(),
        },
      })

      console.log(`   ✅ Produto criado: ${product.id}`)

      // Create price in Stripe
      console.log('   🔄 Criando preço no Stripe...')
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.priceInCents,
        currency: 'brl',
        metadata: {
          package_id: pkg.id,
        },
      })

      console.log(`   ✅ Preço criado: ${price.id}`)

      // Update database with Stripe Price ID
      await db
        .update(creditPackages)
        .set({ stripePriceId: price.id })
        .where(eq(creditPackages.id, pkg.id))

      console.log(`   ✅ Banco de dados atualizado`)
      console.log()
    } catch (error) {
      if (error instanceof Error) {
        console.error(`   ❌ Erro: ${error.message}`)
      } else {
        console.error('   ❌ Erro desconhecido:', error)
      }
      console.log()
    }
  }

  console.log('✅ Sincronização concluída!')
  console.log('\n💡 Próximos passos:')
  console.log('   1. Verifique os produtos em: https://dashboard.stripe.com/test/products')
  console.log('   2. Teste a compra: pnpm tsx scripts/test-stripe-checkout.ts')
}

main().catch((error) => {
  console.error('❌ Erro:', error)
  process.exit(1)
})
