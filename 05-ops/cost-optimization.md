# Cost Optimization Strategy (MVP)

## NVIDIA API Credit Budget

| Metric | Value | Notes |
|--------|-------|-------|
| Monthly hard cap | 1,000 credits | Free tier limit |
| Soft cap (alert trigger) | 800 credits (80%) | Email admin |
| Per-user beta allocation | ~20 credits/month | ~50 beta users max on free tier |
| Average credits per lesson | ~0.4 credits | Estimate — track actual in `nim_usage` |

Recalibrate per-user allocation after first 2 weeks of real usage data.

## Caching Strategy

Cache key: `hash(user_level + topic + pillar + language_pair)` — TTL 24h (lessons reset midnight BRT).

```typescript
// utils/lesson-cache.ts
import { createClient } from '@/utils/supabase/server';

const CACHE_TTL_SECONDS = 86400; // 24h

export async function getCachedLesson(
  userLevel: string,
  topic: string,
  pillar: string
): Promise<LessonOutput | null> {
  const cacheKey = `${userLevel}:${topic}:${pillar}:pt-BR->en`;

  // Use Supabase KV or a simple lessons_cache table
  const supabase = createClient();
  const { data } = await supabase
    .from('lessons_cache')
    .select('content, cached_at')
    .eq('cache_key', cacheKey)
    .gt('cached_at', new Date(Date.now() - CACHE_TTL_SECONDS * 1000).toISOString())
    .single();

  return data ? (data.content as LessonOutput) : null;
}

export async function setCachedLesson(
  userLevel: string,
  topic: string,
  pillar: string,
  content: LessonOutput
): Promise<void> {
  const cacheKey = `${userLevel}:${topic}:${pillar}:pt-BR->en`;
  const supabase = createClient();

  await supabase.from('lessons_cache').upsert({
    cache_key: cacheKey,
    content,
    cached_at: new Date().toISOString(),
  });
}
```

```sql
-- Cache table (simple — no pgvector needed)
create table lessons_cache (
  cache_key text primary key,
  content jsonb not null,
  cached_at timestamptz not null
);

-- Auto-clean expired entries (Supabase cron or pg_cron)
create or replace function clean_expired_cache()
returns void as $$
  delete from lessons_cache
  where cached_at < now() - interval '24 hours';
$$ language sql;
```

## Fallback Escalation Ladder

```
1. Primary:    NVIDIA NIM (Nemotron-3 Nano)       ~0.4 credits/call
2. Fallback 1: NVIDIA NIM (Gemma-7B)              ~0.2 credits/call — simpler prompt
3. Fallback 2: Cached lesson (level+topic, 24h)   $0 — serve pre-generated content
4. Fallback 3: Rule-based template engine (JS)    $0 — always available, minimal quality
5. Fallback 4: Static review mode                 $0 — user re-reads past lessons
```

Auto-escalate down the ladder on API error or credit exhaustion. Log each escalation as `nim.fallback_triggered` event with `fallback_level` payload.

## Cost per Engaged User

Track monthly:

```sql
-- Cost per engaged user = total credits / users with ≥18 lessons in 30 days
select
  sum(nu.estimated_credits) as total_credits,
  count(distinct u.id) filter (
    where (
      select count(*) from lessons l
      where l.user_id = u.id
        and l.status = 'completed'
        and l.date >= now() - interval '30 days'
    ) >= 18
  ) as engaged_users
from nim_usage nu
cross join user_profiles u
where nu.called_at >= now() - interval '30 days';
```

Target: < R$2.00 per engaged user per month at MVP scale.

## Cost Comparison by Option

| Option | Cost/Month (50 beta users) | Latency | Quality | Suitability |
|--------|--------------------------|---------|---------|-------------|
| NVIDIA NIM free tier | $0 | ~800ms | High | ✅ MVP primary |
| NVIDIA NIM paid | ~$30–70 | ~800ms | High | ✅ Post-PMF |
| Ollama local (cloud VM) | ~$40 | ~2000ms | Medium-High | ⚠️ Fallback only |
| Rule-based template | $0 | ~50ms | Low | ✅ Emergency fallback |

## Local Model Fallback (Post-MVP)

If NVIDIA costs become prohibitive at scale (>500 users):

```bash
# Ubuntu 24.04, 16GB RAM minimum, GPU preferred
curl -fsSL https://ollama.com/install.sh | sh
ollama pull nemotron-3-nano:30b-q4_k_m   # 4-bit quantized

# Same JSON prompt schema — change BASE_URL env var
OLLAMA_BASE_URL=http://localhost:11434
```

Same TypeScript wrapper applies — just swap `baseURL` from NIM to Ollama endpoint. No prompt changes needed.

## Pricing Strategy (TBD — Post-PMF)

Inputs to model after beta:
- Actual cost per engaged user
- Willingness-to-pay signal from beta (survey at Day 30)
- Competitor benchmark: Duolingo Plus R$34.90/mo, Babbel R$49.90/mo

Candidate model:
- **Free**: 5 lessons/week, Leo chat 2×/week
- **Paid (R$29.90/mo)**: Unlimited lessons, full Leo access
- **Tutor add-on**: Booking with Talles at R$99/session (same model as Liceu)
