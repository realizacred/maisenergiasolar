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
      calculadora_config: {
        Row: {
          created_at: string
          custo_por_kwp: number
          geracao_mensal_por_kwp: number
          id: string
          kg_co2_por_kwh: number
          percentual_economia: number
          tarifa_media_kwh: number
          updated_at: string
          vida_util_sistema: number
        }
        Insert: {
          created_at?: string
          custo_por_kwp?: number
          geracao_mensal_por_kwp?: number
          id?: string
          kg_co2_por_kwh?: number
          percentual_economia?: number
          tarifa_media_kwh?: number
          updated_at?: string
          vida_util_sistema?: number
        }
        Update: {
          created_at?: string
          custo_por_kwp?: number
          geracao_mensal_por_kwp?: number
          id?: string
          kg_co2_por_kwh?: number
          percentual_economia?: number
          tarifa_media_kwh?: number
          updated_at?: string
          vida_util_sistema?: number
        }
        Relationships: []
      }
      checklists_instalacao: {
        Row: {
          adesivo_inversor: boolean | null
          assinatura_cliente_url: string | null
          assinatura_instalador_url: string | null
          avaliacao_atendimento: string | null
          bairro: string | null
          configuracao_wifi: boolean | null
          created_at: string
          data_instalacao: string
          endereco: string
          foto_servico: boolean | null
          fotos_urls: string[] | null
          id: string
          instalador_id: string
          inversor_local_aprovado: boolean | null
          lead_code: string | null
          nome_cliente: string
          observacoes: string | null
          placas_local_aprovado: boolean | null
          plaquinha_relogio: boolean | null
          synced: boolean | null
          updated_at: string
        }
        Insert: {
          adesivo_inversor?: boolean | null
          assinatura_cliente_url?: string | null
          assinatura_instalador_url?: string | null
          avaliacao_atendimento?: string | null
          bairro?: string | null
          configuracao_wifi?: boolean | null
          created_at?: string
          data_instalacao: string
          endereco: string
          foto_servico?: boolean | null
          fotos_urls?: string[] | null
          id?: string
          instalador_id: string
          inversor_local_aprovado?: boolean | null
          lead_code?: string | null
          nome_cliente: string
          observacoes?: string | null
          placas_local_aprovado?: boolean | null
          plaquinha_relogio?: boolean | null
          synced?: boolean | null
          updated_at?: string
        }
        Update: {
          adesivo_inversor?: boolean | null
          assinatura_cliente_url?: string | null
          assinatura_instalador_url?: string | null
          avaliacao_atendimento?: string | null
          bairro?: string | null
          configuracao_wifi?: boolean | null
          created_at?: string
          data_instalacao?: string
          endereco?: string
          foto_servico?: boolean | null
          fotos_urls?: string[] | null
          id?: string
          instalador_id?: string
          inversor_local_aprovado?: boolean | null
          lead_code?: string | null
          nome_cliente?: string
          observacoes?: string | null
          placas_local_aprovado?: boolean | null
          plaquinha_relogio?: boolean | null
          synced?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf_cnpj: string | null
          created_at: string
          data_instalacao: string | null
          data_nascimento: string | null
          email: string | null
          estado: string | null
          id: string
          lead_id: string | null
          modelo_inversor: string | null
          nome: string
          numero: string | null
          numero_placas: number | null
          observacoes: string | null
          potencia_kwp: number | null
          rua: string | null
          telefone: string
          updated_at: string
          valor_projeto: number | null
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_instalacao?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          lead_id?: string | null
          modelo_inversor?: string | null
          nome: string
          numero?: string | null
          numero_placas?: number | null
          observacoes?: string | null
          potencia_kwp?: number | null
          rua?: string | null
          telefone: string
          updated_at?: string
          valor_projeto?: number | null
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_instalacao?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          lead_id?: string | null
          modelo_inversor?: string | null
          nome?: string
          numero?: string | null
          numero_placas?: number | null
          observacoes?: string | null
          potencia_kwp?: number | null
          rua?: string | null
          telefone?: string
          updated_at?: string
          valor_projeto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      financiamento_api_config: {
        Row: {
          api_key: string | null
          ativo: boolean
          created_at: string
          id: string
          nome: string
          ultima_sincronizacao: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          api_key?: string | null
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          ultima_sincronizacao?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          api_key?: string | null
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          ultima_sincronizacao?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      financiamento_bancos: {
        Row: {
          api_customizada_url: string | null
          ativo: boolean
          codigo_bcb: string | null
          created_at: string
          fonte_sync: string | null
          id: string
          max_parcelas: number
          nome: string
          ordem: number
          taxa_mensal: number
          ultima_sync: string | null
          updated_at: string
        }
        Insert: {
          api_customizada_url?: string | null
          ativo?: boolean
          codigo_bcb?: string | null
          created_at?: string
          fonte_sync?: string | null
          id?: string
          max_parcelas?: number
          nome: string
          ordem?: number
          taxa_mensal: number
          ultima_sync?: string | null
          updated_at?: string
        }
        Update: {
          api_customizada_url?: string | null
          ativo?: boolean
          codigo_bcb?: string | null
          created_at?: string
          fonte_sync?: string | null
          id?: string
          max_parcelas?: number
          nome?: string
          ordem?: number
          taxa_mensal?: number
          ultima_sync?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lead_status: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          cor?: string
          created_at?: string
          id?: string
          nome: string
          ordem: number
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          area: string
          arquivos_urls: string[] | null
          bairro: string | null
          cep: string | null
          cidade: string
          complemento: string | null
          consumo_previsto: number
          created_at: string
          data_proxima_acao: string | null
          estado: string
          id: string
          lead_code: string | null
          media_consumo: number
          nome: string
          numero: string | null
          observacoes: string | null
          proxima_acao: string | null
          rede_atendimento: string
          rua: string | null
          status_id: string | null
          telefone: string
          tipo_telhado: string
          ultimo_contato: string | null
          updated_at: string
          vendedor: string | null
          visto: boolean
        }
        Insert: {
          area: string
          arquivos_urls?: string[] | null
          bairro?: string | null
          cep?: string | null
          cidade: string
          complemento?: string | null
          consumo_previsto: number
          created_at?: string
          data_proxima_acao?: string | null
          estado: string
          id?: string
          lead_code?: string | null
          media_consumo: number
          nome: string
          numero?: string | null
          observacoes?: string | null
          proxima_acao?: string | null
          rede_atendimento: string
          rua?: string | null
          status_id?: string | null
          telefone: string
          tipo_telhado: string
          ultimo_contato?: string | null
          updated_at?: string
          vendedor?: string | null
          visto?: boolean
        }
        Update: {
          area?: string
          arquivos_urls?: string[] | null
          bairro?: string | null
          cep?: string | null
          cidade?: string
          complemento?: string | null
          consumo_previsto?: number
          created_at?: string
          data_proxima_acao?: string | null
          estado?: string
          id?: string
          lead_code?: string | null
          media_consumo?: number
          nome?: string
          numero?: string | null
          observacoes?: string | null
          proxima_acao?: string | null
          rede_atendimento?: string
          rua?: string | null
          status_id?: string | null
          telefone?: string
          tipo_telhado?: string
          ultimo_contato?: string | null
          updated_at?: string
          vendedor?: string | null
          visto?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "leads_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "lead_status"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          comprovante_url: string | null
          created_at: string
          data_pagamento: string
          forma_pagamento: string
          id: string
          observacoes: string | null
          recebimento_id: string
          valor_pago: number
        }
        Insert: {
          comprovante_url?: string | null
          created_at?: string
          data_pagamento?: string
          forma_pagamento: string
          id?: string
          observacoes?: string | null
          recebimento_id: string
          valor_pago: number
        }
        Update: {
          comprovante_url?: string | null
          created_at?: string
          data_pagamento?: string
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          recebimento_id?: string
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_recebimento_id_fkey"
            columns: ["recebimento_id"]
            isOneToOne: false
            referencedRelation: "recebimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      recebimentos: {
        Row: {
          cliente_id: string
          created_at: string
          data_acordo: string
          descricao: string | null
          forma_pagamento_acordada: string
          id: string
          numero_parcelas: number
          status: string
          updated_at: string
          valor_total: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_acordo?: string
          descricao?: string | null
          forma_pagamento_acordada: string
          id?: string
          numero_parcelas?: number
          status?: string
          updated_at?: string
          valor_total: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_acordo?: string
          descricao?: string | null
          forma_pagamento_acordada?: string
          id?: string
          numero_parcelas?: number
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "recebimentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      vendedores: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          telefone: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_config: {
        Row: {
          ativo: boolean
          created_at: string
          eventos: string[]
          id: string
          nome: string
          updated_at: string
          url: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          eventos?: string[]
          id?: string
          nome: string
          updated_at?: string
          url: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          eventos?: string[]
          id?: string
          nome?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      unaccent: { Args: { "": string }; Returns: string }
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
