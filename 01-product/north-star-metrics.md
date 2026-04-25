# Lexio Success Metrics

## North Star Metric

**30-day engagement rate**: % of users who complete ≥18 days of practice in their first 30 days.

- **Target**: ≥60%
- **Why**: Validates habit formation + methodology retention. If users practice 18/30 days, the methodology is working structurally — not just novelty-driven.

## Supporting Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lesson completion rate | ≥85% | Track `lesson.started` → `lesson.completed` events |
| Error recurrence rate | ↓ 20% MoM | Log repeated mistakes per user per pattern |
| Self-reported confidence | ↑ 1.5 pts (1–5 scale) | Pre/post lesson micro-survey |
| Pillar mastery progression | 1 CEFR level/month | Internal scoring per pillar |
| Leo chat engagement | ≥40% of users | Chat initiation rate post-lesson |

## Methodology Efficacy Tracking

### A/B Test Framework
- **Group A**: Full Lexio methodology (3 pillars + memory palace + Sapir-Whorf framing)
- **Group B**: Generic prompt (no pillar enforcement, no structural contrast)
- **Primary metric**: Error recurrence on target patterns after 7 days
- **Secondary metric**: Self-reported confidence shift
- **Implementation**: Supabase feature flag on `user_profiles.ab_group`

### Assessment Cadence
- **Baseline**: Placement quiz (80 questions)
- **Weekly**: 5-question micro-assessment (1–2 per pillar, rotated)
- **Monthly**: Full pillar review — recalculate CEFR estimate

## Data Collection Principles

- Never store: raw chat logs, voice data, exact PII
- Always anonymize: user IDs for analytics exports
- Consent-first: explicit opt-in for methodology research participation
- Retention: engagement events 1 year, error logs 90 days, raw API responses never

## Reporting Cadence

| Report | Frequency | Owner | Tool |
|--------|-----------|-------|------|
| North star snapshot | Daily (automated) | Admin dashboard | Supabase query |
| Prompt quality review | Weekly | Product lead | `/admin/prompt-issues` |
| Methodology efficacy | Monthly | Pedagogy lead | Spreadsheet export |
| Cost per engaged user | Monthly | Product lead | `total_credits / active_users_30d` |
