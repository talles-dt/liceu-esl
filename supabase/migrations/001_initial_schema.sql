-- ============================================================
-- Lexio Underground — Full Schema Migration (Phase 0)
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_cron;

-- ============================================================
-- 1. ENUMS
-- ============================================================

create type app_role as enum ('student', 'teacher', 'admin');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
create type exercise_status as enum ('draft', 'approved', 'archived');
create type exercise_type as enum ('mcq', 'fill_blank', 'vocab_flashcard', 'vocab_drag', 'listening_mcq');
create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
create type exercise_skill as enum ('grammar', 'vocabulary', 'listening', 'reading');
create type chat_role_type as enum ('user', 'assistant', 'system');

-- ============================================================
-- 2. USER PROFILES
-- ============================================================

create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role app_role not null default 'student',
  cefr_level cefr_level,
  professional_context text, -- e.g. 'IT', 'Finance', 'Healthcare'
  onboarding_complete boolean not null default false,
  placement_test_taken_at timestamptz,
  placement_test_eligible_at timestamptz, -- can retake after 30 days
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table user_profiles is 'Extended profile data for authenticated users';

-- ============================================================
-- 3. SUBSCRIPTIONS
-- ============================================================

create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  status subscription_status not null default 'trialing',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_subscriptions_user_id on subscriptions(user_id);

comment on table subscriptions is 'Stripe subscription sync table';

-- ============================================================
-- 4. EXERCISES
-- ============================================================

create table exercises (
  id uuid primary key default uuid_generate_v4(),
  language text not null default 'en', -- 'en' | 'zh' (v2)
  cefr_level cefr_level not null,
  skill exercise_skill not null,
  type exercise_type not null,
  content jsonb not null,
  audio_url text, -- for listening_mcq
  status exercise_status not null default 'draft',
  ai_generated boolean not null default true,
  generated_by text, -- model version
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references user_profiles(id)
);

create index idx_exercises_cefr on exercises(cefr_level);
create index idx_exercises_status on exercises(status);
create index idx_exercises_skill on exercises(skill);
create index idx_exercises_type on exercises(type);
create index idx_exercises_language on exercises(language);

comment on table exercises is 'Exercise bank (AI-generated + manual)';

-- ============================================================
-- 5. COMPLETIONS
-- ============================================================

create table completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  correct boolean not null,
  time_taken_ms integer,
  attempt_number integer not null default 1,
  created_at timestamptz not null default now()
);

create index idx_completions_user_id on completions(user_id);
create index idx_completions_exercise_id on completions(exercise_id);
create index idx_completions_user_created on completions(user_id, created_at);

comment on table completions is 'Exercise completion records';

-- ============================================================
-- 6. XP LOG (append-only)
-- ============================================================

create table xp_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  amount integer not null,
  source text not null, -- 'exercise', 'level_up', 'badge', 'streak'
  exercise_id uuid references exercises(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_xp_log_user_id on xp_log(user_id);
create index idx_xp_log_user_created on xp_log(user_id, created_at);

comment on table xp_log is 'Append-only XP transaction log. Never mutate rows.';

-- ============================================================
-- 7. STREAKS
-- ============================================================

create table streaks (
  user_id uuid primary key references user_profiles(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  freeze_available boolean not null default true,
  last_freeze_used date,
  updated_at timestamptz not null default now()
);

comment on table streaks is 'Daily streak tracking per user';

-- ============================================================
-- 8. BADGES
-- ============================================================

create table badges (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon text not null, -- emoji or icon identifier
  created_at timestamptz not null default now()
);

comment on table badges is 'Badge definitions (static seed data)';

-- ============================================================
-- 9. USER BADGES
-- ============================================================

create table user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_id)
);

create index idx_user_badges_user_id on user_badges(user_id);

comment on table user_badges is 'Badges earned by users';

-- ============================================================
-- 10. CHAT SESSIONS (AI Tutor)
-- ============================================================

create table chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  message_count integer not null default 0
);

create index idx_chat_sessions_user_id on chat_sessions(user_id);
create index idx_chat_sessions_last_message on chat_sessions(user_id, last_message_at desc);

comment on table chat_sessions is 'AI Tutor conversation sessions';

-- ============================================================
-- 11. CHAT MESSAGES
-- ============================================================

create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role chat_role_type not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_chat_messages_session_id on chat_messages(session_id);

comment on table chat_messages is 'Individual messages within chat sessions';

-- ============================================================
-- 12. LEADERBOARD SNAPSHOTS
-- ============================================================

create table leaderboard_snapshots (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  week_start date not null,
  xp_earned integer not null default 0,
  unique(user_id, week_start)
);

create index idx_leaderboard_week on leaderboard_snapshots(week_start, xp_earned desc);

comment on table leaderboard_snapshots is 'Weekly XP leaderboard snapshots';

-- ============================================================
-- 13. ASSIGNMENTS
-- ============================================================

create table assignments (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references user_profiles(id) on delete cascade,
  title text not null,
  exercise_ids uuid[] not null default '{}',
  student_ids uuid[] not null default '{}',
  due_date timestamptz,
  created_at timestamptz not null default now()
);

create index idx_assignments_teacher on assignments(teacher_id);
create index idx_assignments_created on assignments(created_at desc);

comment on table assignments is 'Teacher-pushed exercise assignments to students';

-- ============================================================
-- 14. GENERATION LOGS (audit trail for AI content)
-- ============================================================

create table generation_logs (
  id uuid primary key default uuid_generate_v4(),
  generated_by uuid references user_profiles(id),
  topic text not null,
  cefr_level cefr_level not null,
  skill exercise_skill not null,
  exercise_type exercise_type not null,
  count integer not null,
  model_used text,
  prompt text,
  response text,
  exercises_created uuid[],
  created_at timestamptz not null default now()
);

create index idx_generation_logs_created on generation_logs(created_at desc);

comment on table generation_logs is 'Audit log for AI exercise generation';

-- ============================================================
-- 15. HELPER FUNCTIONS
-- ============================================================

-- Calculate total XP for a user
create or replace function get_user_total_xp(p_user_id uuid)
returns integer as $$
  select coalesce(sum(amount), 0) from xp_log where user_id = p_user_id;
$$ language sql stable;

-- Calculate XP earned by a user in a given week
create or replace function get_user_weekly_xp(p_user_id uuid, p_week_start date)
returns integer as $$
  select coalesce(sum(amount), 0)
  from xp_log
  where user_id = p_user_id
    and created_at >= p_week_start
    and created_at < p_week_start + interval '7 days';
$$ language sql stable;

-- Get leaderboard for a given week (top 10)
create or replace function get_weekly_leaderboard(p_week_start date)
returns table (
  user_id uuid,
  name text,
  xp_earned integer,
  rank bigint
) as $$
  select
    xp.user_id,
    up.name,
    xp.xp_earned,
    rank() over (order by xp.xp_earned desc) as rank
  from (
    select user_id, sum(amount) as xp_earned
    from xp_log
    where created_at >= p_week_start
      and created_at < p_week_start + interval '7 days'
    group by user_id
    order by xp_earned desc
    limit 10
  ) xp
  join user_profiles up on up.id = xp.user_id;
$$ language sql stable;

-- Get user's rank in weekly leaderboard (even if outside top 10)
create or replace function get_user_weekly_rank(p_user_id uuid, p_week_start date)
returns table (
  rank bigint,
  xp_earned integer
) as $$
  select
    rank() over (order by total_xp desc) as rank,
    total_xp as xp_earned
  from (
    select user_id, sum(amount) as total_xp
    from xp_log
    where created_at >= p_week_start
      and created_at < p_week_start + interval '7 days'
    group by user_id
  ) ranked
  where user_id = p_user_id;
$$ language sql stable;

-- ============================================================
-- 16. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table user_profiles enable row level security;
alter table subscriptions enable row level security;
alter table exercises enable row level security;
alter table completions enable row level security;
alter table xp_log enable row level security;
alter table streaks enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table leaderboard_snapshots enable row level security;
alter table assignments enable row level security;
alter table generation_logs enable row level security;

-- ---------- user_profiles ----------
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id);

create policy "Teachers/admins can view all profiles"
  on user_profiles for select
  using (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );

-- ---------- subscriptions ----------
create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- ---------- exercises ----------
create policy "Anyone can view approved exercises"
  on exercises for select
  using (status = 'approved');

create policy "Teachers/admins can view all exercises"
  on exercises for select
  using (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );

create policy "Teachers/admins can update exercises"
  on exercises for update
  using (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );

create policy "Teachers/admins can insert exercises"
  on exercises for insert
  with check (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );

-- ---------- completions ----------
create policy "Users can view own completions"
  on completions for select
  using (auth.uid() = user_id);

create policy "Users can insert own completions"
  on completions for insert
  with check (auth.uid() = user_id);

create policy "Teachers/admins can view all completions"
  on completions for select
  using (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );

-- ---------- xp_log ----------
create policy "Users can view own xp log"
  on xp_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own xp log"
  on xp_log for insert
  with check (auth.uid() = user_id);

create policy "Teachers/admins can view all xp log"
  on xp_log for select
  using (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );

-- ---------- streaks ----------
create policy "Users can view own streaks"
  on streaks for select
  using (auth.uid() = user_id);

create policy "Users can update own streaks"
  on streaks for update
  using (auth.uid() = user_id);

create policy "Users can insert own streaks"
  on streaks for insert
  with check (auth.uid() = user_id);

create policy "Teachers/admins can view all streaks"
  on streaks for select
  using (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );

-- ---------- badges ----------
create policy "Anyone can view badges"
  on badges for select
  using (true);

create policy "Only admins can manage badges"
  on badges for all
  using (
    auth.uid() in (
      select id from user_profiles where role = 'admin'
    )
  );

-- ---------- user_badges ----------
create policy "Users can view own badges"
  on user_badges for select
  using (auth.uid() = user_id);

create policy "System can insert user badges"
  on user_badges for insert
  with check (auth.uid() = user_id);

create policy "Teachers/admins can view all user badges"
  on user_badges for select
  using (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );

-- ---------- chat_sessions ----------
create policy "Users can view own chat sessions"
  on chat_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat sessions"
  on chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chat sessions"
  on chat_sessions for update
  using (auth.uid() = user_id);

-- ---------- chat_messages ----------
create policy "Users can view messages of own sessions"
  on chat_messages for select
  using (
    session_id in (
      select id from chat_sessions where user_id = auth.uid()
    )
  );

create policy "Users can insert messages to own sessions"
  on chat_messages for insert
  with check (
    session_id in (
      select id from chat_sessions where user_id = auth.uid()
    )
  );

-- ---------- leaderboard_snapshots ----------
create policy "Users can view own snapshots"
  on leaderboard_snapshots for select
  using (auth.uid() = user_id);

create policy "System can manage snapshots"
  on leaderboard_snapshots for all
  using (true);

-- ---------- assignments ----------
create policy "Teachers can view own assignments"
  on assignments for select
  using (auth.uid() = teacher_id);

create policy "Students can view assignments assigned to them"
  on assignments for select
  using (auth.uid() = any(student_ids));

create policy "Teachers/admins can insert assignments"
  on assignments for insert
  with check (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );

create policy "Teachers can update own assignments"
  on assignments for update
  using (auth.uid() = teacher_id);

-- ---------- generation_logs ----------
create policy "Admins/teachers can view generation logs"
  on generation_logs for select
  using (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );

create policy "Admins/teachers can insert generation logs"
  on generation_logs for insert
  with check (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );

-- ============================================================
-- 17. TRIGGERS
-- ============================================================

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, role)
  values (new.id, new.email, 'student');

  insert into public.streaks (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Update updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_user_profiles
  before update on user_profiles
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_subscriptions
  before update on subscriptions
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_streaks
  before update on streaks
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- 18. SEED DATA — Badges
-- ============================================================

insert into badges (slug, name, description, icon) values
  ('first-step', 'First Step', 'Complete your first exercise', '🚀'),
  ('on-a-roll', 'On a Roll', 'Reach a 3-day streak', '🔥'),
  ('week-warrior', 'Week Warrior', 'Reach a 7-day streak', '⚔️'),
  ('fortnight', 'Fortnight', 'Reach a 14-day streak', '🛡️'),
  ('monthly-grind', 'Monthly Grind', 'Reach a 30-day streak', '💪'),
  ('level-up', 'Level Up', 'Advance to the next CEFR level', '📈'),
  ('centurion', 'Centurion', 'Complete 100 exercises', '💯'),
  ('speed-demon', 'Speed Demon', 'Complete 10 exercises in one session', '⚡'),
  ('tutors-pet', 'Tutors Pet', 'Complete 5 AI tutor conversations', '🤖'),
  ('perfect-run', 'Perfect Run', 'Complete a full daily queue with 100% correct', '✨');
