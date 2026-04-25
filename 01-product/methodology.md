# Lexio Methodology Reference

## Core Principles

1. **Daily exposition + practice**: Non-negotiable habit loop
2. **Three Pillars** (rotating schedule):
   - 🟦 Grammar: Mon/Wed — explicit pattern labeling + PT-BR contrast
   - 🟩 Logic: Thu/Sat — reasoning behind usage choices
   - 🟨 Communication: Tue/Fri/Sun — real-world application scenarios
3. **Adult learner structure**: Clear objectives, time estimates, progress visibility
4. **Memory Palace mnemonics**: Spatial/visual hooks anchored in user interests
5. **Theoretical foundations**: Krashen (i+1, affective filter), Sapir-Whorf (structural contrast)

## Pillar Enforcement Rules

Every lesson output MUST include all four keys. Missing keys = invalid lesson, trigger fallback.

```json
{
  "grammar": "Explicit pattern + PT-BR interference warning",
  "logic": "Why this structure makes sense cognitively",
  "communication": "Real-world scenario + cultural note",
  "mnemonic": "Memory palace hook using [CONCEPT]→[LOCATION]→[PT ANCHOR]"
}
```

## Daily Practice Enforcement

- Push notifications at user-preferred time (default: 8 AM BRT)
- Streak counter with "ominous reminders" for missed days
- Optional 5-min "Leo chat" for reinforcement (not mandatory for streak)

## Adult Learner Structure

- Placement quiz (80 questions, pillar-balanced) → personalized roadmap
- Time-to-fluency estimates: with/without tutor option displayed
- Career-relevant scenarios (meetings, emails, presentations)

## Adaptation Logic (MVP Rules Engine)

```python
# Pseudocode: Simple rule-based adaptation
if user.accuracy >= 0.8 and user.avg_time < threshold:
    next_lesson.difficulty += 0.5  # i+1 progression
elif user.accuracy < 0.5 or user.skip_rate > 0.3:
    next_lesson.add_pt_contrast = True  # Lower affective filter
    next_lesson.simplify = True
```

See `02-architecture/adaptive-engine.md` for full implementation.

## Placement Quiz Design

- 80 questions covering all 3 pillars
- Auto-calculated CEFR estimate (A2 → C1)
- Roadmap output: "Expected fluency in X months with daily practice"
- Optional tutor upsell path at the end

Question distribution:
- 27 Grammar questions (top 5 PT-BR interference patterns)
- 27 Logic questions (reasoning behind English structures)
- 26 Communication questions (real-world scenario application)

## Zennial Tone Guidelines

- Quirky but professional: "Let's crack this subjunctive code 🔓" not "Yasss queen! ✨"
- No emojis in UI, but Leo can use 1–2 max in chat for personality
- Micro-copy: short, witty, zero fluff
- Error messages: never blame the user, always reframe as discovery

## Tone Spectrum

| Mode | When | Example |
|------|------|---------|
| **Default (quirky)** | Normal lesson flow | "Let's crack this subjunctive code 🔓" |
| **Encouraging** | Self-rating ≤ 2/5 or time > 2× average | "This one's tricky. Even natives mix this up. You've got this." |
| **Ominous reminder** | Missed day 3 | "Your streak is fading... 🔮" |
| **Celebratory** | Day 7, Day 30 milestones | "You've mastered X patterns. Next week: Y" |
