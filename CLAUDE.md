# Lexio Underground — Claude Code Project Brief

> **For Hermes (Claude Code):** This file is your entry point. Read it fully before touching any file.

---

## What Is This

**Lexio Underground** is an adaptive, AI-powered ESL platform for Portuguese (Brazil) native speakers. Think Duolingo × Discord × Y2K aesthetic. Target audience: Brazilian Zennials (22–32), career-motivated, B1–B2 English level.

Core mechanic: daily 10-minute micro-lessons rotating across three pedagogical pillars (Grammar / Logic / Communication), reinforced by Leo — an AI tutor — and anchored via memory palace mnemonics.

**North Star Metric:** 30-day engagement rate ≥ 60%.

---

## Stack (Non-Negotiable)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) — keep async cookies/headers, App Router patterns |
| Backend | Next.js API Routes (+ Supabase Edge Functions when needed; none required for current MVP routes) |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth (OAuth: Google/Apple + Magic Link) |
| Hosting | Vercel (São Paulo region: `sao1`) |
| DNS/CDN | Cloudflare |
| Payments | Stripe |
| Email | Resend |
| AI | NVIDIA NIM API (primary) — see `02-architecture/nvidia-integration.md` |
| RAG | Supabase pgvector (BGE-m3 embeddings) |

> **Next.js specifics:** Use `async` page params where applicable, `use cache` when it fits, and the async `cookies()` / `headers()` APIs. Do NOT use Next.js 14 patterns (`getServerSideProps`, legacy dynamic route param access).

---

## Repository Structure

```
lexio-underground/
├── CLAUDE.md                    ← YOU ARE HERE
├── INDEX.md                     ← Full documentation map
├── 01-product/                  ← Vision, methodology, personas, journeys, metrics
├── 02-architecture/             ← System design, NVIDIA integration, data models
├── 03-development/              ← Setup, API reference, prompts, testing, deployment
├── 04-pedagogy/                 ← PT-BR challenges, pillar specs, Krashen/Sapir-Whorf
├── 05-ops/                      ← Monitoring, feedback loops, cost, security
└── src/                         ← Application code (Next.js App Router)
```

---

## Core Business Logic (Read Before Writing Any Code)

### The Three Pillars (Rotating Schedule)
- **Grammar** → Monday / Wednesday
- **Logic** → Thursday / Saturday  
- **Communication** → Tuesday / Friday / Sunday

Every lesson output MUST be a JSON object with exactly these four keys:
```json
{
  "grammar": "Explicit pattern + PT-BR interference warning",
  "logic": "Reasoning behind usage choice",
  "communication": "Real-world scenario + cultural note",
  "mnemonic": "CONCEPT→LOCATION→VISUAL HOOK→PT ANCHOR"
}
```
**If any key is missing or malformed, the lesson is invalid.** Fall back to cached content — never surface broken output to users.

### Adaptation Rules (i+1 Krashen)
- Accuracy ≥ 80% → difficulty +0.5
- Accuracy < 50% → simplify + add PT-BR contrast
- Time > 2× average → offer hint, lower affective filter
- Self-rating ≤ 2/5 → next lesson: review mode

> **Implementation status:** These rules are product law; a dedicated adaptive engine (see `02-architecture/adaptive-engine.md`) is **not** fully wired in app logic yet—lesson difficulty today follows **CEFR placement + MVP clamp** and tutor level only.

### CEFR Scope (MVP)
Only A2, B1, B2, C1. No beginner (below A2). PT-BR → English only.

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-side only, never client

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID=

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
NEXT_PUBLIC_APP_URL=

# NVIDIA NIM
NVIDIA_API_KEY=                      # From build.nvidia.com
NVIDIA_CREDIT_LIMIT=1000            # Monthly soft cap (free tier)

# Optional: Local fallback
OLLAMA_BASE_URL=http://localhost:11434
```

> Never expose `SUPABASE_SERVICE_ROLE_KEY` or `NVIDIA_API_KEY` client-side. These must only appear in server components, API routes, and Edge Functions.

---

## Deployment

- **Production:** `lexio.oliceu.com` (Vercel, `sao1` region)
- **Staging:** `staging.lexio.oliceu.com`
- **CI/CD:** GitHub Actions → Vercel (see `03-development/deployment.md`)
- **Cron (see `vercel.json` in repo):**  
  - `/api/cron/reset-daily-lessons` — **03:00 UTC** (`0 3 * * *`) = **00:00 BRT** (standard time, UTC−3).  
  - `/api/cron/streak-check` — **23:00 UTC** (`0 23 * * *`) = **20:00 BRT** streak-at-risk emails.

### Vercel Configuration
```json
{
  "regions": ["sao1"],
  "crons": [
    { "path": "/api/cron/streak-check", "schedule": "0 23 * * *" },
    { "path": "/api/cron/reset-daily-lessons", "schedule": "0 3 * * *" }
  ]
}
```

---

## What NOT to Do

- ❌ Do not ship tutor transcripts to third-party analytics or model vendors; **MVP** persists chat rows in Supabase only for session continuity (no email/name in NIM system prompts). Plan retention/redaction if policy tightens.
- ❌ Do not send user email/name to NVIDIA API
- ❌ Do not use Next.js 14 patterns (`getServerSideProps`, old `params` access)
- ❌ Do not skip pillar validation — if JSON schema fails, use fallback
- ❌ Do not surface NVIDIA API errors directly to users
- ❌ Do not exceed **`NVIDIA_CREDIT_LIMIT`** (default 1,000) NIM calls per UTC month without admin approval — enforced in API routes via `nim_usage` + `src/lib/nim-credits.ts`
- ❌ Do not add social features in MVP scope

---

## Key Documentation to Read Per Task

| Task | Read First |
|------|-----------|
| Building lesson generation | `04-pedagogy/pillar-implementation.md` + `03-development/prompt-library.md` |
| NVIDIA API integration | `02-architecture/nvidia-integration.md` |
| Database schema | `02-architecture/data-models.md` |
| Adaptive engine | `02-architecture/adaptive-engine.md` |
| Memory palace logic | `04-pedagogy/mnemonic-design-guidelines.md` + `03-development/memory-palace-templates.md` |
| PT-BR interference rules | `04-pedagogy/pt-native-challenges.md` |
| Auth + onboarding flow | `01-product/user-journeys.md` |
| Monitoring + alerting | `05-ops/monitoring.md` |
| Cost/fallback strategy | `05-ops/cost-optimization.md` |

---

## Current Status

**Phase:** MVP beta — core app in `src/` is implemented (auth, Stripe, exercises, tutor, lessons, gamification basics).

**Aligned with this file (check periodically):**
1. **Schema + RLS** — see `supabase/migrations/` (apply all migrations, including `lessons`, `nim_usage`, `vector` extension).
2. **Auth** — Magic link + **Google** + **Apple** (`signInWithOAuth`); Apple needs provider enabled in Supabase dashboard.
3. **NIM** — `src/lib/nvidia.ts` + routes; monthly cap via **`NVIDIA_CREDIT_LIMIT`** and **`nim_usage`**.
4. **Pillar lessons** — four JSON keys validated with **fallback**; **BRT pillar rotation** when `pillar` is omitted (`src/lib/pillar-schedule.ts`); **CEFR MVP clamp A2–C1** in prompts (`src/lib/cefr-mvp.ts`).
5. **Streaks / XP / leaderboard** — wired in completion API and pages; adaptive i+1 table above still **partially** reflected in prompts only.

**Still not fully covered by code vs this brief:** Supabase **RAG** (`methodology_chunks` / BGE-m3) and full **adaptive-engine** metrics—see `02-architecture/` docs when you implement them.

---

*Lexio Underground is a Liceu Underground product. Same operator: Talles Diniz Tonatto (talles-dt on GitHub). Same stack pattern as Liceu LMS — refer to that codebase for auth/Stripe/Resend patterns.*
