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
      pagadores_favoritos: {
        Row: {
          cpf_cnpj: string
          created_at: string
          id: string
          is_public: boolean
          nome: string
          user_id: string
        }
        Insert: {
          cpf_cnpj: string
          created_at?: string
          id?: string
          is_public?: boolean
          nome: string
          user_id: string
        }
        Update: {
          cpf_cnpj?: string
          created_at?: string
          id?: string
          is_public?: boolean
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      recebedores_favoritos: {
        Row: {
          bairro: string
          cep: string
          cidade: string
          complemento: string | null
          cpf_cnpj: string
          created_at: string
          estado: string
          id: string
          is_public: boolean
          nome: string
          numero: string
          rua: string
          user_id: string
        }
        Insert: {
          bairro: string
          cep: string
          cidade: string
          complemento?: string | null
          cpf_cnpj: string
          created_at?: string
          estado: string
          id?: string
          is_public?: boolean
          nome: string
          numero: string
          rua: string
          user_id: string
        }
        Update: {
          bairro?: string
          cep?: string
          cidade?: string
          complemento?: string | null
          cpf_cnpj?: string
          created_at?: string
          estado?: string
          id?: string
          is_public?: boolean
          nome?: string
          numero?: string
          rua?: string
          user_id?: string
        }
        Relationships: []
      }
      recibos: {
        Row: {
          cpf_cnpj: string
          cpf_cnpj_recebedor: string
          created_at: string
          data: string
          descricao: string
          id: string
          local: string
          numero_recibo: number
          pagador: string
          pdf_url: string | null
          recebedor: string
          user_id: string
          valor: number
          valor_extenso: string
        }
        Insert: {
          cpf_cnpj: string
          cpf_cnpj_recebedor: string
          created_at?: string
          data: string
          descricao: string
          id?: string
          local: string
          numero_recibo?: number
          pagador: string
          pdf_url?: string | null
          recebedor: string
          user_id: string
          valor: number
          valor_extenso: string
        }
        Update: {
          cpf_cnpj?: string
          cpf_cnpj_recebedor?: string
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          local?: string
          numero_recibo?: number
          pagador?: string
          pdf_url?: string | null
          recebedor?: string
          user_id?: string
          valor?: number
          valor_extenso?: string
        }
        Relationships: []
      }
      user_approvals: {
        Row: {
          approved_at: string | null
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["user_status"] | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          id: string
          status?: Database["public"]["Enums"]["user_status"] | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["user_status"] | null
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
      user_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
