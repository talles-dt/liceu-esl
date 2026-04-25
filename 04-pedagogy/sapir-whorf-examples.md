# Sapir-Whorf Implementation: Structural Contrast Examples

## Introduction Strategy

Sapir-Whorf (linguistic relativity) in Lexio's context: make explicit how Portuguese and English structure reality differently, so the learner can deliberately shift mental frames — not just memorize rules.

- **Frequency**: 1 structural contrast per 2 lessons (not every lesson — avoid cognitive overload)
- **Framing**: "Notice how English structures [concept] differently than Portuguese — this changes how native speakers think about it"
- **Real-world anchor**: Always tie the contrast to a communication outcome

## Example Format Template

```text
PORTUGUESE MENTAL STRUCTURE: [PT pattern + example sentence]
ENGLISH STRUCTURAL REQUIREMENT: [EN pattern + example sentence]
COGNITIVE IMPACT: "This shapes how English speakers [reasoning/consequence]"
REAL-WORLD APPLICATION: "Use this when [scenario] to [outcome]"
MEMORY PALACE HOOK: "CONCEPT→LOCATION→HOOK→PT ANCHOR"
```

## MVP Contrast Library (PT-BR → English)

### 1. Subject Pronoun Necessity

```text
PT: "Estou cansado" — subject dropped, verb ending carries the information
EN: "I am tired" — subject pronoun mandatory in all clauses
COGNITIVE IMPACT: "English forces explicit agency in every statement, 
                   which shapes how responsibility and action are assigned."
APPLICATION: "In professional emails, always include 'I' to claim your action clearly: 
              'I reviewed the document' — not just 'Reviewed the document'."
MNEMONIC: "SUBJECTS→OFFICE DESK→🗂️ labeled folders for each person→'Eu' optional vs 'I' mandatory"
```

### 2. Temporal Conjugation Rigidity

```text
PT: "Ontem eu vou ao mercado" — present tense for recent past is acceptable
EN: "Yesterday I went to the market" — past time requires past tense, no exceptions
COGNITIVE IMPACT: "English locks events to explicit timelines, creating clearer mental chronology."
APPLICATION: "When telling stories or reporting what happened in meetings, 
              use past tense consistently to avoid confusion about timing."
MNEMONIC: "TIME→CLOCK TOWER→⏰ gears that lock into past position→'vou' flexible vs 'went' locked"
```

### 3. Adjective Order Fixity

```text
PT: "carro vermelho grande" — adjective order is flexible, guided by emphasis
EN: "big red car" — fixed order: opinion → size → age → shape → color → origin → material → purpose
COGNITIVE IMPACT: "Fixed order reduces cognitive load in fast speech — 
                   native speakers process descriptions with fewer mental resets."
APPLICATION: "When describing products, people, or ideas, follow English order to sound fluent: 
              'a beautiful old Italian leather jacket' — not 'an Italian old beautiful leather jacket'."
MNEMONIC: "ADJECTIVE ORDER→KITCHEN→☕ organized shelves, smallest to largest→'flexível' vs 'locked sequence'"
```

### 4. Question Word Inversion

```text
PT: "Você vai onde?" — question word at sentence end is natural and common
EN: "Where are you going?" — question word + subject-verb inversion required
COGNITIVE IMPACT: "Front-loading the question word signals 'I need information' immediately, 
                   reducing ambiguity in noisy or fast-paced environments."
APPLICATION: "Use inverted form in all formal and professional questions: 
              'When does the meeting start?' — not 'The meeting starts when?'"
MNEMONIC: "QUESTIONS→BUS STOP→🚌 inverted route signs→'onde?' at end vs 'Where?' at start"
```

## A/B Testing Framework

### Test: Does explicit Sapir-Whorf framing improve pattern retention?

- **Group A**: Lessons with full structural contrast explanation (cognitive impact + real-world anchor)
- **Group B**: Lessons with pattern + example only (no structural contrast framing)
- **Primary metric**: Error recurrence on target pattern after 7 days
- **Secondary metric**: Self-reported confidence shift (pre/post lesson delta)
- **Sample size**: 50 users per group (beta phase)
- **Assignment**: `user_profiles.sapir_whorf_group` ('A' | 'B')

### Implementation

```sql
-- Feature flag: controls whether Sapir-Whorf framing is injected into prompt
alter table user_profiles 
  add column sapir_whorf_group text check (sapir_whorf_group in ('A','B'));

-- In lesson generation API
-- Group A: inject full structural contrast template
-- Group B: pattern + example only (omit COGNITIVE IMPACT section)
```

```typescript
function buildPromptForUser(user: UserProfile, basePrompt: string): string {
  if (user.sapir_whorf_group === 'A') {
    return basePrompt + SAPIR_WHORF_CONTRAST_TEMPLATE;
  }
  return basePrompt + PATTERN_ONLY_TEMPLATE;
}
```

## Roll-out Plan

- MVP: All users get Group A (full Sapir-Whorf) — build baseline data
- Week 4 post-launch: Split A/B when N ≥ 100 users
- Decision at Day 30: Roll out winner, deprecate loser prompt variant
