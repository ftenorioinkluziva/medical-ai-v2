import { pgTable, uuid, varchar, integer, decimal, timestamp, text, boolean, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

// User credit balance
export const userCredits = pgTable('user_credits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  balance: integer('balance').notNull().default(0), // Current credit balance
  totalPurchased: integer('total_purchased').notNull().default(0), // Lifetime purchased
  totalUsed: integer('total_used').notNull().default(0), // Lifetime consumed
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('user_credits_user_id_idx').on(table.userId),
}))

// Credit packages for sale
export const creditPackages = pgTable('credit_packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(), // "Starter", "Professional"
  credits: integer('credits').notNull(), // Number of credits in package
  priceInCents: integer('price_in_cents').notNull(), // Price in centavos (BRL)
  stripePriceId: varchar('stripe_price_id', { length: 255 }), // Stripe Price ID
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Credit transactions (purchases and usage)
export const creditTransactions = pgTable('credit_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(), // 'purchase', 'debit', 'refund', 'admin_adjustment'
  amount: integer('amount').notNull(), // Positive for purchase/refund, negative for usage
  balanceAfter: integer('balance_after').notNull(), // Balance after this transaction
  description: text('description'),
  metadata: text('metadata'), // JSON: { analysisId, tokensUsed, stripePaymentId, etc. }
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('credit_transactions_user_id_idx').on(table.userId),
  typeIdx: index('credit_transactions_type_idx').on(table.type),
  createdAtIdx: index('credit_transactions_created_at_idx').on(table.createdAt),
}))

// Stripe payment records
export const stripePayments = pgTable('stripe_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }).notNull().unique(),
  stripeCheckoutSessionId: varchar('stripe_checkout_session_id', { length: 255 }),
  packageId: uuid('package_id').references(() => creditPackages.id),
  creditsGranted: integer('credits_granted').notNull(),
  amountInCents: integer('amount_in_cents').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('BRL'),
  status: varchar('status', { length: 20 }).notNull(), // 'pending', 'succeeded', 'failed', 'refunded'
  transactionId: uuid('transaction_id').references(() => creditTransactions.id), // Link to credit transaction
  metadata: text('metadata'), // JSON: raw Stripe event data
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('stripe_payments_user_id_idx').on(table.userId),
  statusIdx: index('stripe_payments_status_idx').on(table.status),
  paymentIntentIdx: index('stripe_payments_payment_intent_idx').on(table.stripePaymentIntentId),
}))

// Token usage logs (detailed tracking per AI call)
export const tokenUsageLogs = pgTable('token_usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  analysisId: uuid('analysis_id'), // May be null for other AI operations
  operation: varchar('operation', { length: 50 }).notNull(), // 'agent_analysis', 'document_structuring', 'recommendation'
  modelName: varchar('model_name', { length: 100 }).notNull(),
  promptTokens: integer('prompt_tokens').notNull().default(0),
  completionTokens: integer('completion_tokens').notNull().default(0),
  cachedTokens: integer('cached_tokens').notNull().default(0),
  totalTokens: integer('total_tokens').notNull(),
  creditsDebited: integer('credits_debited').notNull(), // Calculated from totalTokens
  transactionId: uuid('transaction_id').references(() => creditTransactions.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('token_usage_logs_user_id_idx').on(table.userId),
  analysisIdIdx: index('token_usage_logs_analysis_id_idx').on(table.analysisId),
  createdAtIdx: index('token_usage_logs_created_at_idx').on(table.createdAt),
}))

// System billing alerts and limits
export const billingConfig = pgTable('billing_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(), // 'api_monthly_limit_tokens', 'alert_threshold_percent'
  value: text('value').notNull(), // JSON or string value
  description: text('description'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Relations
export const userCreditsRelations = relations(userCredits, ({ one }) => ({
  user: one(users, { fields: [userCredits.userId], references: [users.id] }),
}))

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, { fields: [creditTransactions.userId], references: [users.id] }),
}))

export const stripePaymentsRelations = relations(stripePayments, ({ one }) => ({
  user: one(users, { fields: [stripePayments.userId], references: [users.id] }),
  package: one(creditPackages, { fields: [stripePayments.packageId], references: [creditPackages.id] }),
  transaction: one(creditTransactions, { fields: [stripePayments.transactionId], references: [creditTransactions.id] }),
}))

export const tokenUsageLogsRelations = relations(tokenUsageLogs, ({ one }) => ({
  user: one(users, { fields: [tokenUsageLogs.userId], references: [users.id] }),
  transaction: one(creditTransactions, { fields: [tokenUsageLogs.transactionId], references: [creditTransactions.id] }),
}))
