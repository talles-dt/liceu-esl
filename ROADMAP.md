# Lexio Underground — Development Roadmap

> Target: Usable beta in 4–6 weeks.
> Stack: Next.js 15 + Supabase + Stripe + Claude API + OpenAI TTS + Resend + Vercel

---

## Phase 0 — Foundation
**Days 1–3 | Deliverable: Deployed skeleton with auth + DB schema**

### Tasks
- [ ] Next.js 15 App Router scaffold (copy Liceu LMS base — auth, Stripe, Resend already wired)
- [ ] Supabase project creation + full schema migration
  - Tables: `user_profiles`, `subscriptions`, `exercises`, `completions`, `xp_log`, `streaks`, `badges`, `user_badges`, `chat_sessions`, `chat_messages`, `leaderboard_snapshots`, `assignments`
  - RLS policies for all tables
- [ ] Supabase Auth: magic link + Google OAuth
- [ ] Role system: `student` | `teacher` | `admin` (via `user_profiles.role`)
- [ ] Stripe: create product + monthly price + webhook endpoint
- [ ] Resend: domain verification + email templates scaffold
- [ ] Vercel deployment (staging env)
- [ ] Design system: CSS variables, dark mode base, font selection, color palette
- [ ] Middleware: subscription gate (redirect free users), role-based route protection

### Acceptance Criteria
- User can sign up, log in, and land on a gated placeholder dashboard
- Stripe subscription activates, webhook updates Supabase
- Schema is final (no destructive migrations after this phase)

---

## Phase 1 — Content Engine
**Days 4–10 | Deliverable: Exercises render and AI generation pipeline works**

### Tasks
- [ ] Exercise data model finalized in DB
- [ ] Claude API exercise generation endpoint (`POST /api/admin/generate`)
  - Input: `{ topic, cefr_level, exercise_type, count }`
  - Output: array of exercise JSON objects → insert as `status = 'draft'`
- [ ] Admin review queue page (`/admin/review`)
  - List draft exercises, rendered preview, approve/reject/edit actions
- [ ] Exercise renderer components
  - `<MCQExercise />` — 4-option radio, submit, result reveal
  - `<FillBlankExercise />` — inline input(s), submit, result reveal
  - `<VocabFlashcard />` — term → definition match
  - `<VocabDrag />` — drag-and-drop word slots
  - `<ListeningMCQ />` — audio player + MCQ
- [ ] OpenAI TTS integration: auto-generate audio on exercise approval for `listening_mcq`
  - Audio stored in Supabase Storage, URL written to `exercises.audio_url`
- [ ] CEFR Placement Test
  - Claude generates 15-question adaptive bank on demand
  - Client-side adaptive logic (correct → harder, wrong → easier)
  - Result → writes `user_profiles.cefr_level`
- [ ] Exercise completion recording: `POST /api/exercises/[id]/complete`
  - Inserts into `completions`, triggers XP calculation, triggers streak update

### Acceptance Criteria
- Admin can generate 10 exercises in one flow and approve them
- Student can complete all 5 exercise types and see correct/incorrect feedback
- Placement test runs and assigns a CEFR level

---

## Phase 2 — Gamification Loop
**Days 11–17 | Deliverable: XP, streaks, leaderboard, and badges all functional**

### Tasks
- [ ] XP engine: server-side calculation on completion (base × multiplier), insert to `xp_log`
- [ ] XP aggregation view in Supabase (materialized or DB function)
- [ ] Level-up detection: check XP thresholds after each completion, fire event if crossed
- [ ] Streak system
  - Cron job (Vercel cron or Supabase pg_cron): check daily activity, reset missed streaks at 00:05 BRT
  - Freeze logic: `streaks.freeze_available` boolean, consumed on miss
  - Streak at-risk: Resend email trigger at 20:00 BRT
- [ ] Weekly leaderboard
  - Supabase Realtime subscription on `xp_log` filtered to current week
  - `/app/leaderboard` page — top 10 + own rank
- [ ] Badge trigger system
  - Event bus pattern: completion event → check all badge conditions → award if unearned
  - Badge conditions defined as pure functions (easy to extend)
  - Resend email on badge award
- [ ] Student dashboard (`/app/dashboard`)
  - Level badge + CEFR label
  - XP bar with threshold label
  - Streak counter + flame animation
  - Today's queue card
  - Leaderboard rank chip
  - Badge shelf (latest 3 earned)
  - Weekly XP sparkline

### Acceptance Criteria
- Student earns XP completing exercises and sees it update on dashboard
- Streak increments on daily activity, resets correctly on miss
- Leaderboard updates live
- At least 5 badges are awardable and appear correctly

---

## Phase 3 — AI Tutor + Teacher Dashboard
**Days 18–25 | Deliverable: Tutor chat works, teacher can assign and monitor**

### Tasks
- [ ] AI Tutor page (`/app/tutor`)
  - Chat UI (messages list + input)
  - Claude API call with dynamic system prompt (student level injected)
  - Message history persisted to `chat_sessions` + `chat_messages`
  - Context window management (summarize if > 80% of limit)
  - Free user gate: 3 messages → upgrade prompt
  - Rate limit: 20 messages/day (Redis or Supabase counter)
- [ ] Teacher dashboard (`/teacher`)
  - Student roster (name, level, XP, streak, last active, completion rate)
  - Individual student detail view
  - Assignment creation: select exercises/module → select students/cohort → publish
  - Assignment shows in student's daily queue
  - CSV export of student progress
  - Force placement reset control
- [ ] Transactional email completion (all remaining Resend templates)
  - Welcome, level-up, new assignment, badge earned

### Acceptance Criteria
- Tutor chat completes a full multi-turn conversation, history survives page refresh
- Teacher can create an assignment that appears in student's queue
- Teacher can see per-student progress

---

## Phase 4 — Polish + Beta Launch
**Days 26–35 | Deliverable: Beta-ready product in hands of first students**

### Tasks
- [ ] Mobile-first responsive pass (all pages tested on 390px viewport)
- [ ] Onboarding flow (`/onboarding`)
  - Step 1: Profile (name, professional context)
  - Step 2: Placement test
  - Step 3: Level reveal (animated, shareable OG card)
  - Step 4: Subscription gate
  - Step 5: Guided first queue (3 exercises with coach marks)
- [ ] Landing page (`/`)
  - Liceu brand voice
  - Feature highlights
  - Pricing section (free vs paid)
  - Testimonial placeholder (ready for beta feedback)
  - CTA → placement test (free) and subscription
- [ ] Error states and loading skeletons for all pages
- [ ] Sentry or Vercel error monitoring setup
- [ ] Beta cohort invite (current Liceu students)
- [ ] Feedback collection (Typebot form or simple Resend-based form)

### Acceptance Criteria
- Full new-user flow works end-to-end on mobile
- Landing page is live and conversion-ready
- At least 5 beta students have completed onboarding

---

## Phase 5 — Hardening + Public Launch
**Days 36–42 | Deliverable: Production-ready, public-facing**

### Tasks
- [ ] Stripe customer portal integration (self-service manage/cancel)
- [ ] Admin analytics page (`/admin/analytics`)
  - DAU/WAU/MAU
  - Exercise completion rate
  - Subscription conversion rate (placement test → paid)
  - Drop-off funnel (onboarding steps)
- [ ] Load testing (k6 or similar — target: 200 concurrent users)
- [ ] Security audit: RLS policy review, API rate limiting, input sanitization
- [ ] SEO: meta tags, OG images, sitemap
- [ ] Custom domain setup on Vercel
- [ ] Public launch

### Acceptance Criteria
- Platform handles 200 concurrent users without degradation
- All Stripe billing flows (subscribe, cancel, resubscribe) work correctly
- Zero critical security issues from audit

---

## V2 Backlog (Post-Launch, Unscheduled)

| Feature | Complexity | Notes |
|---------|------------|-------|
| Voice conversation | High | ElevenLabs + WebRTC + speech recognition |
| Pronunciation feedback | High | Phoneme-level scoring |
| Mandarin Chinese track | High | HSK-aligned, new exercise bank, new TTS voices |
| CEFR Certificates | Medium | PDF generation per level |
| B2B corporate licensing | Medium | Block seats, HR reporting |
| Mobile app | High | React Native |
| Full SM-2 spaced repetition | Medium | Replace simplified SRS in vocab exercises |
| Secondary teacher accounts | Low | Invite-only expansion |

---

## Risk Register

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Claude API latency on exercise generation | Medium | Generation is async (admin queue), not student-facing critical path |
| Supabase Realtime under load (leaderboard) | Low | Leaderboard is weekly-scoped, not high-frequency |
| Stripe webhook failures | Low | Idempotency keys + webhook retry + manual reconciliation script |
| OpenAI TTS audio quality | Low | Pre-generate and cache in Supabase Storage on approval |
| 4-6 week timeline slippage | Medium | Phase 4 is cuttable if needed — beta can ship without landing page |
