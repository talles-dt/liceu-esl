# Adaptive Engine Specification (MVP)

## Adaptation Triggers (Rule-Based)

| Signal | Threshold | Action |
|--------|-----------|--------|
| Accuracy score | ≥80% | Increase difficulty +0.5 (i+1) |
| Accuracy score | <50% | Simplify + add PT-BR contrast |
| Time per question | >2× average | Offer hint + lower affective filter |
| Self-rating (1–5) | ≤2 | Next lesson: review mode + encouragement tone |
| Skip rate | >30% | Reduce lesson length + increase whimsy |

## User Signals Collected

- Quiz accuracy per pillar
- Time spent per question and per lesson
- Self-reported confidence (post-lesson 1–5 scale)
- Skip / abandon rate
- Explicit feedback (thumbs + optional text)

## Personalization Schema (Supabase)

```sql
create table user_profiles (
  id uuid references auth.users primary key,
  pt_variant text default 'pt-BR' check (pt_variant in ('pt-BR')),
  target_language text default 'en' check (target_language in ('en')),
  current_level text check (current_level in ('A2','B1','B2','C1')),
  interests text[],                    -- ['tech','travel','business'] — memory palace anchors
  streak_count int default 0,
  last_active date,
  pillar_weights jsonb default '{"grammar":0.4,"logic":0.3,"communication":0.3}',
  ab_group text check (ab_group in ('A','B')),
  sapir_whorf_group text check (sapir_whorf_group in ('A','B')),
  avg_comprehension numeric(3,2),      -- rolling average of post-lesson self-ratings
  created_at timestamptz default now()
);
```

## Adaptation Pseudocode

```python
def calculate_next_lesson(user: UserProfile, last_lesson: Lesson) -> LessonConfig:
    # Base difficulty: i+1 progression
    if last_lesson.accuracy >= 0.8:
        difficulty = user.current_level + 0.5
    elif last_lesson.accuracy < 0.5:
        difficulty = max(user.current_level - 0.5, 'A2')
    else:
        difficulty = user.current_level

    # Pillar emphasis rotation
    pillar = get_pillar_for_day()

    # Affective filter adjustment
    if last_lesson.time_per_question > 2 * AVERAGE_TIME:
        add_hints = True
        tone = 'encouraging'
    else:
        add_hints = False
        tone = 'quirky'

    return LessonConfig(
        difficulty=difficulty,
        pillar_focus=pillar,
        add_pt_contrast=(last_lesson.accuracy < 0.5),
        mnemonic_interests=user.interests[:3],  # Top 3 for anchor generation
        tone=tone
    )
```

## Pillar Weighting by CEFR Level

```python
PILLAR_WEIGHTS_BY_LEVEL = {
    'A2': {'grammar': 0.6, 'logic': 0.2, 'communication': 0.2},
    'B1': {'grammar': 0.4, 'logic': 0.3, 'communication': 0.3},
    'B2': {'grammar': 0.3, 'logic': 0.3, 'communication': 0.4},
    'C1': {'grammar': 0.2, 'logic': 0.3, 'communication': 0.5}
}
```

Use weights to: adjust prompt emphasis, prioritize practice questions, customize Leo chat follow-ups.

## Phase 2: Embedding-Based Personalization

- Generate user embedding from: interests + error patterns + pillar performance
- Use for: content recommendation, anonymous peer matching
- Privacy-first: opt-in only, never used for identification
- Storage: separate `user_embeddings` table with explicit consent flag
