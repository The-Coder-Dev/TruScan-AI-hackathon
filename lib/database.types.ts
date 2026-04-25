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
      scans: {
        Row: {
          confidence: number
          created_at: string
          explanation: string
          fraud_score: number
          id: string
          label: string
          raw_input: string | null
          risk_level: string
          type: string
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          explanation?: string
          fraud_score?: number
          id?: string
          label?: string
          raw_input?: string | null
          risk_level?: string
          type: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          explanation?: string
          fraud_score?: number
          id?: string
          label?: string
          raw_input?: string | null
          risk_level?: string
          type?: string
          user_id?: string
        }
      }
      user_plans: {
        Row: {
          created_at: string
          credits_total: number
          credits_used: number
          id: string
          plan: string
          reset_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_total?: number
          credits_used?: number
          id?: string
          plan?: string
          reset_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          credits_total?: number
          credits_used?: number
          plan?: string
          reset_at?: string | null
          updated_at?: string
        }
      }
    }
    Functions: {
      consume_credit: { Args: { p_user_id: string }; Returns: Json }
    }
  }
}

export type UserPlan = Database["public"]["Tables"]["user_plans"]["Row"]
export type Scan = Database["public"]["Tables"]["scans"]["Row"]
