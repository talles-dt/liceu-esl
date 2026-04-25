# Memory Palace Design Guidelines

## Core Rules (MVP — Non-Negotiable)

1. **One hook per lesson** — never more
2. **User-interest anchored** — pull from `user_profiles.interests[]`
3. **PT-BR cultural relevance** — Brazilian references over generic ones
4. **Reusable locations** — limit to 5–7 familiar spaces per user
5. **Progressive complexity** — start with concrete nouns, move to abstract grammar
6. **Four-part structure** — `CONCEPT→LOCATION→HOOK→PT ANCHOR`, always

## Template Enforcement

```typescript
function generateMnemonicTemplate(
  concept: string,
  interests: string[],
  ptAnchor: string
): string {
  const location = INTEREST_TO_LOCATION[interests[0]] ?? 'HOME';
  const emoji = EMOJI_LIBRARY[concept] ?? '🧠';

  return `${concept.toUpperCase()}→${location}→${emoji} [visual action here]→${ptAnchor}`;
}
```

The AI fills in the `[visual action here]` based on the concept. The structure before and after is templated and validated.

## Cognitive Load Guardrails

| Guardrail | Rule | Why |
|-----------|------|-----|
| Max 1 mnemonic/lesson | Hard limit — prompt instruction + post-generation validation | Prevents working memory overload |
| Reuse locations | Cycle through user's top 5, don't introduce new palace weekly | Builds familiarity and spatial memory |
| PT anchor mandatory | Validation: must contain a Portuguese word or phrase | Bridges existing mental structures to new ones |
| Curated emoji set | Max 1 emoji, from fixed library of 20 | Visual consistency prevents noise |
| Concrete before abstract | A2–B1 lessons anchor to objects; B2–C1 to processes/concepts | Matches cognitive readiness |

## Spaced Repetition Integration

After each lesson, the mnemonic is stored in the `mnemonics` table and scheduled for review:

| User Recall Rating | Next Review |
|-------------------|-------------|
| 4–5 (helpful) | 7 days |
| 3 (neutral) | 3 days |
| 1–2 (confusing or forgotten) | Simplify + retest in 2 days |

Customized mnemonics (`is_customized = true`) receive 2× priority weight in the review queue.

## Example Library

### Concrete Vocabulary: Phrasal Verbs
```
PHRASAL VERBS→KITCHEN→☕ steam arrows forming 'up/down/out' directions→'desligar' single verb vs 'turn off' verb+particle
```

### Abstract Grammar: Present Perfect
```
PRESENT PERFECT→BUS COMMUTE→🚇 ticket gate stamped with 'HAVE'→'fiz' (PT simple past) vs 'I have done' (EN marks relevance to now)
```

### Grammar: Subject Pronouns
```
SUBJECT PRONOUNS→OFFICE DESK→🗂️ labeled folders for I/you/he/she/it→'Estou cansado' (no pronoun) vs 'I am tired' (mandatory)
```

### Grammar: Age Expression
```
AGE EXPRESSION→BIRTHDAY CAKE SHELF→birthday candles spelling 'AM not HAVE'→'tenho 25 anos' vs 'I am 25 years old'
```

### Logic: Adjective Order
```
ADJECTIVE ORDER→KITCHEN→☕ shelves organized smallest to largest→'flexível' PT order vs English 'locked sequence'
```

## Testing Mnemonic Efficacy

Post-lesson survey: "Did the memory hook help?" (1–5)

Implicit signals tracked:
- Time-to-answer on related question in next lesson (did the mnemonic transfer?)
- Error recurrence on the same pattern after 7 days

A/B test (Phase 2): Fixed template structure vs. user-customizable template — measure recall accuracy at Day 7.

## Customization Flow (Phase 2)

MVP generates and fixes mnemonics. Phase 2 adds:

1. User sees generated mnemonic after lesson
2. "Customize this hook" button → inline edit of LOCATION and PT ANCHOR fields
3. Save to `mnemonics` with `is_customized = true`
4. User's version takes priority in all future review sessions
5. Tech: React inline editor + Supabase upsert
