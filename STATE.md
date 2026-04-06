# Lexio Underground — Project State

> Last updated: 2026-04-06
> Current phase: **Phase 1 Complete — Content Engine deployed**

---

## Status Overview

| Phase | Status | Start | End | Notes |
|-------|--------|-------|-----|-------|
| 0 — Foundation | ✅ Complete | 2026-04-06 | 2026-04-06 | Scaffold, schema, auth, Stripe webhook, design system, middleware all done |
| 1 — Content Engine | ✅ Complete | 2026-04-06 | 2026-04-06 | Claude generation pipeline, admin review queue, 5 exercise renderers, placement test, completion API with XP + streaks + badges, TTS integration |
| 2 — Gamification | ⏳ Not started | — | — | |
| 3 — AI Tutor + Teacher | ⏳ Not started | — | — | |
| 4 — Polish + Beta | ⏳ Not started | — | — | |
| 5 — Hardening + Launch | ⏳ Not started | — | — | |

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

| # | Question | Priority | Owner |
|---|----------|----------|-------|
| 1 | Pricing: exact monthly price in BRL? (Suggested: R$49–R$79/mo) | High | Timon |
| 2 | Brand assets ready? (Logo, colors, fonts for Lexio sub-brand) | High | Timon |
| 3 | Custom domain for Lexio? (e.g. lexiounderground.com.br) | Medium | Timon |
| 4 | Teacher account expansion in v1 or v2? (Currently: only Timon as teacher) | Medium | Timon |
| 5 | Beta cohort size? How many Liceu students to invite first? | Low | Timon |

---

## Environment Checklist

- [x] GitHub repo created (existing directory)
- [ ] Vercel project created (staging + production) — *run `vercel` to deploy*
- [ ] Supabase project created — *apply migration: `supabase/migrations/001_initial_schema.sql`*
- [ ] Stripe account / product configured — *set `STRIPE_PRICE_ID` in env*
- [ ] Anthropic API key provisioned — *set `ANTHROPIC_API_KEY` in env*
- [ ] OpenAI API key provisioned (TTS) — *set `OPENAI_API_KEY` in env*
- [ ] Resend domain verified — *set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in env*
- [ ] Custom domain registered — *see open question #3*

---

## Active Blockers

None. Spec approved. Ready for Phase 0.

---

## Notes / Scratch

- Exercise types in v1 cover all 4 CEFR skills except writing (no open-ended graded writing — by design)
- Mandarin v2 track will need HSK-level mapping (HSK 1–6 → approximate CEFR equivalents)
- Leaderboard scoped to paid subscribers only — prevents free ghost accounts gaming rankings
- Placement test also serves as primary free-tier lead magnet
- **Phase 0 deliverables:** Next.js 15 scaffold, full Supabase schema (13 tables + RLS + triggers + helper functions), auth pages (magic link + Google OAuth), Stripe webhook handler, Resend client, design system (dark mode, neon purple/cyan, Space Grotesk + Inter), middleware (session + route protection), all route shells created
- **`.env.local`** has placeholder values — replace with real credentials before deploying
- **Build passes** with zero errors
