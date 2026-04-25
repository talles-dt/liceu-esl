# Lexio Underground — Local Development Setup

## Prerequisites

- Node.js 20+
- Git
- Docker (optional — for Supabase local)
- NVIDIA API key from [build.nvidia.com](https://build.nvidia.com)

## Quick Start (5 minutes)

```bash
# 1. Clone repo
git clone https://github.com/talles-dt/lexio-underground.git
cd lexio-underground

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.example .env.local
# Fill in values — see .env reference below

# 4. Start Supabase locally (optional)
npx supabase start
# Or connect directly to your cloud Supabase project

# 5. Run database migrations
npx supabase db push

# 6. Start dev server
npm run dev

# 7. Verify NVIDIA NIM integration
npm run test:nvidia
```

## `.env.local` Reference

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key   # server-side only — never expose client-side

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=lexio@oliceu.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NVIDIA NIM
NVIDIA_API_KEY=nvapi-...
NVIDIA_CREDIT_LIMIT=1000     # Monthly soft cap (free tier)

# Optional: Local AI fallback
OLLAMA_BASE_URL=http://localhost:11434
```

> Never commit `.env.local`. The `.env.example` file (safe to commit) should contain only key names with placeholder values.

## Next.js 15 — Dev Notes

```typescript
// Async params — required in Next.js 15
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}

// Async cookies
import { cookies } from "next/headers";
const cookieStore = await cookies();
```

## Common Workflows

### Add a new PT-BR interference rule to the RAG corpus

```bash
# 1. Add markdown chunk to lexio-corpus/pt-interference/
# 2. Run embedding + upsert script
npm run rag:ingest -- --category=pt_interference --file=new-rule.md
```

### Test memory palace output

```bash
npm run test:mnemonic -- --interests="coffee,travel,tech" --level=B1
# Verifies: CONCEPT→LOCATION→HOOK→PT ANCHOR structure
```

### Validate pillar enforcement on a generated lesson

```bash
npm run test:pillars -- --lesson-id=your-lesson-uuid
# Checks: all 4 JSON keys present + PT contrast in grammar field
```

### Simulate NVIDIA API credit exhaustion

```bash
# Set a 0-credit limit and test fallback ladder
NVIDIA_CREDIT_LIMIT=0 npm run dev
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| NVIDIA API 429 errors | Check credit usage at `/admin/usage`. Implement caching for repeated level+topic combos. |
| NVIDIA API 401 errors | Verify `NVIDIA_API_KEY` in `.env.local`. Confirm key is active at build.nvidia.com. |
| Supabase connection failed | Ensure `NEXT_PUBLIC_SUPABASE_URL` has no trailing slash. Check RLS policies if data is missing. |
| JSON schema validation fails | Ensure prompt includes `response_format: { type: "json_object" }` + valid schema. Check fallback trigger. |
| Memory palace hooks feel generic | Add more user interests at signup. Check that `interests[]` is populated in `user_profiles`. |
| Pillar rotation wrong day | Verify timezone — all crons run UTC. `0 0 * * *` UTC = 21:00 BRT. Adjust if needed. |
