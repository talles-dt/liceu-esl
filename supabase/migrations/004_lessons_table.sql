-- Daily pillar lessons (JSON: grammar, logic, communication, mnemonic)
create table if not exists public.lessons (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  pillar text not null,
  cefr_level cefr_level not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_lessons_user_created
  on public.lessons (user_id, created_at desc);

comment on table public.lessons is 'Generated pillar micro-lessons per user';

alter table public.lessons enable row level security;

create policy "Users can view own lessons"
  on public.lessons for select
  using (auth.uid() = user_id);

create policy "Users can insert own lessons"
  on public.lessons for insert
  with check (auth.uid() = user_id);

create policy "Teachers/admins can view all lessons"
  on public.lessons for select
  using (
    auth.uid() in (
      select id from public.user_profiles where role in ('teacher', 'admin')
    )
  );
