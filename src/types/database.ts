export type Role = 'student' | 'teacher' | 'admin';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
export type ExerciseStatus = 'draft' | 'approved' | 'archived';
export type ExerciseType = 'mcq' | 'fill_blank' | 'vocab_flashcard' | 'vocab_drag' | 'listening_mcq';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ExerciseSkill = 'grammar' | 'vocabulary' | 'listening' | 'reading';
export type ChatRoleType = 'user' | 'assistant' | 'system';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  cefr_level: CefrLevel | null;
  professional_context: string | null;
  onboarding_complete: boolean;
  placement_test_taken_at: string | null;
  placement_test_eligible_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  language: string;
  cefr_level: CefrLevel;
  skill: ExerciseSkill;
  type: ExerciseType;
  content: Record<string, unknown>;
  audio_url: string | null;
  status: ExerciseStatus;
  ai_generated: boolean;
  generated_by: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface Completion {
  id: string;
  user_id: string;
  exercise_id: string;
  correct: boolean;
  time_taken_ms: number | null;
  attempt_number: number;
  created_at: string;
}

export interface XPLog {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  exercise_id: string | null;
  created_at: string;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  freeze_available: boolean;
  last_freeze_used: string | null;
  updated_at: string;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
  last_message_at: string;
  message_count: number;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: ChatRoleType;
  content: string;
  created_at: string;
}

export interface LeaderboardSnapshot {
  id: string;
  user_id: string;
  week_start: string;
  xp_earned: number;
}

export interface Assignment {
  id: string;
  teacher_id: string;
  title: string;
  exercise_ids: string[];
  student_ids: string[];
  due_date: string | null;
  created_at: string;
}

export interface GenerationLog {
  id: string;
  generated_by: string | null;
  topic: string;
  cefr_level: CefrLevel;
  skill: ExerciseSkill;
  exercise_type: ExerciseType;
  count: number;
  model_used: string | null;
  prompt: string | null;
  response: string | null;
  exercises_created: string[] | null;
  created_at: string;
}

// XP thresholds for CEFR levels (cumulative)
export const XP_THRESHOLDS: Record<CefrLevel, number> = {
  A1: 0,
  A2: 500,
  B1: 1500,
  B2: 3000,
  C1: 5000,
  C2: 8000,
};

// Base XP per exercise by CEFR level
export const BASE_XP: Record<CefrLevel, number> = {
  A1: 10,
  A2: 15,
  B1: 20,
  B2: 25,
  C1: 30,
  C2: 40,
};
