# Lexio Data Models (MVP)

## Core Supabase Schema

### `user_profiles` (extends `auth.users`)

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
  avg_comprehension numeric(3,2),      -- rolling average of 1-5 post-lesson ratings
  ab_group text check (ab_group in ('A','B')),
  sapir_whorf_group text check (sapir_whorf_group in ('A','B')),
  created_at timestamptz default now()
);
```

### `lessons`

```sql
create table lessons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references user_profiles on delete cascade,
  date date default current_date,
  pillar text check (pillar in ('grammar','logic','communication')),
  difficulty text check (difficulty in ('A2','A2.5','B1','B1.5','B2','B2.5','C1')),
  content jsonb not null,              -- {grammar, logic, communication, mnemonic}
  prompt_version text,                -- e.g. 'v1.0-mvp' — for rollback analysis
  status text check (status in ('assigned','completed','skipped')) default 'assigned',
  time_spent_seconds int,
  self_rating int check (self_rating between 1 and 5),
  created_at timestamptz default now()
);
```

### `feedback`

```sql
create table feedback (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references lessons on delete cascade,
  rating int check (rating between 1 and 5),
  notes text,                          -- max 280 chars, enforced in API layer
  error_tags text[],                   -- ['pt_interference','grammar_confusion','mnemonic_failed']
  would_recommend boolean,
  created_at timestamptz default now()
);
```

### `mnemonics`

```sql
create table mnemonics (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references lessons on delete cascade,
  hook_text text not null,             -- "CONCEPT→LOCATION→HOOK→PT ANCHOR"
  palace_location text,                -- 'kitchen' | 'commute' | 'office' | 'gym'
  user_anchor text,                    -- from interests: 'coffee' | 'football' | 'music'
  is_customized boolean default false,
  last_reviewed date,
  recall_rating int check (recall_rating between 1 and 5),
  created_at timestamptz default now()
);
```

### `nim_usage` (credit tracking)

```sql
create table nim_usage (
  id uuid default gen_random_uuid() primary key,
  called_at timestamptz default now(),
  model text not null,
  prompt_tokens int,
  completion_tokens int,
  estimated_credits numeric(10,4),
  lesson_id uuid references lessons
);
```

### `methodology_chunks` (RAG corpus)

See `02-architecture/rag-knowledge-base.md` for full schema.

## Row Level Security (RLS)

```sql
-- Enable RLS on all user-facing tables
alter table user_profiles enable row level security;
alter table lessons enable row level security;
alter table feedback enable row level security;
alter table mnemonics enable row level security;

-- User can only access their own data
create policy "own_profile" on user_profiles
  for all using (auth.uid() = id);

create policy "own_lessons" on lessons
  for all using (auth.uid() = user_id);

create policy "own_feedback" on feedback
  for all using (
    auth.uid() = (select user_id from lessons where id = lesson_id)
  );

create policy "own_mnemonics" on mnemonics
  for all using (
    auth.uid() = (select user_id from lessons where id = lesson_id)
  );

-- nim_usage: server-side only (service role), no user access
```

## Data Never Stored

| Data | Reason |
|------|--------|
| Raw Leo chat logs | Privacy — only structured lesson JSON stored |
| Voice / audio | MVP is text-only |
| User full name / phone / address | Data minimization (LGPD) |
| Full NVIDIA API responses | Only parsed `content` JSON stored |
| Precise location | Country-level only for analytics |
| Auth tokens | Never persisted outside Supabase session |

## Versioning Strategy

- Use `dummy_user` account for testing prompt/methodology changes
- `prompt_version` field on `lessons` table enables rollback analysis
- Tag methodology RAG chunks with `version` for A/B corpus testing
