# Security & Privacy Compliance (MVP)

## Regulatory Scope

- **LGPD** (Lei Geral de Proteção de Dados — Brazil): Primary obligation. Users are Brazilian.
- **GDPR**: Applied where relevant (EU users via Cloudflare edge). Follow as a quality floor.
- **Stripe PCI DSS**: Handled entirely by Stripe — Lexio never touches raw card data.

## Data Minimization

### Collected (Necessary)
| Data | Purpose | Stored Where |
|------|---------|-------------|
| Email | Auth identity | Supabase `auth.users` |
| PT-BR variant | MVP scope lock | `user_profiles` |
| Target language | MVP scope lock | `user_profiles` |
| CEFR level | Lesson adaptation | `user_profiles` |
| Interests (3 items) | Memory palace anchors | `user_profiles` |
| Lesson history | Progress tracking + adaptation | `lessons` |
| Self-ratings | Adaptive engine input | `lessons.self_rating` |
| Feedback tags | Methodology improvement | `feedback.error_tags` |

### Never Collected
| Data | Reason |
|------|--------|
| Full name | Not needed for auth or pedagogy |
| Phone number | Not needed |
| Physical address | Not needed |
| Raw Leo chat logs | Privacy — only structured `content` JSON stored |
| Voice / audio | MVP is text-only |
| Precise geolocation | Country-level only, from Cloudflare headers |
| Full NVIDIA API responses | Only parsed `content` JSON stored in `lessons` |

## Consent Flow

1. **Signup**: Mandatory terms acceptance (LGPD Art. 7 — contractual basis)
2. **Methodology research opt-in**: Optional checkbox — "Allow anonymized data to improve Lexio's teaching methodology"
3. **Settings page** (`/settings/data`):
   - Toggle: methodology research participation
   - Export all my data (JSON download)
   - Delete my account (cascades via Supabase RLS `on delete cascade`)

## Supabase Row Level Security (RLS)

All user-facing tables have RLS enabled. See `02-architecture/data-models.md` for full policy SQL.

Key principle: users can only read, write, and delete their own rows. `SUPABASE_SERVICE_ROLE_KEY` is used only server-side (API routes, Edge Functions) — never exposed to the client.

```typescript
// ✅ Server-side only (API route / Server Component)
import { createServiceClient } from '@/utils/supabase/service';
const supabase = createServiceClient(); // Uses SERVICE_ROLE_KEY

// ✅ Client-side (browser, Client Component)
import { createBrowserClient } from '@/utils/supabase/client';
const supabase = createBrowserClient(); // Uses ANON_KEY + RLS
```

## What Is Never Sent to NVIDIA NIM

| Data | Alternative |
|------|------------|
| User email | Not needed for lesson generation |
| User name | Not needed |
| Authentication tokens | Never included in prompt context |
| Raw feedback notes | Only structured tags sent as context |
| Precise location | Not sent at all |

What IS sent: anonymized user level, `pillar_today`, memory palace interest keywords (e.g., "coffee", "tech"), and RAG-retrieved methodology chunks. No PII.

## Data Flow Security

| Component | Measure |
|-----------|---------|
| Supabase | RLS enabled on all tables, service role key server-side only |
| NVIDIA API | Key in env vars, never client-side, usage monitored |
| Vercel | Env vars encrypted at rest, preview deployments isolated per branch |
| Cloudflare | HTTPS enforced, HSTS headers, DDoS protection |
| Client | CSP headers, no PII in URLs or query params, no PII in Vercel logs |
| Stripe | PCI-compliant, Lexio never stores card data |

## Incident Response Plan

| Step | Action | Timeline |
|------|--------|----------|
| Detection | Alert on unusual API usage or abnormal data access patterns | Immediate |
| Containment | Revoke compromised keys, pause affected endpoints | Within 1 hour |
| Assessment | Supabase audit trail review + Vercel function log analysis | Within 4 hours |
| User notification | Email affected users if PII was exposed | Within 72 hours (LGPD Art. 48) |
| Prevention | Rotate all keys, add validation rules, update this doc | Within 1 week |

## Security Checklist (Pre-Launch)

```bash
# Run before every production deploy
- [ ] SUPABASE_SERVICE_ROLE_KEY not in any client bundle (run: grep -r SERVICE_ROLE .next/)
- [ ] NVIDIA_API_KEY not in any client bundle
- [ ] All Supabase tables have RLS enabled (check: supabase inspect db rls)
- [ ] CSP headers set in next.config.ts
- [ ] HTTPS enforced on all routes (Cloudflare + Vercel)
- [ ] Stripe webhook signature verified in /api/webhooks/stripe
- [ ] No PII in console.log statements (grep -r 'console.log' src/ | grep -i 'email\|user\|id')
```

## Dependency Vulnerability Monitoring

- GitHub Dependabot: enabled for `npm` dependencies — auto-PRs for security patches
- Review cadence: monthly manual audit of high/critical CVEs
- Post-PMF: budget external pentest (~R$10–25K, focus: auth, data export, API endpoints)
