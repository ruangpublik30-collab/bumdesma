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
      business_units: {
        Row: {
          created_at: string
          id: string
          jenis_unit: string
          kode_unit: string
          nama_unit: string
          status: Database["public"]["Enums"]["unit_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_unit: string
          kode_unit: string
          nama_unit: string
          status?: Database["public"]["Enums"]["unit_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis_unit?: string
          kode_unit?: string
          nama_unit?: string
          status?: Database["public"]["Enums"]["unit_status"]
          updated_at?: string
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          created_at: string
          id: string
          kode: string
          nama: string
          tipe: Database["public"]["Enums"]["account_type"]
          unit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kode: string
          nama: string
          tipe: Database["public"]["Enums"]["account_type"]
          unit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kode?: string
          nama?: string
          tipe?: Database["public"]["Enums"]["account_type"]
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      coa_template_global: {
        Row: {
          created_at: string
          id: string
          kode: string
          nama: string
          tipe: Database["public"]["Enums"]["account_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          kode: string
          nama: string
          tipe: Database["public"]["Enums"]["account_type"]
        }
        Update: {
          created_at?: string
          id?: string
          kode?: string
          nama?: string
          tipe?: Database["public"]["Enums"]["account_type"]
        }
        Relationships: []
      }
      coa_template_unit: {
        Row: {
          created_at: string
          id: string
          kode: string
          nama: string
          tipe: Database["public"]["Enums"]["account_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          kode: string
          nama: string
          tipe: Database["public"]["Enums"]["account_type"]
        }
        Update: {
          created_at?: string
          id?: string
          kode?: string
          nama?: string
          tipe?: Database["public"]["Enums"]["account_type"]
        }
        Relationships: []
      }
      journal_items: {
        Row: {
          account_id: string
          debit: number
          deskripsi: string | null
          id: string
          journal_id: string
          kredit: number
          unit_id: string
        }
        Insert: {
          account_id: string
          debit?: number
          deskripsi?: string | null
          id?: string
          journal_id: string
          kredit?: number
          unit_id: string
        }
        Update: {
          account_id?: string
          debit?: number
          deskripsi?: string | null
          id?: string
          journal_id?: string
          kredit?: number
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_items_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_items_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      journals: {
        Row: {
          created_at: string
          created_by: string | null
          deskripsi: string | null
          id: string
          nomor: string
          tanggal: string
          unit_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          id?: string
          nomor: string
          tanggal?: string
          unit_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          id?: string
          nomor?: string
          tanggal?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journals_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          unit_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          unit_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          unit_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_unit: {
        Args: { _unit_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      user_unit_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      account_type:
        | "ASET"
        | "KEWAJIBAN"
        | "EKUITAS"
        | "PENDAPATAN"
        | "HPP"
        | "BEBAN"
      app_role: "super_admin" | "admin_unit"
      unit_status: "aktif" | "nonaktif"
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
    Enums: {
      account_type: [
        "ASET",
        "KEWAJIBAN",
        "EKUITAS",
        "PENDAPATAN",
        "HPP",
        "BEBAN",
      ],
      app_role: ["super_admin", "admin_unit"],
      unit_status: ["aktif", "nonaktif"],
    },
  },
} as const
