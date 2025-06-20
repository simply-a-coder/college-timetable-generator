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
      assignments: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          program_id: string | null
          section_or_group_ids: string[]
          teacher_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          program_id?: string | null
          section_or_group_ids?: string[]
          teacher_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          program_id?: string | null
          section_or_group_ids?: string[]
          teacher_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          capacity: number
          created_at: string
          id: string
          name: string
          program_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          name: string
          program_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          program_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          no_back_to_back: string[]
          number_of_hours: number
          program_id: string | null
          room_type: string
          sessions_per_week: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          no_back_to_back?: string[]
          number_of_hours?: number
          program_id?: string | null
          room_type?: string
          sessions_per_week?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          no_back_to_back?: string[]
          number_of_hours?: number
          program_id?: string | null
          room_type?: string
          sessions_per_week?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          name: string
          program_id: string | null
          sections: string[]
          sessions_override: number | null
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          name: string
          program_id?: string | null
          sections?: string[]
          sessions_override?: number | null
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          name?: string
          program_id?: string | null
          sections?: string[]
          sessions_override?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          allowed_slots: string[]
          created_at: string
          id: string
          lunch_end_slot: string
          lunch_start_slot: string
          max_labs_per_day: number
          max_lectures_per_day: number
          program_id: string | null
          section_break_rules: Json
          travel_gap_minutes: number
          updated_at: string
        }
        Insert: {
          allowed_slots?: string[]
          created_at?: string
          id?: string
          lunch_end_slot?: string
          lunch_start_slot?: string
          max_labs_per_day?: number
          max_lectures_per_day?: number
          program_id?: string | null
          section_break_rules?: Json
          travel_gap_minutes?: number
          updated_at?: string
        }
        Update: {
          allowed_slots?: string[]
          created_at?: string
          id?: string
          lunch_end_slot?: string
          lunch_start_slot?: string
          max_labs_per_day?: number
          max_lectures_per_day?: number
          program_id?: string | null
          section_break_rules?: Json
          travel_gap_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          code: string
          created_at: string
          id: string
          lecture_timings: string | null
          program_id: string | null
          student_count: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          lecture_timings?: string | null
          program_id?: string | null
          student_count?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          lecture_timings?: string | null
          program_id?: string | null
          student_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          available_days: string[]
          available_slots: string[]
          created_at: string
          days_off: string[]
          id: string
          max_hours_per_day: number
          max_hours_per_week: number
          name: string
          program_id: string | null
          updated_at: string
        }
        Insert: {
          available_days?: string[]
          available_slots?: string[]
          created_at?: string
          days_off?: string[]
          id?: string
          max_hours_per_day?: number
          max_hours_per_week?: number
          name: string
          program_id?: string | null
          updated_at?: string
        }
        Update: {
          available_days?: string[]
          available_slots?: string[]
          created_at?: string
          days_off?: string[]
          id?: string
          max_hours_per_day?: number
          max_hours_per_week?: number
          name?: string
          program_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_entries: {
        Row: {
          course: string
          created_at: string
          day: string
          id: string
          program_id: string | null
          room: string
          section: string
          slot: string
          teacher: string
          time: string
        }
        Insert: {
          course: string
          created_at?: string
          day: string
          id?: string
          program_id?: string | null
          room: string
          section: string
          slot: string
          teacher: string
          time: string
        }
        Update: {
          course?: string
          created_at?: string
          day?: string
          id?: string
          program_id?: string | null
          room?: string
          section?: string
          slot?: string
          teacher?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
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
