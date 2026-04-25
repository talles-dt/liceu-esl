# Lexio User Journeys (MVP)

## Day 1 Flow (5 steps max)

1. **Sign-up**: OAuth (Google/Apple) or Magic Link email
2. **Placement quiz**: 80 questions, pillar-balanced, ~15 min
3. **Roadmap reveal**: "You're B1. Fluency in 8 months with daily practice."
4. **First lesson**: Grammar-focused (Mon), 10 min, PT-BR → English contrast
5. **Next-day preview**: "Tomorrow: Logic pillar — why English word order matters"

> Note: On first login, ask for 3 interests (e.g., "coffee", "football", "tech") before the quiz. These seed the memory palace anchors.

## Successful Week 1 Definition

- ✅ 5+ days of practice logged
- ✅ Exposure to all 3 pillars (via rotation schedule)
- ✅ First memory palace hook created + saved
- ✅ Self-reported confidence increase (pre/post micro-survey)

## Drop-off Mitigation (MVP)

| Day | Trigger | Action |
|-----|---------|--------|
| Day 3 (no login) | Streak at risk | Push notification: "Your streak is fading... 🔮" |
| Day 7 (completed) | Milestone hit | Email recap: "You've mastered X patterns. Next week: Y" |
| Day 7 (dropped) | Re-engagement | Email: "Pedro, your roadmap is waiting" + show progress snapshot |
| Day 30 (completed) | North Star milestone | Celebration screen + optional tutor consultation offer |

## Leo Chat Flow (5-min reinforcement)

Leo's responses always follow the four-pillar structure, even in conversational mode:

```
User: "Why do English speakers say 'I'm interested in' not 'I have interest'?"

Leo:
[LOGIC] "English prefers adjective + preposition structures here. 
         'Interested' is an adjective, so it takes 'in' as its partner."

[GRAMMAR] "Pattern: be + interested + in + noun/gerund.
           PT-BR warning: Don't translate 'tenho interesse em' directly."

[COMMUNICATION] "Use this when discussing hobbies or work: 
                 'I'm interested in learning more about your startup.'
                 Avoid: 'I have interest in...' — sounds transactional in English."

[MNEMONIC] "INTEREST→COFFEE SHOP→Picture your curiosity as a coffee cup 
            catching 'in' phrases like steam rising ☕"
```

## Onboarding Edge Cases

| Scenario | Handling |
|----------|----------|
| User scores above C1 on placement quiz | Redirect: "Lexio is built for A2–C1. You're beyond MVP scope." + waitlist for advanced features |
| User scores below A2 | Redirect: "Start with our foundational track" (TBD — static content fallback for MVP) |
| User skips placement quiz | Assign B1 as default, allow manual override in settings |
| OAuth fails | Fall back to Magic Link; do not block onboarding |
