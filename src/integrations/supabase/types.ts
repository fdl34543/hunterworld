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
      player_items: {
        Row: {
          acquired_at: string
          amount: number
          attack: number
          def_id: string
          defense: number
          effect: string | null
          id: string
          kind: string
          rarity: string
          slot_index: number
          slot_kind: string
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          acquired_at?: string
          amount?: number
          attack?: number
          def_id: string
          defense?: number
          effect?: string | null
          id?: string
          kind: string
          rarity: string
          slot_index?: number
          slot_kind?: string
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          acquired_at?: string
          amount?: number
          attack?: number
          def_id?: string
          defense?: number
          effect?: string | null
          id?: string
          kind?: string
          rarity?: string
          slot_index?: number
          slot_kind?: string
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          avatar: string
          base_damage: number
          base_defense: number
          character_sprite: string
          color: string
          created_at: string
          custom_avatar_url: string | null
          energy: number
          equipped_armor: string | null
          equipped_weapon: string | null
          gold: number
          hp: number
          id: string
          job: string
          last_beer_at: string | null
          last_boss_at: string | null
          last_boss_at_by_map: Json
          last_energy_at: string
          last_farm_at: string | null
          last_fountain_at: string | null
          last_study_at: string | null
          max_hp: number
          name: string
          updated_at: string
          user_id: string | null
          wallet_address: string | null
          xp: number
        }
        Insert: {
          avatar?: string
          base_damage?: number
          base_defense?: number
          character_sprite?: string
          color?: string
          created_at?: string
          custom_avatar_url?: string | null
          energy?: number
          equipped_armor?: string | null
          equipped_weapon?: string | null
          gold?: number
          hp?: number
          id?: string
          job?: string
          last_beer_at?: string | null
          last_boss_at?: string | null
          last_boss_at_by_map?: Json
          last_energy_at?: string
          last_farm_at?: string | null
          last_fountain_at?: string | null
          last_study_at?: string | null
          max_hp?: number
          name?: string
          updated_at?: string
          user_id?: string | null
          wallet_address?: string | null
          xp?: number
        }
        Update: {
          avatar?: string
          base_damage?: number
          base_defense?: number
          character_sprite?: string
          color?: string
          created_at?: string
          custom_avatar_url?: string | null
          energy?: number
          equipped_armor?: string | null
          equipped_weapon?: string | null
          gold?: number
          hp?: number
          id?: string
          job?: string
          last_beer_at?: string | null
          last_boss_at?: string | null
          last_boss_at_by_map?: Json
          last_energy_at?: string
          last_farm_at?: string | null
          last_fountain_at?: string | null
          last_study_at?: string | null
          max_hp?: number
          name?: string
          updated_at?: string
          user_id?: string | null
          wallet_address?: string | null
          xp?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_player_by_wallet: {
        Args: { p_wallet: string }
        Returns: {
          avatar: string
          base_damage: number
          base_defense: number
          character_sprite: string
          color: string
          created_at: string
          custom_avatar_url: string | null
          energy: number
          equipped_armor: string | null
          equipped_weapon: string | null
          gold: number
          hp: number
          id: string
          job: string
          last_beer_at: string | null
          last_boss_at: string | null
          last_boss_at_by_map: Json
          last_energy_at: string
          last_farm_at: string | null
          last_fountain_at: string | null
          last_study_at: string | null
          max_hp: number
          name: string
          updated_at: string
          user_id: string | null
          wallet_address: string | null
          xp: number
        }
        SetofOptions: {
          from: "*"
          to: "players"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      leaderboard_count: { Args: never; Returns: number }
      leaderboard_top: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          avatar: string
          color: string
          gold: number
          job: string
          name: string
          wallet_address: string
          xp: number
        }[]
      }
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
