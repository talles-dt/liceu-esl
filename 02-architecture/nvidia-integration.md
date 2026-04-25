# NVIDIA NIM Integration Guide

## Model Selection

> ⚠️ Verify model IDs at [build.nvidia.com](https://build.nvidia.com) before first API call. IDs may be updated.

| Model | Role | Why |
|-------|------|-----|
| `nvidia/nemotron-3-nano-30b-a3b` | Primary | Strong reasoning, JSON mode, free tier, efficient for pillar enforcement |
| `google/gemma-7b-it` | Fallback | Lightweight, good for simple lessons, same API wrapper |

## API Wrapper (`utils/nvidia-client.ts`)

NVIDIA NIM uses an OpenAI-compatible API. Use the `openai` npm package pointed at NIM's base URL.

```typescript
import OpenAI from "openai";

const PRIMARY_MODEL = "nvidia/nemotron-3-nano-30b-a3b";
const FALLBACK_MODEL = "google/gemma-7b-it";

const nimClient = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

export async function generateLesson(
  systemPrompt: string,
  context: Record<string, unknown>,
  schema: Record<string, unknown>
): Promise<LessonOutput> {
  const creditLimit = parseInt(process.env.NVIDIA_CREDIT_LIMIT ?? "1000");

  // Check credit usage (stored in Supabase nim_usage table)
  const creditsUsed = await getCurrentMonthCredits();
  if (creditsUsed >= creditLimit) {
    return serveCachedLesson(context);
  }

  try {
    const response = await nimClient.chat.completions.create({
      model: PRIMARY_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(context) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1024,
    });

    const output = JSON.parse(response.choices[0].message.content ?? "{}");
    await logNIMUsage(response.usage, PRIMARY_MODEL);
    return validateLessonOutput(output);
  } catch {
    return retryWithFallback(systemPrompt, context, schema);
  }
}

async function retryWithFallback(
  systemPrompt: string,
  context: Record<string, unknown>,
  schema: Record<string, unknown>
): Promise<LessonOutput> {
  try {
    const response = await nimClient.chat.completions.create({
      model: FALLBACK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(context) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 512,
    });
    const output = JSON.parse(response.choices[0].message.content ?? "{}");
    await logNIMUsage(response.usage, FALLBACK_MODEL);
    return validateLessonOutput(output);
  } catch {
    return serveStaticLesson(context); // Last resort
  }
}
```

## Prompt Injection Strategy

1. **System prompt**: Enforces 3 pillars + PT-BR context + Zennial tone + JSON schema
2. **Dynamic context**: User level, `pillar_today`, memory palace interests, PT interference rules
3. **Structured output**: JSON mode enforced — validate with Zod schema before returning to client

See `03-development/prompt-library.md` for full prompt templates.

## Cost Management

### Credit Tracking Schema
```sql
create table nim_usage (
  id uuid default gen_random_uuid() primary key,
  called_at timestamptz default now(),
  model text not null,
  prompt_tokens int,
  completion_tokens int,
  estimated_credits numeric(10,4),
  lesson_id uuid references lessons
);

-- Monthly credit sum (used in generateLesson check)
create function get_current_month_credits()
returns numeric as $$
  select coalesce(sum(estimated_credits), 0)
  from nim_usage
  where date_trunc('month', called_at) = date_trunc('month', now());
$$ language sql;
```

### Alert Thresholds
- **80%** (800 credits): Email admin
- **95%** (950 credits): Email + Slack alert
- **100%** (1,000 credits): Auto-pause generation, serve cached content

### Caching Strategy
```typescript
// Cache key: level + topic + pillar + language pair
// TTL: 24h (lessons reset at midnight BRT)
const cacheKey = `${userLevel}:${topic}:${pillar}:pt-BR->en`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

## Rate Limit Handling

- Free tier: ~40 RPM, 1,000 credits/month
- Implement exponential backoff on 429 responses
- Beta queue: FIFO, no priority tiers in MVP
- Surface-friendly error: "Leo is taking a short break. Your lesson is ready in [X]s."

## Fallback Escalation Ladder

```
1. Primary:    NVIDIA NIM (Nemotron-3 Nano)
2. Fallback 1: NVIDIA NIM (Gemma-7B)           — same wrapper
3. Fallback 2: Cached lesson (level+topic)      — 24h TTL
4. Fallback 3: Rule-based template engine       — zero AI, always available
5. Fallback 4: Static review mode              — user re-reads past lessons
```

## Local Fallback Option (Post-MVP)

If API costs become prohibitive at scale:

```bash
# Ollama + quantized model (requires 16GB RAM, GPU preferred)
ollama pull nemotron-3-nano:30b-q4_k_m

# Same JSON prompt schema applies
# Expect ~2000ms latency vs ~800ms NIM
```
