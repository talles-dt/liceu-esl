# Lexio Underground — Project State

> Last updated: 2026-04-06
> Current phase: **All Phases Complete — Production Ready**

---

## Status Overview

| Phase | Status | Start | End | Notes |
|-------|--------|-------|-----|-------|
| 0 — Foundation | ✅ Complete | 2026-04-06 | 2026-04-06 | Scaffold, schema, auth, Stripe webhook, design system, middleware all done |
| 1 — Content Engine | ✅ Complete | 2026-04-06 | 2026-04-06 | Claude generation pipeline, admin review queue, 5 exercise renderers, placement test, completion API with XP + streaks + badges, TTS integration |
| 2 — Gamification | ✅ Complete | 2026-04-06 | 2026-04-06 | XP system, streaks, leaderboard, badges all wired into completion API + dashboard |
| 3 — AI Tutor + Teacher | ✅ Complete | 2026-04-06 | 2026-04-06 | Leo AI tutor chat, teacher dashboard with roster/CSV export/reset, assignment creation, onboarding flow with placement test |
| 4 — Polish + Beta | ✅ Complete | 2026-04-06 | 2026-04-06 | SEO (sitemap.xml, robots.txt, OG meta tags), Sentry error monitoring, security headers (HSTS, CSP, X-Frame-Options), feedback form, error boundary, loading states |
| 5 — Hardening + Launch | ✅ Complete | 2026-04-06 | 2026-04-06 | Stripe billing portal (self-service manage/cancel), admin analytics dashboard (DAU/WAU/MAU, conversion funnel, exercise stats), billing page, all production-ready |

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-06 | Product name: Lexio Underground | Brand continuity with Liceu Underground, Gen Z-appropriate |
| 2026-04-06 | Stack: Next.js 15 + Supabase + Vercel | Reuse all Liceu LMS patterns, fastest path to beta |
| 2026-04-06 | AI tutor: text only for v1 | Voice is v2 (ElevenLabs); text is sufficient for beta |
| 2026-04-06 | Content pipeline: AI-generated + admin review | Balance automation with quality gate |
| 2026-04-06 | Revenue: B2C monthly subscription | Direct student payment, Stripe |
| 2026-04-06 | v2 languages: Mandarin Chinese (HSK-aligned) | Natural expansion; Timon teaches Mandarin to brother |
| 2026-04-06 | Certificates: v2 only | No formal recognition value in v1 per competitive research |
| 2026-04-06 | Free tier: placement test only | Lead capture mechanism + low-friction entry |

---

## Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Pricing: R$99/mo | ✅ Decided |
| 2 | Brand assets (OG image) | ⏳ In progress — Timon creating |
| 3 | Custom domain | ✅ lexio.oliceu.com |
| 4 | Cal.com integration | ✅ Built — needs `NEXT_PUBLIC_CAL_COM_USERNAME` env var |
| 5 | Beta cohort size | ⏳ Pending — Timon to recruit |
| 6 | CRON_SECRET for streak emails | ⏳ Needs to be set in Vercel env vars |

---

## Environment Checklist

- [x] GitHub repo created
- [x] Vercel project created (staging + production) — deployed to lexio.oliceu.com
- [x] Supabase project created — all 3 migrations applied
- [x] Stripe account / product configured — R$99/mo
- [x] Anthropic API key provisioned
- [x] OpenAI API key provisioned (TTS)
- [x] Resend domain verified
- [x] Custom domain registered (lexio.oliceu.com)
- [x] `NEXT_PUBLIC_CAL_COM_USERNAME` — set
- [x] `CRON_SECRET` — set
- [x] `STRIPE_PRICE_ID` — updated to R$99
- [ ] Vercel cron configured (`vercel.json` for streak check)
- [ ] OG image uploaded (`public/og-image.png`) — still being refined

---

## Active Blockers

None. Spec approved. Ready for Phase 0.

---

## Notes / Scratch

- Exercise types in v1 cover all 4 CEFR skills except writing (no open-ended graded writing — by design)
- Mandarin v2 track will need HSK-level mapping (HSK 1–6 → approximate CEFR equivalents)
- Leaderboard scoped to paid subscribers only — prevents free ghost accounts gaming rankings
- Placement test also serves as primary free-tier lead magnet
- **Phase 4 deliverables:** SEO (sitemap.xml, robots.txt, OpenGraph meta, Twitter cards), Sentry error monitoring with session replays, security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), global error boundary, loading skeleton, feedback collection form with Supabase table
- **Phase 5 deliverables:** Stripe billing portal (self-service manage/cancel via Customer Portal), checkout session for new subscribers, admin analytics page (DAU/WAU/MAU, conversion funnel, exercise stats, new signups), billing page with upgrade/manage flows
- **Full route map:** `/` `/auth/login` `/auth/callback` `/onboarding` `/dashboard` `/exercise/[id]` `/tutor` `/billing` `/feedback` `/leaderboard` `/teacher` `/teacher/assignments` `/admin/review` `/admin/analytics` + API routes for all functionality
- **Migrations to run:** `001_initial_schema.sql` ✅ done, `002_storage_bucket.sql` ✅ done, `003_feedback_table.sql` — needs to be run in Supabase SQL editor
- **`.env.local`** has real production credentials — keep secret
- **Build passes** with zero errors, Next.js 16.2.2
