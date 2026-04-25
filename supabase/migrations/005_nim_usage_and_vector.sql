-- pgvector (per CLAUDE.md stack); RAG tables can be added in a follow-up migration.
create extension if not exists vector;

-- Append-only log for NVIDIA NIM calls (monthly soft cap via CLAUDE.md / NVIDIA_CREDIT_LIMIT).
create table if not exists public.nim_usage (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,
  user_id uuid references public.user_profiles (id) on delete set null
);

create index if not exists idx_nim_usage_created_at on public.nim_usage (created_at desc);

comment on table public.nim_usage is 'NIM API invocations for monthly credit tracking (service role writes only)';

alter table public.nim_usage enable row level security;
