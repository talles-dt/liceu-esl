# Lexio API Reference (MVP)

## Base URL

- Production: `https://lexio.oliceu.com/api/v1`
- Staging: `https://staging.lexio.oliceu.com/api/v1`
- Local: `http://localhost:3000/api/v1`

## Authentication

- OAuth: Google/Apple via Supabase Auth
- Magic Link: email-based passwordless
- JWT sessions, 7-day refresh
- All endpoints require `Authorization: Bearer <supabase-jwt>` unless noted
- Rate limiting: 5 requests/minute for free users (middleware, not yet implemented in MVP)

---

## Endpoints

### `POST /api/v1/lesson/generate`

Generate a pillar-focused micro-lesson for the authenticated user.

**Request**
```json
{
  "pillar": "grammar | logic | communication",
  "topic": "optional — override auto-selected topic"
}
```

**Response (200)**
```json
{
  "lesson_id": "uuid",
  "content": {
    "grammar": "Explicit pattern + PT-BR interference warning",
    "logic": "Reasoning behind usage choice",
    "communication": "Real-world scenario + cultural note",
    "mnemonic": "CONCEPT→LOCATION→HOOK→PT ANCHOR"
  },
  "pillar": "grammar",
  "difficulty": "B1",
  "next_preview": "Tomorrow: Logic pillar — why English word order matters"
}
```

**Error responses**
- `400`: Missing required field or invalid pillar value
- `429`: Rate limit exceeded → returns cached lesson + `Retry-After` header
- `503`: All AI fallbacks exhausted → returns static review prompt

---

### `GET /api/v1/user/progress`

Fetch authenticated user's roadmap, streak, and pillar mastery.

**Response (200)**
```json
{
  "current_level": "B1",
  "streak_count": 7,
  "pillar_mastery": {
    "grammar": 0.6,
    "logic": 0.4,
    "communication": 0.5
  },
  "next_milestone": "B2 in 3 months with daily practice",
  "lessons_completed_30d": 18,
  "engagement_rate_30d": 0.60
}
```

---

### `POST /api/v1/feedback/submit`

Log post-lesson feedback and error patterns.

**Request**
```json
{
  "lesson_id": "uuid",
  "rating": 4,
  "notes": "Optional text, max 280 chars",
  "error_tags": ["pt_interference", "mnemonic_confusing"],
  "would_recommend": true
}
```

**Response (201)**
```json
{
  "feedback_id": "uuid",
  "auto_tags": ["pt_interference"]
}
```

---

### `POST /api/v1/leo/chat`

5-minute reinforcement chat with Leo, the AI tutor.

**Request**
```json
{
  "lesson_id": "optional — provides lesson context to Leo",
  "message": "Why do English speakers say 'I'm interested in' not 'I have interest'?"
}
```

**Response (200)**
```json
{
  "reply": "Leo's response structured across all four pillars",
  "follow_up_prompt": "Want to practice this pattern now?"
}
```

---

### `GET /api/v1/lesson/:lessonId`

Fetch a specific lesson's content (for review mode).

**Response (200)**: Same shape as `POST /lesson/generate` response.

---

### `GET /api/v1/health`

Public endpoint. Checks NVIDIA API + Supabase connectivity.

**Response (200)**
```json
{
  "status": "ok",
  "nvidia": "ok | degraded | down",
  "supabase": "ok | degraded | down",
  "fallback_active": false,
  "credits_remaining": 423
}
```

---

## Error Handling

| Code | Meaning | Lexio Behavior |
|------|---------|----------------|
| `400` | Bad request | Return validation errors, do not call NIM |
| `401` | Unauthorized | Redirect to login |
| `429` | Rate limit / credit exhausted | Serve cached lesson, set `Retry-After` |
| `503` | NIM API down + no cache | Serve static review mode |

Never surface raw NVIDIA error messages to users. Always map to friendly copy.

## Versioning

- All endpoints prefixed `/api/v1/`
- Breaking changes: increment to `/api/v2/`, maintain old version 30 days minimum
- Non-breaking additions (new response fields) are not versioned
