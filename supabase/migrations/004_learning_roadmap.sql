-- ============================================================
-- 4. LEARNING ROADMAP TABLES
-- ============================================================

-- Store personalized learning roadmaps for each student
create table learning_roadmaps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  current_cefr_level cefr_level not null,
  target_cefr_level cefr_level not null,
  
  -- Assessment data
  overall_accuracy numeric(5,2) not null, -- percentage 0-100
  skill_breakdown jsonb not null, -- {grammar: {accuracy: 85, difficulty_avg: 2.3}, vocabulary: {...}}
  level_breakdown jsonb not null, -- {A1: {accuracy: 95, passed: true}, A2: {accuracy: 70, passed: true}, ...}
  contextual_comprehension_score numeric(5,2), -- Score for context-based questions
  
  -- Roadmap content
  strengths text[], -- Areas where student excels
  weaknesses text[], -- Areas needing improvement
  priority_topics text[], -- Topics to focus on first
  study_plan jsonb not null, -- Structured learning plan with phases
  estimated_hours_to_proficiency integer not null, -- Hours needed to reach target level
  estimated_weeks integer not null, -- Weeks at recommended study pace
  recommended_study_hours_per_week integer not null default 5,
  
  -- Metadata
  generated_at timestamptz not null default now(),
  expires_at timestamptz, -- Roadmap validity (e.g., 6 months)
  is_active boolean not null default true,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table learning_roadmaps is 'Personalized learning roadmap generated from placement test results';

-- Index for quick lookup
create index idx_learning_roadmaps_user_id on learning_roadmaps(user_id);
create index idx_learning_roadmaps_active on learning_roadmaps(user_id, is_active) where is_active = true;

-- Store roadmap milestones and progress
create table roadmap_milestones (
  id uuid primary key default uuid_generate_v4(),
  roadmap_id uuid not null references learning_roadmaps(id) on delete cascade,
  phase_name text not null, -- e.g., "Foundation Building", "Intermediate Mastery"
  phase_order integer not null,
  description text not null,
  topics text[] not null,
  estimated_hours integer not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'skipped')),
  started_at timestamptz,
  completed_at timestamptz,
  
  created_at timestamptz not null default now()
);

comment on table roadmap_milestones is 'Individual milestones/phases within a learning roadmap';

create index idx_roadmap_milestones_roadmap_id on roadmap_milestones(roadmap_id);
create index idx_roadmap_milestones_status on roadmap_milestones(roadmap_id, status);

-- Store specific learning resources/recommendations per roadmap
create table roadmap_resources (
  id uuid primary key default uuid_generate_v4(),
  roadmap_id uuid not null references learning_roadmaps(id) on delete cascade,
  milestone_id uuid references roadmap_milestones(id) on delete set null,
  
  resource_type text not null check (resource_type in ('exercise', 'reading', 'video', 'podcast', 'conversation', 'quiz')),
  title text not null,
  description text,
  cefr_level cefr_level not null,
  topic text not null,
  estimated_minutes integer not null,
  url text, -- Optional external resource link
  is_completed boolean not null default false,
  completed_at timestamptz,
  
  created_at timestamptz not null default now()
);

comment on table roadmap_resources is 'Specific learning resources recommended in a roadmap';

create index idx_roadmap_resources_roadmap_id on roadmap_resources(roadmap_id);
create index idx_roadmap_resources_milestone_id on roadmap_resources(milestone_id);

-- Update trigger for updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_learning_roadmaps_updated_at
  before update on learning_roadmaps
  for each row
  execute function update_updated_at_column();
