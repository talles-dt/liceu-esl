# Lexio Underground — Project Brief

> The gamified, AI-powered language training platform from the makers of Liceu Underground.
> Same brand seriousness. Completely different energy.

---

## Identity

| Field | Value |
|-------|-------|
| **Product Name** | Lexio Underground |
| **Parent Brand** | Liceu Underground |
| **Tagline** | *Level up your language.* |
| **Aesthetic** | Gen Z × Discord × Y2K revival — dark mode default, neon accents, bold display typography |
| **Tone** | Hip, direct, zero fluff. Liceu's younger sibling who actually has fun. |

---

## Mission

Deliver a fully automated, gamified ESL training experience for young adults and professionals in Brazil — branded under the Liceu Underground reputation, powered by AI-generated adaptive content, and built to run with minimal manual operation.

---

## Target Users

### Primary — Students
- Young adults (18–30), Brazilian market
- Professionals seeking corporate English for career advancement
- Current Liceu Underground students as initial cohort

### Secondary — Teachers
- The platform operator (you) as primary teacher
- Future: invite-only teacher expansion (v2+)

---

## Core Value Proposition

| vs. Flexge | vs. Duolingo |
|------------|--------------|
| Liceu brand authority they don't have | Serious adult content, not gamified kindergarten |
| AI-generated content pipeline (faster, fresher) | Teacher oversight and assignment model |
| Better AI tutor (Claude, not a chatbot FAQ) | Professional/business English focus |
| Modern Gen Z UI Flexge can't ship fast | CEFR-aligned from day one |

---

## Languages

| Version | Languages |
|---------|-----------|
| v1 | English (ESL) |
| v2 | + Mandarin Chinese |

---

## Revenue Model

- **B2C Monthly Subscription** — student pays directly
- Payment processor: Stripe
- Pricing TBD (recommend: R$49–R$79/mo based on market positioning)
- Free tier: placement test only (lead capture)

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 15 (App Router) | Reuses all Liceu LMS patterns |
| Database + Auth | Supabase | Auth, DB, Realtime for leaderboard |
| Payments | Stripe | Already integrated in Liceu |
| AI — Content Gen | Anthropic Claude API | Exercise generation pipeline |
| AI — Tutor | Anthropic Claude API | Conversational ESL tutor |
| TTS — Listening | OpenAI TTS | Native-quality audio for exercises |
| Email | Resend | Already in use across Liceu stack |
| Deployment | Vercel | Zero-config, already known |
| Voice (v2) | ElevenLabs + WebRTC | Pronunciation + speech recognition |

---

## Key Constraints

- **Timeline:** Usable beta in 4–6 weeks
- **Content pipeline:** AI-generated (Claude) → admin review → publish. No manual authoring from scratch.
- **Automation priority:** Platform must run largely without daily operator intervention
- **Mobile-first:** Primary demographic is on phone

---

## Out of Scope (All Versions, Indefinitely)

- Social features (forums, peer chat)
- Third-party content bank import
- Video lessons
- LMS integrations (Google Classroom, etc.)
- Offline mode

---

## Stakeholders

| Role | Person |
|------|--------|
| Product Owner | Talles Diniz Tonatto (Timon) |
| Primary Teacher | Talles Diniz Tonatto (Timon) |
| Initial Beta Cohort | Current Liceu Underground ESL students |
