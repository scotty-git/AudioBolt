export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
      }
      onboarding_submissions: {
        Row: {
          id: string
          user_id: string
          flow_id: string
          responses: Json
          progress: Json
          started_at: string
          completed_at: string | null
          last_updated: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          flow_id: string
          responses?: Json
          progress?: Json
          started_at?: string
          completed_at?: string | null
          last_updated?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          flow_id?: string
          responses?: Json
          progress?: Json
          started_at?: string
          completed_at?: string | null
          last_updated?: string
          metadata?: Json | null
        }
      }
      questionnaire_submissions: {
        Row: {
          id: string
          user_id: string
          template_id: string
          answers: Json
          started_at: string
          completed_at: string | null
          last_updated: string
          status: 'in_progress' | 'completed' | 'abandoned'
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          template_id: string
          answers?: Json
          started_at?: string
          completed_at?: string | null
          last_updated?: string
          status?: 'in_progress' | 'completed' | 'abandoned'
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string
          answers?: Json
          started_at?: string
          completed_at?: string | null
          last_updated?: string
          status?: 'in_progress' | 'completed' | 'abandoned'
          metadata?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}