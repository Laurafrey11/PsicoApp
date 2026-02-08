// =============================================================================
// Tipos de Base de Datos - Generados desde schema.sql
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enums
export type EmotionType =
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'disgust'
  | 'calm'
  | 'anxiety'
  | 'hope'
  | 'frustration';

export type DefenseMechanism =
  | 'denial'
  | 'projection'
  | 'rationalization'
  | 'displacement'
  | 'sublimation'
  | 'repression'
  | 'regression'
  | 'reaction_formation';

export type SummaryType = 'daily' | 'weekly' | 'monthly' | 'therapeutic';

export type RiskLevel = 'moderate' | 'high' | 'critical';

export type MessageRole = 'user' | 'assistant' | 'system';

export type ResolutionMethod =
  | 'user_dismissed'
  | 'call_completed'
  | 'timeout'
  | 'professional_intervention';

// =============================================================================
// Table Types
// =============================================================================

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  emergency_contact_phone: string;
  therapist_name: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number;
  energy_level: number | null;
  anxiety_level: number | null;
  sleep_quality: number | null;
  primary_emotion: EmotionType | null;
  secondary_emotions: EmotionType[] | null;
  triggers: string[] | null;
  activities: string[] | null;
  notes: string | null;
  notes_anonymized: string | null;
  ai_analysis: Json | null;
  defense_mechanisms: DefenseMechanism[] | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface StressLog {
  id: string;
  user_id: string;
  intensity: number;
  duration_minutes: number | null;
  situation: string;
  situation_anonymized: string | null;
  physical_symptoms: string[] | null;
  thoughts: string | null;
  thoughts_anonymized: string | null;
  defense_mechanism: DefenseMechanism | null;
  defense_mechanism_explanation: string | null;
  coping_suggestions: string[] | null;
  ai_insights: Json | null;
  resolution_strategy: string | null;
  effectiveness_rating: number | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  content_anonymized: string | null;
  tokens_used: number | null;
  model_used: string;
  flagged_risk: boolean;
  risk_keywords: string[] | null;
  created_at: string;
}

export interface Summary {
  id: string;
  user_id: string;
  summary_type: SummaryType;
  content: string;
  key_insights: string[] | null;
  recurring_patterns: string[] | null;
  defense_mechanisms_frequency: Json | null;
  mood_trends: Json | null;
  period_start: string;
  period_end: string;
  messages_summarized: number | null;
  created_at: string;
}

export interface EmergencyLog {
  id: string;
  user_id: string;
  trigger_message: string | null;
  detected_keywords: string[] | null;
  risk_level: RiskLevel | null;
  lockdown_activated: boolean;
  call_button_shown: boolean;
  call_initiated: boolean;
  resolved_at: string | null;
  resolution_method: ResolutionMethod | null;
  created_at: string;
  session_id: string | null;
}

// =============================================================================
// Insert Types (for creating new records)
// =============================================================================

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type MoodEntryInsert = Omit<
  MoodEntry,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type StressLogInsert = Omit<
  StressLog,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ChatMessageInsert = Omit<ChatMessage, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type SummaryInsert = Omit<Summary, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type EmergencyLogInsert = Omit<EmergencyLog, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// =============================================================================
// Update Types (for updating existing records)
// =============================================================================

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;
export type MoodEntryUpdate = Partial<Omit<MoodEntry, 'id' | 'user_id' | 'created_at'>>;
export type StressLogUpdate = Partial<Omit<StressLog, 'id' | 'user_id' | 'created_at'>>;

// =============================================================================
// Database Schema Type (for Supabase client)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      mood_entries: {
        Row: MoodEntry;
        Insert: MoodEntryInsert;
        Update: MoodEntryUpdate;
      };
      stress_logs: {
        Row: StressLog;
        Insert: StressLogInsert;
        Update: StressLogUpdate;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: ChatMessageInsert;
        Update: Partial<ChatMessage>;
      };
      summaries: {
        Row: Summary;
        Insert: SummaryInsert;
        Update: Partial<Summary>;
      };
      emergency_logs: {
        Row: EmergencyLog;
        Insert: EmergencyLogInsert;
        Update: Partial<EmergencyLog>;
      };
    };
    Functions: {
      get_recent_messages: {
        Args: { p_user_id: string; p_limit?: number };
        Returns: { role: string; content: string; created_at: string }[];
      };
      get_latest_summary: {
        Args: { p_user_id: string; p_type?: string };
        Returns: {
          content: string;
          key_insights: string[];
          period_start: string;
          period_end: string;
        }[];
      };
    };
  };
}
