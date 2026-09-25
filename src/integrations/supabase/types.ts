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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          airline: string
          created_at: string
          id: string
          price: string | null
          route: string
          user_id: string
        }
        Insert: {
          airline: string
          created_at?: string
          id?: string
          price?: string | null
          route: string
          user_id: string
        }
        Update: {
          airline?: string
          created_at?: string
          id?: string
          price?: string | null
          route?: string
          user_id?: string
        }
        Relationships: []
      }
      help_requests: {
        Row: {
          category: string
          contact: string
          created_at: string
          id: string
          message: string
          name: string
          status: string
          user_id: string | null
        }
        Insert: {
          category?: string
          contact: string
          created_at?: string
          id?: string
          message: string
          name: string
          status?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          contact?: string
          created_at?: string
          id?: string
          message?: string
          name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      journey_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          message: string
          new_value: string | null
          old_value: string | null
          passenger_id: string
          requires_action: boolean
          severity: string
          title: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          message?: string
          new_value?: string | null
          old_value?: string | null
          passenger_id: string
          requires_action?: boolean
          severity?: string
          title: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          message?: string
          new_value?: string | null
          old_value?: string | null
          passenger_id?: string
          requires_action?: boolean
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_events_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string
          estimated_time_minutes: number | null
          id: string
          passenger_id: string
          status: string
          step_key: string
          step_order: number
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string
          estimated_time_minutes?: number | null
          id?: string
          passenger_id: string
          status?: string
          step_key: string
          step_order: number
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string
          estimated_time_minutes?: number | null
          id?: string
          passenger_id?: string
          status?: string
          step_key?: string
          step_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_steps_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
        ]
      }
      passengers: {
        Row: {
          airline: string
          arrived_at: string | null
          baggage_dropped_at: string | null
          baggage_skipped: boolean
          boarding_started_at: string | null
          booking_id: string | null
          cabin: string | null
          checked_in_at: string | null
          created_at: string
          delay_minutes: number
          departed_at: string | null
          departure_time: string
          destination: string
          flight_number: string
          flight_status: string
          gate: string | null
          id: string
          is_demo: boolean
          journey_status: string
          origin: string
          passenger_name: string
          seat: string | null
          security_cleared_at: string | null
          terminal: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          airline: string
          arrived_at?: string | null
          baggage_dropped_at?: string | null
          baggage_skipped?: boolean
          boarding_started_at?: string | null
          booking_id?: string | null
          cabin?: string | null
          checked_in_at?: string | null
          created_at?: string
          delay_minutes?: number
          departed_at?: string | null
          departure_time: string
          destination: string
          flight_number: string
          flight_status?: string
          gate?: string | null
          id?: string
          is_demo?: boolean
          journey_status?: string
          origin: string
          passenger_name: string
          seat?: string | null
          security_cleared_at?: string | null
          terminal?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          airline?: string
          arrived_at?: string | null
          baggage_dropped_at?: string | null
          baggage_skipped?: boolean
          boarding_started_at?: string | null
          booking_id?: string | null
          cabin?: string | null
          checked_in_at?: string | null
          created_at?: string
          delay_minutes?: number
          departed_at?: string | null
          departure_time?: string
          destination?: string
          flight_number?: string
          flight_status?: string
          gate?: string | null
          id?: string
          is_demo?: boolean
          journey_status?: string
          origin?: string
          passenger_name?: string
          seat?: string | null
          security_cleared_at?: string | null
          terminal?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          feedback: number | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          feedback?: number | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          feedback?: number | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
