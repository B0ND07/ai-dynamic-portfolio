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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read: boolean | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read?: boolean | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean | null
          subject?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certifications: string | null
          copyright_text: string | null
          created_at: string
          current_company: string | null
          current_position: string | null
          cv_url: string | null
          education: string | null
          email: string | null
          footer_description: string | null
          footer_social_email: string | null
          footer_social_github: string | null
          footer_social_linkedin: string | null
          full_name: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          phone: string | null
          quick_links: string | null
          services_list: string | null
          title: string | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
          years_experience: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string | null
          copyright_text?: string | null
          created_at?: string
          current_company?: string | null
          current_position?: string | null
          cv_url?: string | null
          education?: string | null
          email?: string | null
          footer_description?: string | null
          footer_social_email?: string | null
          footer_social_github?: string | null
          footer_social_linkedin?: string | null
          full_name?: string | null
          github_url?: string | null
          id: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          quick_links?: string | null
          services_list?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          years_experience?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: string | null
          copyright_text?: string | null
          created_at?: string
          current_company?: string | null
          current_position?: string | null
          cv_url?: string | null
          education?: string | null
          email?: string | null
          footer_description?: string | null
          footer_social_email?: string | null
          footer_social_github?: string | null
          footer_social_linkedin?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          quick_links?: string | null
          services_list?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          years_experience?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          featured: boolean | null
          github_url: string | null
          id: string
          image_url: string | null
          live_url: string | null
          status: string | null
          technologies: string[] | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          status?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          status?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          proficiency: number | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          proficiency?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          proficiency?: number | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
