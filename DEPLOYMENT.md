# Deployment Guide - Medical AI V2

## Pre-Deployment Checklist

### 1. Local Testing
```bash
# Clean build
rm -rf .next
pnpm build

# Test build locally
pnpm start

# Check database connectivity and migrations
pnpm db:check
```

### 2. Environment Variables

Ensure all required variables are set in production:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string with SSL
- `GOOGLE_GENERATIVE_AI_API_KEY` - For AI operations
- `NEXTAUTH_SECRET` - Auth secret (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Production URL (e.g., `https://yourdomain.com`)

**Optional:**
- `STRIPE_SECRET_KEY` - For billing
- `STRIPE_PUBLISHABLE_KEY` - For billing
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks
- `NEXT_PUBLIC_APP_URL` - App URL for redirects

### 3. Database Migrations

**CRITICAL:** Always run migrations before deploying new code!

```bash
# Connect to production database
DATABASE_URL="your_production_url" pnpm db:migrate

# Verify migrations were applied
DATABASE_URL="your_production_url" pnpm db:check
```

## Deployment Process

### Vercel Deployment

1. **Push to Git**
   ```bash
   git add .
   git commit -m "your commit message"
   git push origin main
   ```

2. **Wait for Build**
   - Check Vercel dashboard for build status
   - Verify no build errors

3. **Run Migrations**
   ```bash
   # In Vercel project settings, add DATABASE_URL
   # Then run migrations via Vercel CLI or dashboard terminal
   vercel env pull
   pnpm db:migrate
   ```

4. **Verify Deployment**
   - Test key features
   - Check error logs in Vercel dashboard

### Railway/Render Deployment

1. **Ensure Environment Variables**
   - Add all required env vars in platform dashboard

2. **Run Migrations First**
   ```bash
   # Use platform's terminal or CLI
   pnpm db:migrate
   ```

3. **Deploy**
   ```bash
   git push origin main
   # Platform auto-deploys
   ```

## Common Production Errors

### 1. "Failed to find Server Action"

**Cause:** Client-server mismatch after deployment

**Solution:**
1. Ensure deployment finished completely
2. Clear browser cache (Ctrl+Shift+R)
3. Check only one version is running
4. Verify build succeeded without errors

**Prevention:**
- Always do clean builds: `rm -rf .next && pnpm build`
- Wait for deployment to fully complete before testing
- Use deployment previews for testing first

### 2. "ETIMEDOUT" Database Errors

**Cause:** Database connection timeout or migrations not applied

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database is accessible
3. Run `pnpm db:check` to diagnose
4. Apply missing migrations: `pnpm db:migrate`

**Prevention:**
- Always run migrations before code deployment
- Use `db:check` script before deploying
- Monitor database connectivity

### 3. "Column does not exist"

**Cause:** Migrations not applied in production

**Solution:**
1. Run `pnpm db:check` to see which migrations are missing
2. Apply migrations: `pnpm db:migrate`
3. Redeploy if necessary

**Prevention:**
- Migration-first deployment strategy
- Include migration step in CI/CD pipeline

## Rollback Procedure

If deployment fails:

1. **Revert to previous deployment**
   - Vercel: Use dashboard to rollback
   - Other: `git revert` and redeploy

2. **Check database state**
   ```bash
   pnpm db:check
   ```

3. **Rollback migrations if needed**
   - Carefully review migration files
   - Create reverse migration if required

## Monitoring

### Post-Deployment Checks

- [ ] Homepage loads
- [ ] Login/authentication works
- [ ] Document upload works
- [ ] Analysis generation works
- [ ] Admin panel accessible
- [ ] No errors in logs

### Log Monitoring

**Vercel:**
```bash
vercel logs
```

**Railway:**
- Check logs in dashboard

**Key errors to watch:**
- Server action errors
- Database connection errors
- API endpoint errors
- Unhandled promise rejections

## Performance Optimization

### Database Connection Pool

Current settings (`lib/db/client.ts`):
- `max: 20` - Maximum connections
- `connectionTimeoutMillis: 20000` - 20 second timeout
- `statement_timeout: 60000` - 60 second query timeout

Adjust based on:
- Database plan limits
- Expected concurrent users
- Query complexity

### Next.js Build

For faster builds:
```bash
# Use Turbopack (Next.js 16+)
pnpm build

# Analyze bundle size
pnpm build -- --profile
```

## Troubleshooting Commands

```bash
# Check database status
pnpm db:check

# View current migrations
psql $DATABASE_URL -c "SELECT * FROM __drizzle_migrations ORDER BY created_at DESC;"

# Test database connectivity
psql $DATABASE_URL -c "SELECT NOW();"

# Check table structure
psql $DATABASE_URL -c "\d complete_analyses"

# View production logs
vercel logs --follow

# Test production build locally
pnpm build && pnpm start
```

## CI/CD Integration

Recommended GitHub Actions workflow:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        run: pnpm db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Build
        run: pnpm build

      - name: Deploy to Vercel
        run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## Security Checklist

Before production deployment:

- [ ] All environment variables use secrets (not committed to git)
- [ ] Database has SSL enabled (`?sslmode=require`)
- [ ] NEXTAUTH_SECRET is cryptographically random
- [ ] API routes have proper authentication checks
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled for public endpoints
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are up to date (`pnpm audit`)

## Support

If issues persist:
1. Check logs first
2. Run diagnostic script: `pnpm db:check`
3. Review recent changes in git history
4. Check platform status page (Vercel/Railway status)
