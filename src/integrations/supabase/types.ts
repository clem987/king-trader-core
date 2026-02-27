export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      checklist_items: {
        Row: {
          created_at: string | null
          id: string
          label: string
          sort_order: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          sort_order?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          sort_order?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          level: string | null
          market: string | null
          max_risk_per_trade: number | null
          max_trades_per_day: number | null
          min_rr: number | null
          onboarding_completed: boolean | null
          strategy: string | null
          streak: number | null
          trading_session: string | null
          updated_at: string | null
          user_id: string
          username: string
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string | null
          market?: string | null
          max_risk_per_trade?: number | null
          max_trades_per_day?: number | null
          min_rr?: number | null
          onboarding_completed?: boolean | null
          strategy?: string | null
          streak?: number | null
          trading_session?: string | null
          updated_at?: string | null
          user_id: string
          username: string
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string | null
          market?: string | null
          max_risk_per_trade?: number | null
          max_trades_per_day?: number | null
          min_rr?: number | null
          onboarding_completed?: boolean | null
          strategy?: string | null
          streak?: number | null
          trading_session?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string
          xp?: number | null
        }
        Relationships: []
      }
      strategies: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          market: string | null
          max_trades: number | null
          name: string
          risk_max: number | null
          rr_min: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          market?: string | null
          max_trades?: number | null
          name: string
          risk_max?: number | null
          rr_min?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          market?: string | null
          max_trades?: number | null
          name?: string
          risk_max?: number | null
          rr_min?: number | null
          user_id?: string
        }
        Relationships: []
      }
      strategy_checklist_items: {
        Row: {
          checklist_id: string
          created_at: string | null
          id: string
          is_checked: boolean | null
          is_required: boolean
          order_index: number | null
          text: string
        }
        Insert: {
          checklist_id: string
          created_at?: string | null
          id?: string
          is_checked?: boolean | null
          is_required?: boolean
          order_index?: number | null
          text: string
        }
        Update: {
          checklist_id?: string
          created_at?: string | null
          id?: string
          is_checked?: boolean | null
          is_required?: boolean
          order_index?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "strategy_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_checklists: {
        Row: {
          created_at: string | null
          id: string
          strategy_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          strategy_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          strategy_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_checklists_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          after_photo_url: string | null
          before_photo_url: string | null
          clarity_score: number | null
          created_at: string | null
          date: string | null
          direction: string | null
          discipline_score: number | null
          emotion: string | null
          emotional_management: number | null
          execution_quality: number | null
          felt_fear: boolean | null
          hesitated: boolean | null
          id: string
          notes: string | null
          pair: string | null
          plan_respect: number | null
          plan_respected: boolean | null
          respected_plan: boolean | null
          respected_rr: boolean | null
          result_amount: number | null
          rr_achieved: number | null
          setup: string | null
          setup_respected: boolean | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          clarity_score?: number | null
          created_at?: string | null
          date?: string | null
          direction?: string | null
          discipline_score?: number | null
          emotion?: string | null
          emotional_management?: number | null
          execution_quality?: number | null
          felt_fear?: boolean | null
          hesitated?: boolean | null
          id?: string
          notes?: string | null
          pair?: string | null
          plan_respect?: number | null
          plan_respected?: boolean | null
          respected_plan?: boolean | null
          respected_rr?: boolean | null
          result_amount?: number | null
          rr_achieved?: number | null
          setup?: string | null
          setup_respected?: boolean | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          clarity_score?: number | null
          created_at?: string | null
          date?: string | null
          direction?: string | null
          discipline_score?: number | null
          emotion?: string | null
          emotional_management?: number | null
          execution_quality?: number | null
          felt_fear?: boolean | null
          hesitated?: boolean | null
          id?: string
          notes?: string | null
          pair?: string | null
          plan_respect?: number | null
          plan_respected?: boolean | null
          respected_plan?: boolean | null
          respected_rr?: boolean | null
          result_amount?: number | null
          rr_achieved?: number | null
          setup?: string | null
          setup_respected?: boolean | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
