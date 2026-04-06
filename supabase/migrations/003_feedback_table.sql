-- Feedback table for user-submitted feedback
create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_profiles(id) on delete set null,
  email text,
  category text not null, -- 'bug', 'feature', 'improvement', 'other'
  message text not null,
  status text not null default 'pending', -- 'pending', 'reviewed', 'resolved'
  created_at timestamptz not null default now()
);

create index idx_feedback_created on feedback(created_at desc);
create index idx_feedback_status on feedback(status);

alter table feedback enable row level security;

-- Users can submit feedback
create policy "Anyone can submit feedback"
  on feedback for insert
  with check (true);

-- Admins/teachers can view all feedback
create policy "Admins/teachers can view feedback"
  on feedback for select
  using (
    auth.uid() in (
      select id from user_profiles where role in ('teacher', 'admin')
    )
  );
