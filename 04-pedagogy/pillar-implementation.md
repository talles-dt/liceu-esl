# Pillar Implementation Guide

## Lesson Output JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "grammar": {
      "type": "string",
      "description": "Explicit pattern + PT-BR interference warning",
      "minLength": 20
    },
    "logic": {
      "type": "string",
      "description": "Reasoning behind the usage choice",
      "minLength": 15
    },
    "communication": {
      "type": "string",
      "description": "Real-world scenario + cultural note",
      "minLength": 20
    },
    "mnemonic": {
      "type": "string",
      "description": "Memory palace hook: CONCEPT→LOCATION→HOOK→PT ANCHOR",
      "pattern": "^.+→.+→.+→.+$"
    }
  },
  "required": ["grammar", "logic", "communication", "mnemonic"],
  "additionalProperties": false
}
```

## Validation Layer (Zod — TypeScript)

```typescript
import { z } from "zod";

const LessonOutputSchema = z.object({
  grammar: z
    .string()
    .min(20)
    .refine(
      (v) => /pt-br|portuguese|brasile/i.test(v),
      { message: "Grammar must include PT-BR interference warning" }
    ),
  logic: z.string().min(15),
  communication: z.string().min(20),
  mnemonic: z
    .string()
    .refine(
      (v) => v.split("→").length === 4,
      { message: "Mnemonic must have 4 parts separated by →" }
    ),
});

export type LessonOutput = z.infer<typeof LessonOutputSchema>;

export function validateLessonOutput(raw: unknown): LessonOutput {
  const result = LessonOutputSchema.safeParse(raw);
  if (!result.success) {
    // Log validation failure → trigger fallback
    logValidationFailure(result.error, raw);
    throw new LessonValidationError(result.error.message);
  }
  return result.data;
}
```

## Post-Processing Rules

| Validation Failure | Auto-Fix | Log to |
|-------------------|----------|--------|
| `grammar` missing PT contrast | Append "[PT-BR note: direct translation from Portuguese often causes this error]" | `/admin/prompt-issues` |
| `mnemonic` wrong structure | Regenerate with stricter prompt (one retry only) | `/admin/prompt-issues` |
| Any key missing entirely | Fall back to cached lesson for this level+topic | `/admin/prompt-issues` |
| All keys malformed | Serve static review mode | `/admin/prompt-issues` + alert |

Never surface raw validation errors to users. Map to: "Leo is refining your lesson — just a moment."

## Pillar Rotation Schedule

```typescript
const PILLAR_SCHEDULE: Record<number, 'grammar' | 'logic' | 'communication'> = {
  1: 'grammar',       // Monday
  2: 'communication', // Tuesday
  3: 'grammar',       // Wednesday
  4: 'logic',         // Thursday
  5: 'communication', // Friday
  6: 'logic',         // Saturday
  0: 'communication', // Sunday
};

export function getPillarForToday(): string {
  const day = new Date().getDay(); // 0 = Sunday
  return PILLAR_SCHEDULE[day];
}
```

## Pillar Weighting by CEFR Level

Affects prompt emphasis, question distribution in micro-assessments, and Leo chat depth.

```typescript
const PILLAR_WEIGHTS = {
  A2: { grammar: 0.6, logic: 0.2, communication: 0.2 },
  B1: { grammar: 0.4, logic: 0.3, communication: 0.3 },
  B2: { grammar: 0.3, logic: 0.3, communication: 0.4 },
  C1: { grammar: 0.2, logic: 0.3, communication: 0.5 },
};
```

## Leo Chat Integration

When a user asks Leo a question mid-lesson or post-lesson:

1. Identify which pillar the question relates to (keyword classification)
2. Retrieve relevant methodology chunk from RAG (pgvector similarity search)
3. Generate response using same four-key schema, but conversational register
4. Offer optional follow-through: "Want to practice this pattern now?" → launch micro-exercise

Leo never responds outside the four-pillar structure, even in casual conversation.
