# Billing System Setup Guide

## Overview

The Medical AI V2 platform now includes a credit-based billing system where users purchase credits via Stripe and credits are debited based on AI token usage.

## Architecture

- **Payment Gateway:** Stripe (with PIX support for Brazil)
- **Pricing Model:** Pay-as-you-go (1 credit = 1,000 tokens)
- **Credit Pricing:** R$ 0.50 per credit (~300-400% margin over Gemini API costs)
- **No Expiration:** Credits never expire

## Database Tables

The system adds 6 new tables to the database:

1. **`user_credits`** - User credit balances
2. **`credit_packages`** - Available packages for purchase
3. **`credit_transactions`** - Transaction history
4. **`stripe_payments`** - Stripe payment records
5. **`token_usage_logs`** - Detailed AI usage tracking
6. **`billing_config`** - System configuration

## Setup Instructions

### 1. Database Migration

The migration file has been generated at: `lib/db/migrations/0009_breezy_sway.sql`

**Apply migration manually:**
```bash
psql $DATABASE_URL -f lib/db/migrations/0009_breezy_sway.sql
```

**Seed credit packages and configuration:**
```bash
pnpm db:seed
```

This will create:
- 3 credit packages (Starter, Professional, Enterprise)
- Billing configuration (API limits, alert thresholds)

### 2. Stripe Configuration

#### Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard → Developers → API keys

#### Configure Environment Variables

Add to `.env.local`:
```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Set Up Stripe Products (One-time setup)

Create a sync script or manually create products in Stripe Dashboard:

**Option A: Manual (Stripe Dashboard)**
1. Go to Products → Add Product
2. Create 3 products matching your packages:
   - Starter: R$ 30.00 (100 credits)
   - Professional: R$ 200.00 (500 credits)
   - Enterprise: R$ 700.00 (2000 credits)
3. Copy Price IDs and update database

**Option B: Automated (Recommended)**
```bash
# Create lib/billing/sync-stripe-products.ts
tsx --env-file=.env.local lib/billing/sync-stripe-products.ts
```

#### Configure Webhooks

**Development (Stripe CLI):**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# Or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy webhook secret from output to .env.local
```

**Production (Stripe Dashboard):**
1. Go to Developers → Webhooks → Add endpoint
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
4. Copy webhook secret to production environment variables

### 3. Verify Installation

**Check database tables:**
```bash
psql $DATABASE_URL -c "\dt billing_config credit_packages credit_transactions stripe_payments token_usage_logs user_credits"
```

**Test API endpoints:**
```bash
# Get credit packages (public)
curl http://localhost:3000/api/credits/packages

# Get balance (requires auth)
curl http://localhost:3000/api/credits/balance \
  -H "Cookie: your-session-cookie"
```

## API Endpoints

### User Endpoints

- `GET /api/credits/balance` - Get current credit balance
- `GET /api/credits/packages` - List available packages
- `POST /api/credits/purchase` - Create Stripe checkout session
- `GET /api/credits/history` - Get transaction history

### Admin Endpoints

- `GET /api/admin/credits/stats` - System-wide statistics
- `GET /api/admin/credits/users` - User credit balances
- `POST /api/admin/credits/adjust` - Manual credit adjustment

### Webhook

- `POST /api/webhooks/stripe` - Stripe webhook handler

## Credit Flow

### Purchase Flow

1. User selects package → Frontend calls `/api/credits/purchase`
2. System checks API limits (prevents overselling)
3. Creates Stripe Checkout session
4. User completes payment
5. Stripe webhook `/api/webhooks/stripe` receives event
6. System validates payment and grants credits
7. Credits added to `user_credits` table

### Analysis Flow

1. User requests analysis → `/api/agents/[agentId]/analyze`
2. System checks credit balance (requires ~100 credits)
3. System checks rate limits (hourly/daily)
4. If sufficient, proceeds with analysis
5. After analysis completes, debits actual tokens used
6. Logs usage in `token_usage_logs` table

## Rate Limiting

**User Limits:**
- **Hourly:** 500,000 tokens (prevents abuse)
- **Daily:** 2,000,000 tokens (fair usage)

**System Limits:**
- Monitors sold credits vs. Gemini API monthly limit
- Auto-pauses sales when approaching 80% of API limit
- Admin alerts when threshold reached

## Pricing Configuration

Default packages (can be modified in database):

| Package      | Credits | Price (BRL) | Analyses |
|--------------|---------|-------------|----------|
| Starter      | 100     | R$ 30.00    | ~1-2     |
| Professional | 500     | R$ 200.00   | ~5-10    |
| Enterprise   | 2,000   | R$ 700.00   | ~20-40   |

**Update billing configuration:**
```sql
-- Change API monthly limit
UPDATE billing_config
SET value = '200000000'
WHERE key = 'api_monthly_limit_tokens';

-- Change alert threshold
UPDATE billing_config
SET value = '90'
WHERE key = 'alert_threshold_percent';
```

## Admin Dashboard

Access admin features at `/admin/credits` (admin role required):

- **System Health:** Total credits sold vs. API limit
- **Usage Stats:** Tokens used last 30 days, analysis count
- **User Management:** View all user balances
- **Manual Adjustments:** Add/remove credits with reason

## Monitoring

### Key Metrics to Monitor

1. **Total Credits in Circulation:** Sum of all user balances
2. **Potential Token Usage:** Credits × 1000
3. **Actual Usage:** Tokens consumed last 30 days
4. **API Usage %:** Potential tokens / API monthly limit

### Alerts

Set up monitoring for:
- Potential usage > 80% of API limit
- Payment webhook failures
- Unusual token consumption patterns
- Low credit warnings for users

## Testing

### Test Payment Flow (Test Mode)

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`

### Test Analysis Flow

1. Create test user
2. Manually add credits via admin panel
3. Request analysis
4. Verify credit debit and usage logs

## Troubleshooting

### Webhooks Not Working

```bash
# Check webhook signature
stripe trigger checkout.session.completed

# Verify endpoint
curl -X POST http://localhost:3000/api/webhooks/stripe
```

### Credits Not Debiting

Check logs:
```bash
# Look for credit debit errors
grep "Failed to debit credits" logs/app.log
```

### Migration Conflicts

If migration fails due to existing tables:
```bash
# Check existing billing tables
psql $DATABASE_URL -c "\dt *credit*"

# Drop and recreate if needed (⚠️ DESTROYS DATA)
psql $DATABASE_URL -c "DROP TABLE IF EXISTS user_credits CASCADE"
```

## Security

- ✅ Webhook signature verification enabled
- ✅ Admin routes protected by role check
- ✅ Transaction isolation for credit operations
- ✅ Rate limiting prevents abuse
- ✅ HTTPS required for production webhooks

## Next Steps

1. **UI Components** - Create user-facing credit purchase interface
2. **User Registration Hook** - Auto-initialize credits for new users
3. **Email Notifications** - Low balance alerts, purchase confirmations
4. **Analytics Dashboard** - User-facing usage statistics

## Support

For issues or questions:
- Check logs: `console.error` outputs in development
- Stripe Dashboard: View payment events and webhook logs
- Database: Query `credit_transactions` and `token_usage_logs` tables
