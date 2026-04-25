# Lexio Deployment Guide (MVP)

## Architecture

```
User → Cloudflare (DNS / CDN / DDoS) → Vercel (Next.js 15 app)
                                      → Supabase (DB / Auth / Edge Functions)
                                      → NVIDIA NIM API (AI generation)
                                      → Stripe (payments)
                                      → Resend (email)
```

## Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "regions": ["sao1"],
  "crons": [
    {
      "path": "/api/cron/reset-daily-lessons",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron/send-streak-reminders",
      "schedule": "0 11 * * *"
    }
  ]
}
```

> Cron times are UTC. `0 3 * * *` = midnight BRT (UTC-3). `0 11 * * *` = 8 AM BRT.

## Environment Separation

| Environment | URL | Purpose |
|-------------|-----|---------|
| `development` | localhost:3000 | Local dev — mock NVIDIA calls, local Supabase |
| `staging` | staging.lexio.oliceu.com | Pre-production — real NVIDIA API, test users |
| `production` | lexio.oliceu.com | Live beta — real users, credit monitoring active |

Set `NEXT_PUBLIC_APP_URL` per environment. Never use production Supabase credentials in local dev.

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - name: Validate prompt schemas
        run: npm run lint:prompts

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          alias-domains: lexio.oliceu.com
```

## Database Migrations

All schema changes go through Supabase migrations:

```bash
# Create migration
npx supabase migration new add_user_ab_group

# Apply locally
npx supabase db push

# Apply to production (CI/CD or manual)
npx supabase db push --db-url "$SUPABASE_PROD_DB_URL"
```

Migration files are committed to `/supabase/migrations/` and version-controlled.

## Rollback Strategy

| Layer | Rollback Method |
|-------|----------------|
| App (Vercel) | Instant rollback to previous deployment via Vercel dashboard |
| Database | Supabase point-in-time recovery (enable in project settings) |
| Prompts | `git revert` + redeploy — prompts are code |
| NVIDIA model | Change `PRIMARY_MODEL` env var + redeploy (no migration needed) |

Tag all releases: `git tag v1.0.0-mvp && git push --tags`

## Health Checks

- `/api/v1/health` — Public. Checks NIM + Supabase + credit status.
- Vercel monitors build + function errors automatically.
- Set up Vercel Speed Insights for Core Web Vitals tracking.

## Post-Deploy Checklist

```bash
# 1. Verify health endpoint
curl https://lexio.oliceu.com/api/v1/health

# 2. Test lesson generation with dummy_user
npm run test:e2e:smoke -- --env=production

# 3. Confirm crons registered
# Check Vercel dashboard → Cron Jobs tab

# 4. Verify NVIDIA credit counter resets (first of month)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://lexio.oliceu.com/api/admin/usage

# 5. Confirm Stripe webhook active
# Check Stripe dashboard → Webhooks → lexio.oliceu.com/api/webhooks/stripe
```
