export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'student' | 'teacher' | 'admin'
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          professional_context: string | null
          onboarding_complete: boolean
          placement_test_taken_at: string | null
          placement_test_eligible_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: 'student' | 'teacher' | 'admin'
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          professional_context?: string | null
          onboarding_complete?: boolean
          placement_test_taken_at?: string | null
          placement_test_eligible_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'student' | 'teacher' | 'admin'
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          professional_context?: string | null
          onboarding_complete?: boolean
          placement_test_taken_at?: string | null
          placement_test_eligible_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          language: string
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          skill: 'grammar' | 'vocabulary' | 'listening' | 'reading'
          type: 'mcq' | 'fill_blank' | 'vocab_flashcard' | 'vocab_drag' | 'listening_mcq'
          content: Json
          audio_url: string | null
          status: 'draft' | 'approved' | 'archived'
          ai_generated: boolean
          generated_by: string | null
          created_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          language?: string
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          skill: 'grammar' | 'vocabulary' | 'listening' | 'reading'
          type: 'mcq' | 'fill_blank' | 'vocab_flashcard' | 'vocab_drag' | 'listening_mcq'
          content: Json
          audio_url?: string | null
          status?: 'draft' | 'approved' | 'archived'
          ai_generated?: boolean
          generated_by?: string | null
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          language?: string
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          skill?: 'grammar' | 'vocabulary' | 'listening' | 'reading'
          type?: 'mcq' | 'fill_blank' | 'vocab_flashcard' | 'vocab_drag' | 'listening_mcq'
          content?: Json
          audio_url?: string | null
          status?: 'draft' | 'approved' | 'archived'
          ai_generated?: boolean
          generated_by?: string | null
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: []
      }
      completions: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          correct: boolean
          time_taken_ms: number | null
          attempt_number: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          correct: boolean
          time_taken_ms?: number | null
          attempt_number?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          correct?: boolean
          time_taken_ms?: number | null
          attempt_number?: number
          created_at?: string
        }
        Relationships: []
      }
      xp_log: {
        Row: {
          id: string
          user_id: string
          amount: number
          source: string
          exercise_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          source: string
          exercise_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          source?: string
          exercise_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          user_id: string
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          freeze_available: boolean
          last_freeze_used: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          freeze_available?: boolean
          last_freeze_used?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          freeze_available?: boolean
          last_freeze_used?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description: string
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string
          icon?: string
          created_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          created_at: string
          last_message_at: string
          message_count: number
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          last_message_at?: string
          message_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          last_message_at?: string
          message_count?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      leaderboard_snapshots: {
        Row: {
          id: string
          user_id: string
          week_start: string
          xp_earned: number
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          xp_earned?: number
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          xp_earned?: number
        }
        Relationships: []
      }
      assignments: {
        Row: {
          id: string
          teacher_id: string
          title: string
          exercise_ids: string[]
          student_ids: string[]
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          title: string
          exercise_ids?: string[]
          student_ids?: string[]
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          title?: string
          exercise_ids?: string[]
          student_ids?: string[]
          due_date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          id: string
          user_id: string
          pillar: string
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          content: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pillar: string
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          content: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pillar?: string
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          content?: Json
          created_at?: string
        }
        Relationships: []
      }
      nim_usage: {
        Row: {
          id: string
          created_at: string
          source: string
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          source: string
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      generation_logs: {
        Row: {
          id: string
          generated_by: string | null
          topic: string
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          skill: 'grammar' | 'vocabulary' | 'listening' | 'reading'
          exercise_type: 'mcq' | 'fill_blank' | 'vocab_flashcard' | 'vocab_drag' | 'listening_mcq'
          count: number
          model_used: string | null
          prompt: string | null
          response: string | null
          exercises_created: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          generated_by?: string | null
          topic: string
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          skill: 'grammar' | 'vocabulary' | 'listening' | 'reading'
          exercise_type: 'mcq' | 'fill_blank' | 'vocab_flashcard' | 'vocab_drag' | 'listening_mcq'
          count: number
          model_used?: string | null
          prompt?: string | null
          response?: string | null
          exercises_created?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          generated_by?: string | null
          topic?: string
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          skill?: 'grammar' | 'vocabulary' | 'listening' | 'reading'
          exercise_type?: 'mcq' | 'fill_blank' | 'vocab_flashcard' | 'vocab_drag' | 'listening_mcq'
          count?: number
          model_used?: string | null
          prompt?: string | null
          response?: string | null
          exercises_created?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      get_user_total_xp: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_weekly_xp: {
        Args: { p_user_id: string; p_week_start: string }
        Returns: number
      }
      get_weekly_leaderboard: {
        Args: { p_week_start: string }
        Returns: {
          user_id: string
          name: string
          xp_earned: number
          rank: number
        }[]
      }
      get_user_weekly_rank: {
        Args: { p_user_id: string; p_week_start: string }
        Returns: {
          rank: number
          xp_earned: number
        }[]
      }
    }
    Enums: {
      app_role: 'student' | 'teacher' | 'admin'
      subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
      exercise_status: 'draft' | 'approved' | 'archived'
      exercise_type: 'mcq' | 'fill_blank' | 'vocab_flashcard' | 'vocab_drag' | 'listening_mcq'
      cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
      exercise_skill: 'grammar' | 'vocabulary' | 'listening' | 'reading'
      chat_role_type: 'user' | 'assistant' | 'system'
    }
  }
}
