# Krashen Implementation: Comprehensible Input (i+1)

## Core Principle

Every lesson must be slightly above the user's current level — not too easy (no acquisition), not too hard (affective filter rises). The target is **i+1**: input at current level plus one increment.

In Lexio's CEFR model, one increment = 0.5 levels (e.g., B1 → B1.5).

## i+1 Calculation (MVP)

```typescript
interface AdaptationInput {
  currentLevel: string;          // 'A2' | 'B1' | 'B2' | 'C1'
  avgComprehension: number;      // 1-5, rolling average of post-lesson self-ratings
  lastAccuracy: number;          // 0-1, last lesson quiz accuracy
  lastTimePerQuestion: number;   // seconds
  avgTimePerQuestion: number;    // seconds, rolling average
}

function calculateInputLevel(input: AdaptationInput): string {
  let boost = 0;

  // Self-reported comprehension signal
  if (input.avgComprehension >= 4.0) boost += 0.5;
  else if (input.avgComprehension <= 2.0) boost -= 0.5;

  // Accuracy signal
  if (input.lastAccuracy >= 0.8) boost += 0.5;
  else if (input.lastAccuracy < 0.5) boost -= 0.5;

  // Time signal (too slow = struggling)
  if (input.lastTimePerQuestion > 2 * input.avgTimePerQuestion) boost -= 0.5;

  // Floor: never go below A2
  return adjustCEFRLevel(input.currentLevel, Math.max(boost, -0.5));
}
```

## Lowering the Affective Filter

Krashen's affective filter hypothesis: anxiety, low motivation, and low confidence block acquisition. Lexio lowers the filter through:

| Tactic | Implementation | Trigger Condition |
|--------|---------------|-------------------|
| Optional hints | "Tap for PT-BR contrast hint" | Time on question > 45 seconds |
| Tone shift | Prompt switches to 'encouraging' mode | Self-rating ≤ 2/5 |
| PT scaffolding | Allow PT-BR keywords in explanation | User level = A2, first 2 weeks |
| Zero-penalty retries | "Try again" with no streak impact | First incorrect attempt |
| Leo reassurance | "This is tricky — even native speakers slip here." | Error on high-frequency interference pattern |

### Tone Examples

```text
# Default (quirky, confident):
"Let's crack this subjunctive code 🔓"

# Affective filter lowered (encouraging):
"This one's challenging — take your time.
 Remember: Portuguese uses this structure more flexibly, so English 
 feels stricter. That's not a you problem, that's a language architecture problem."
```

## Vocabulary Scope per CEFR Level

Use these lists to calibrate lesson vocabulary in the prompt:

| Level | Vocab Size | Source |
|-------|-----------|--------|
| A2 | ~1,500 words | New General Service List (NGSL) — top 1,500 |
| B1 | ~3,000 words | NGSL top 3,000 |
| B2 | ~5,000 words | NGSL + Academic Word List (AWL) |
| C1 | ~8,000 words | NGSL + AWL + domain-specific |

The prompt instructs NIM to stay within the target level's vocabulary range for explanation text, while the **target pattern** itself may be one level above.

## Graded Corpus Strategy (Phase 2)

For MVP: AI-generated lessons only. Phase 2 adds a curated corpus:

1. Annotate public domain texts with CEFR levels (Project Gutenberg + frequency analysis)
2. Chunk into micro-lessons (100–200 words)
3. Tag with: pillar focus, PT interference points, mnemonic hooks
4. Store in Supabase `lessons_corpus` table

Target size: 50 lessons per CEFR level × 3 levels = 150 graded lessons as backup content.

## Comprehension Assessment

Post-lesson signals used to update `avg_comprehension`:

| Signal | Weight | How Collected |
|--------|--------|--------------|
| Self-rating (1–5) | 0.5 | Post-lesson micro-survey |
| Quiz accuracy | 0.3 | 3-question quiz (1 per pillar) |
| Re-read rate | 0.2 | Time spent on content vs average (implicit) |

Rolling average: last 7 lessons. Resets to neutral if user is inactive > 14 days.
