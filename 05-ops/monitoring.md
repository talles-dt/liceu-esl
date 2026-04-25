# Lexio Monitoring & Alerting (MVP)

## Critical Events to Log

| Event | Purpose | Retention |
|-------|---------|-----------|
| `lesson.started` | Engagement funnel top | 90 days |
| `lesson.completed` | North star metric input | 1 year |
| `lesson.skipped` | Drop-off signal | 90 days |
| `lesson.validation_failed` | Prompt quality signal | 30 days |
| `nim.api_call` | Credit usage + latency tracking | 7 days |
| `nim.fallback_triggered` | Fallback ladder monitoring | 30 days |
| `credit.threshold` | 80% / 95% / 100% alerts | 1 year |
| `user.feedback` | Methodology iteration signals | 1 year |
| `streak.broken` | Re-engagement flow trigger | 30 days |
| `streak.milestone` | Day 7 / Day 30 celebration trigger | 1 year |

## Event Schema (Supabase `app_events` table)

```sql
create table app_events (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,       -- e.g. 'lesson.completed'
  user_id uuid,                   -- nullable for anonymous events
  payload jsonb default '{}',     -- event-specific data
  created_at timestamptz default now()
);

-- Index for common queries
create index on app_events (event_type, created_at desc);
create index on app_events (user_id, created_at desc);
```

## Alerting Thresholds

```yaml
# config/alerts.yml

nvidia_api:
  downtime_minutes: 5         # Page on-call if NIM unreachable > 5 min
  latency_p95_ms: 3000        # Warning if p95 response > 3s

credits:
  threshold_80_pct:           # Email admin
    action: email
    recipient: talles@oliceu.com
  threshold_95_pct:           # Email + log escalation event
    action: email_and_log
  threshold_100_pct:          # Auto-pause generation, serve cached content
    action: pause_generation

errors:
  request_error_spike:
    threshold: ">5% of requests in any 5-minute window"
    action: warning_log
  pillar_validation_failures:
    threshold: ">10 in 1 hour"
    action: email_and_log      # Prompt may need revision

engagement:
  day3_streak_drop:
    threshold: ">20% of users miss Day 3"
    action: review_re_engagement_copy
```

## Admin Dashboard (Free Tier)

Routes under `/admin/` — protected by service role check, not user-facing.

| Route | Contents |
|-------|----------|
| `/admin/usage` | NVIDIA credits/day, model breakdown, fallback rate |
| `/admin/engagement` | 30-day retention, streak distribution, pillar completion rates |
| `/admin/prompt-issues` | Validation failures, auto-tag breakdown, manual review queue |
| `/admin/feedback` | Rating distribution, thumbs-down reasons, text feedback search |

### Implementation (Lightweight — Recharts + Supabase queries)

```typescript
// app/admin/usage/page.tsx
export default async function UsageDashboard() {
  const supabase = createServerClient();
  const { data: usage } = await supabase
    .from('nim_usage')
    .select('called_at, model, estimated_credits')
    .gte('called_at', thirtyDaysAgo())
    .order('called_at', { ascending: false });

  const { data: monthTotal } = await supabase
    .rpc('get_current_month_credits');

  return <UsageChart data={usage} monthTotal={monthTotal} />;
}
```

## Log Aggregation (MVP — No External Tools)

| Source | Tool | Volume estimate |
|--------|------|----------------|
| Next.js function logs | Vercel built-in (free: 100GB/month) | Low |
| Supabase query logs | Supabase dashboard | Low |
| App events | `app_events` table (Supabase) | Medium |
| NVIDIA API calls | `nim_usage` table (Supabase) | Low |

No Datadog, Sentry, or external logging tools in MVP. Add Sentry post-PMF if error volume warrants it.

## Health Check Endpoint

`GET /api/v1/health` — public, used by Vercel uptime monitoring and post-deploy smoke tests.

```typescript
// app/api/v1/health/route.ts
export async function GET() {
  const [nimOk, supabaseOk, creditsRemaining] = await Promise.all([
    checkNIMConnectivity(),
    checkSupabaseConnectivity(),
    getCurrentMonthCreditsRemaining(),
  ]);

  return Response.json({
    status: nimOk && supabaseOk ? 'ok' : 'degraded',
    nvidia: nimOk ? 'ok' : 'down',
    supabase: supabaseOk ? 'ok' : 'down',
    fallback_active: !nimOk,
    credits_remaining: creditsRemaining,
  });
}
```
