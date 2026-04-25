# Research: Tech Stack Decisions

> Generated: 2026-04-06

---

## Stack Selection Rationale

### Why Next.js 15 (App Router)
- Already in production on Liceu LMS — zero learning curve
- App Router enables Server Components (fast initial load on exercise pages)
- Middleware support for subscription gating (clean, centralized)
- Vercel deployment is zero-config
- Strong ecosystem: shadcn/ui, Tailwind, Framer Motion for Gen Z animations

### Why Supabase
- Already in production on Liceu LMS
- Auth (magic link + Google OAuth) out of the box
- Realtime subscriptions → leaderboard without a separate WebSocket server
- RLS (Row Level Security) → multi-role data access without custom auth middleware
- pg_cron extension → streak reset cron jobs inside the DB
- Storage → exercise audio files (listening_mcq)
- Free tier generous enough for beta

### Why Stripe
- Already integrated in Liceu LMS — webhooks, customer portal, all wired
- Best-in-class subscription management
- Customer portal = zero custom billing UI needed

### Why Claude API (Anthropic) for Content Generation
- Best instruction-following for structured JSON output
- Can generate diverse, CEFR-calibrated exercises reliably with good prompting
- Same API key as other projects (cost consolidation)
- claude-sonnet-4-20250514 for generation (quality), claude-haiku for tutor chat (speed + cost)

### Why OpenAI TTS for Listening Exercises
- Best natural-sounding TTS currently available
- Multiple voice options (American, British accents)
- Simple API, async generation on exercise approval
- Audio cached in Supabase Storage (no re-generation on each play)

### Why Resend
- Already in use across Liceu stack
- Best deliverability for Brazilian domain emails
- React Email templates = typed, previewable

---

## Database Schema Overview

```sql
-- Core user data
user_profiles (id, email, name, role, cefr_level, onboarding_complete, created_at)
subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end)

-- Content
exercises (id, language, cefr_level, skill, type, content jsonb, audio_url, status, ai_generated, created_at, reviewed_at, reviewed_by)

-- Learning activity
completions (id, user_id, exercise_id, correct, time_taken_ms, attempt_number, created_at)
xp_log (id, user_id, amount, source, exercise_id, created_at)

-- Gamification
streaks (user_id, current_streak, longest_streak, last_activity_date, freeze_available)
badges (id, slug, name, description, icon)
user_badges (id, user_id, badge_id, earned_at)
leaderboard_snapshots (id, user_id, week_start, xp_earned)

-- AI Tutor
chat_sessions (id, user_id, created_at, last_message_at, message_count)
chat_messages (id, session_id, role, content, created_at)

-- Teacher system
assignments (id, teacher_id, title, exercise_ids uuid[], student_ids uuid[], due_date, created_at)
```

---

## V2 Tech Additions (Mandarin + Voice)

| Addition | Technology |
|----------|------------|
| Mandarin TTS | Azure Cognitive Services TTS (best Mandarin neural voices) |
| Voice conversation | ElevenLabs Conversational AI + WebRTC |
| Pronunciation scoring | ElevenLabs or Azure Speech SDK |
| HSK level mapping | Custom mapping table: HSK1=A1/A2, HSK2=A2/B1, HSK3=B1, HSK4=B2, HSK5=C1, HSK6=C2 |

---

## Key API Prompts (Draft)

### Exercise Generation System Prompt
```
You are an expert ESL content designer. Generate {count} {exercise_type} exercises for CEFR level {level}, 
skill: {skill}, topic: {topic}.

Return ONLY a JSON array with no preamble. Each object must match this schema:
{
  "type": "{exercise_type}",
  "cefr_level": "{level}",
  "skill": "{skill}",
  "content": { /* type-specific — see schema below */ }
}

[Type-specific content schemas follow in the actual implementation prompt]
```

### AI Tutor System Prompt
```
You are Leo, an expert English language tutor from Lexio Underground. 
You are speaking with a {cefr_level} level English learner.

Your role:
- Help the student practice English naturally through conversation
- Gently correct significant grammar/vocabulary errors (don't interrupt flow for minor ones)
- Adjust your vocabulary and sentence complexity to {cefr_level} level
- Be encouraging, direct, and never condescending
- Keep responses concise (2-4 sentences max unless explaining a concept)
- Never break character or discuss topics unrelated to language learning

Current student level: {cefr_level}
```
