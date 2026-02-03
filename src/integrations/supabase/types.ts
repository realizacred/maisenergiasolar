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
      audit_logs: {
        Row: {
          acao: string
          created_at: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          ip_address: string | null
          registro_id: string | null
          tabela: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: string | null
          registro_id?: string | null
          tabela: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: string | null
          registro_id?: string | null
          tabela?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      checklist_cliente_arquivos: {
        Row: {
          categoria: string
          checklist_id: string
          created_at: string
          id: string
          nome_arquivo: string
          resposta_id: string | null
          tamanho_bytes: number | null
          tipo_mime: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          categoria: string
          checklist_id: string
          created_at?: string
          id?: string
          nome_arquivo: string
          resposta_id?: string | null
          tamanho_bytes?: number | null
          tipo_mime?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          categoria?: string
          checklist_id?: string
          created_at?: string
          id?: string
          nome_arquivo?: string
          resposta_id?: string | null
          tamanho_bytes?: number | null
          tipo_mime?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_cliente_arquivos_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_cliente_arquivos_resposta_id_fkey"
            columns: ["resposta_id"]
            isOneToOne: false
            referencedRelation: "checklist_cliente_respostas"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_cliente_respostas: {
        Row: {
          campo_custom: string | null
          checklist_id: string
          created_at: string
          etapa: string | null
          id: string
          template_item_id: string | null
          updated_at: string
          valor: string | null
          valor_boolean: boolean | null
          valor_numerico: number | null
        }
        Insert: {
          campo_custom?: string | null
          checklist_id: string
          created_at?: string
          etapa?: string | null
          id?: string
          template_item_id?: string | null
          updated_at?: string
          valor?: string | null
          valor_boolean?: boolean | null
          valor_numerico?: number | null
        }
        Update: {
          campo_custom?: string | null
          checklist_id?: string
          created_at?: string
          etapa?: string | null
          id?: string
          template_item_id?: string | null
          updated_at?: string
          valor?: string | null
          valor_boolean?: boolean | null
          valor_numerico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_cliente_respostas_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_cliente_respostas_template_item_id_fkey"
            columns: ["template_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_template_items"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_instalador_arquivos: {
        Row: {
          categoria: string
          checklist_id: string
          created_at: string
          fase: Database["public"]["Enums"]["checklist_instalador_fase"] | null
          id: string
          nome_arquivo: string
          obrigatorio: boolean | null
          resposta_id: string | null
          tamanho_bytes: number | null
          tipo_mime: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          categoria: string
          checklist_id: string
          created_at?: string
          fase?: Database["public"]["Enums"]["checklist_instalador_fase"] | null
          id?: string
          nome_arquivo: string
          obrigatorio?: boolean | null
          resposta_id?: string | null
          tamanho_bytes?: number | null
          tipo_mime?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          categoria?: string
          checklist_id?: string
          created_at?: string
          fase?: Database["public"]["Enums"]["checklist_instalador_fase"] | null
          id?: string
          nome_arquivo?: string
          obrigatorio?: boolean | null
          resposta_id?: string | null
          tamanho_bytes?: number | null
          tipo_mime?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_instalador_arquivos_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists_instalador"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_instalador_arquivos_resposta_id_fkey"
            columns: ["resposta_id"]
            isOneToOne: false
            referencedRelation: "checklist_instalador_respostas"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_instalador_respostas: {
        Row: {
          campo: string
          checklist_id: string
          conforme: boolean | null
          created_at: string
          fase: Database["public"]["Enums"]["checklist_instalador_fase"]
          id: string
          observacao: string | null
          respondido_por: string | null
          template_item_id: string | null
          updated_at: string
          valor: string | null
          valor_boolean: boolean | null
        }
        Insert: {
          campo: string
          checklist_id: string
          conforme?: boolean | null
          created_at?: string
          fase: Database["public"]["Enums"]["checklist_instalador_fase"]
          id?: string
          observacao?: string | null
          respondido_por?: string | null
          template_item_id?: string | null
          updated_at?: string
          valor?: string | null
          valor_boolean?: boolean | null
        }
        Update: {
          campo?: string
          checklist_id?: string
          conforme?: boolean | null
          created_at?: string
          fase?: Database["public"]["Enums"]["checklist_instalador_fase"]
          id?: string
          observacao?: string | null
          respondido_por?: string | null
          template_item_id?: string | null
          updated_at?: string
          valor?: string | null
          valor_boolean?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_instalador_respostas_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists_instalador"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_instalador_respostas_template_item_id_fkey"
            columns: ["template_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_template_items"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_template_items: {
        Row: {
          campo: string
          created_at: string
          etapa: string
          id: string
          obrigatorio: boolean | null
          opcoes: Json | null
          ordem: number | null
          template_id: string
          tipo_campo: string
        }
        Insert: {
          campo: string
          created_at?: string
          etapa: string
          id?: string
          obrigatorio?: boolean | null
          opcoes?: Json | null
          ordem?: number | null
          template_id: string
          tipo_campo: string
        }
        Update: {
          campo?: string
          created_at?: string
          etapa?: string
          id?: string
          obrigatorio?: boolean | null
          opcoes?: Json | null
          ordem?: number | null
          template_id?: string
          tipo_campo?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      checklists_cliente: {
        Row: {
          cliente_id: string | null
          created_at: string
          created_by: string | null
          data_envio: string | null
          data_revisao: string | null
          id: string
          lead_id: string | null
          motivo_reprovacao: string | null
          observacoes_cliente: string | null
          observacoes_internas: string | null
          projeto_id: string | null
          revisor_id: string | null
          status: Database["public"]["Enums"]["checklist_cliente_status"]
          template_id: string | null
          updated_at: string
          vendedor_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_envio?: string | null
          data_revisao?: string | null
          id?: string
          lead_id?: string | null
          motivo_reprovacao?: string | null
          observacoes_cliente?: string | null
          observacoes_internas?: string | null
          projeto_id?: string | null
          revisor_id?: string | null
          status?: Database["public"]["Enums"]["checklist_cliente_status"]
          template_id?: string | null
          updated_at?: string
          vendedor_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_envio?: string | null
          data_revisao?: string | null
          id?: string
          lead_id?: string | null
          motivo_reprovacao?: string | null
          observacoes_cliente?: string | null
          observacoes_internas?: string | null
          projeto_id?: string | null
          revisor_id?: string | null
          status?: Database["public"]["Enums"]["checklist_cliente_status"]
          template_id?: string | null
          updated_at?: string
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklists_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_cliente_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_cliente_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_cliente_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
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
      checklists_instalador: {
        Row: {
          assinatura_cliente_url: string | null
          assinatura_instalador_url: string | null
          bairro: string | null
          cidade: string | null
          cliente_id: string | null
          created_at: string
          created_by: string | null
          data_agendada: string | null
          data_fim: string | null
          data_inicio: string | null
          endereco: string | null
          fase_atual:
            | Database["public"]["Enums"]["checklist_instalador_fase"]
            | null
          id: string
          instalador_id: string
          observacoes: string | null
          pendencias: string | null
          projeto_id: string
          status: Database["public"]["Enums"]["checklist_instalador_status"]
          supervisor_id: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          assinatura_cliente_url?: string | null
          assinatura_instalador_url?: string | null
          bairro?: string | null
          cidade?: string | null
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          endereco?: string | null
          fase_atual?:
            | Database["public"]["Enums"]["checklist_instalador_fase"]
            | null
          id?: string
          instalador_id: string
          observacoes?: string | null
          pendencias?: string | null
          projeto_id: string
          status?: Database["public"]["Enums"]["checklist_instalador_status"]
          supervisor_id?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          assinatura_cliente_url?: string | null
          assinatura_instalador_url?: string | null
          bairro?: string | null
          cidade?: string | null
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          endereco?: string | null
          fase_atual?:
            | Database["public"]["Enums"]["checklist_instalador_fase"]
            | null
          id?: string
          instalador_id?: string
          observacoes?: string | null
          pendencias?: string | null
          projeto_id?: string
          status?: Database["public"]["Enums"]["checklist_instalador_status"]
          supervisor_id?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_instalador_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_instalador_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_instalador_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
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
      instagram_config: {
        Row: {
          access_token: string | null
          ativo: boolean
          created_at: string
          id: string
          ultima_sincronizacao: string | null
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          access_token?: string | null
          ativo?: boolean
          created_at?: string
          id?: string
          ultima_sincronizacao?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          access_token?: string | null
          ativo?: boolean
          created_at?: string
          id?: string
          ultima_sincronizacao?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      instagram_posts: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          instagram_id: string
          media_type: string | null
          media_url: string
          permalink: string | null
          thumbnail_url: string | null
          timestamp: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          instagram_id: string
          media_type?: string | null
          media_url: string
          permalink?: string | null
          thumbnail_url?: string | null
          timestamp?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          instagram_id?: string
          media_type?: string | null
          media_url?: string
          permalink?: string | null
          thumbnail_url?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      lead_atividades: {
        Row: {
          concluido: boolean | null
          created_at: string
          created_by: string | null
          data_agendada: string | null
          descricao: string
          id: string
          lead_id: string
          metadata: Json | null
          tipo: Database["public"]["Enums"]["atividade_tipo"]
        }
        Insert: {
          concluido?: boolean | null
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          descricao: string
          id?: string
          lead_id: string
          metadata?: Json | null
          tipo: Database["public"]["Enums"]["atividade_tipo"]
        }
        Update: {
          concluido?: boolean | null
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          descricao?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
          tipo?: Database["public"]["Enums"]["atividade_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "lead_atividades_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          created_at: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projetos: {
        Row: {
          cliente_id: string | null
          codigo: string | null
          created_at: string
          created_by: string | null
          data_comissionamento: string | null
          data_instalacao: string | null
          data_previsao_instalacao: string | null
          data_venda: string | null
          id: string
          instalador_id: string | null
          lead_id: string | null
          modelo_inversor: string | null
          modelo_modulos: string | null
          numero_modulos: number | null
          observacoes: string | null
          potencia_kwp: number | null
          status: Database["public"]["Enums"]["projeto_status"]
          tipo_instalacao: string | null
          updated_at: string
          valor_equipamentos: number | null
          valor_mao_obra: number | null
          valor_total: number | null
          vendedor_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          codigo?: string | null
          created_at?: string
          created_by?: string | null
          data_comissionamento?: string | null
          data_instalacao?: string | null
          data_previsao_instalacao?: string | null
          data_venda?: string | null
          id?: string
          instalador_id?: string | null
          lead_id?: string | null
          modelo_inversor?: string | null
          modelo_modulos?: string | null
          numero_modulos?: number | null
          observacoes?: string | null
          potencia_kwp?: number | null
          status?: Database["public"]["Enums"]["projeto_status"]
          tipo_instalacao?: string | null
          updated_at?: string
          valor_equipamentos?: number | null
          valor_mao_obra?: number | null
          valor_total?: number | null
          vendedor_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          codigo?: string | null
          created_at?: string
          created_by?: string | null
          data_comissionamento?: string | null
          data_instalacao?: string | null
          data_previsao_instalacao?: string | null
          data_venda?: string | null
          id?: string
          instalador_id?: string | null
          lead_id?: string | null
          modelo_inversor?: string | null
          modelo_modulos?: string | null
          numero_modulos?: number | null
          observacoes?: string | null
          potencia_kwp?: number | null
          status?: Database["public"]["Enums"]["projeto_status"]
          tipo_instalacao?: string | null
          updated_at?: string
          valor_equipamentos?: number | null
          valor_mao_obra?: number | null
          valor_total?: number | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
      simulacoes: {
        Row: {
          cidade: string | null
          co2_evitado_kg: number | null
          concessionaria: string | null
          consumo_kwh: number | null
          created_at: string
          economia_anual: number | null
          economia_mensal: number | null
          estado: string | null
          geracao_mensal_estimada: number | null
          id: string
          investimento_estimado: number | null
          irradiacao_usada: number | null
          lead_id: string | null
          payback_meses: number | null
          potencia_recomendada_kwp: number | null
          tarifa_kwh_usada: number | null
          tipo_conta: string | null
          tipo_telhado: string | null
          valor_conta: number | null
        }
        Insert: {
          cidade?: string | null
          co2_evitado_kg?: number | null
          concessionaria?: string | null
          consumo_kwh?: number | null
          created_at?: string
          economia_anual?: number | null
          economia_mensal?: number | null
          estado?: string | null
          geracao_mensal_estimada?: number | null
          id?: string
          investimento_estimado?: number | null
          irradiacao_usada?: number | null
          lead_id?: string | null
          payback_meses?: number | null
          potencia_recomendada_kwp?: number | null
          tarifa_kwh_usada?: number | null
          tipo_conta?: string | null
          tipo_telhado?: string | null
          valor_conta?: number | null
        }
        Update: {
          cidade?: string | null
          co2_evitado_kg?: number | null
          concessionaria?: string | null
          consumo_kwh?: number | null
          created_at?: string
          economia_anual?: number | null
          economia_mensal?: number | null
          estado?: string | null
          geracao_mensal_estimada?: number | null
          id?: string
          investimento_estimado?: number | null
          irradiacao_usada?: number | null
          lead_id?: string | null
          payback_meses?: number | null
          potencia_recomendada_kwp?: number | null
          tarifa_kwh_usada?: number | null
          tipo_conta?: string | null
          tipo_telhado?: string | null
          valor_conta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulacoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      get_vendedor_nome: { Args: { _user_id: string }; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "gerente" | "vendedor" | "instalador" | "financeiro"
      atividade_tipo:
        | "ligacao"
        | "whatsapp"
        | "email"
        | "reuniao"
        | "visita"
        | "proposta"
        | "negociacao"
        | "anotacao"
        | "status_change"
      checklist_cliente_status:
        | "pendente"
        | "em_preenchimento"
        | "enviado"
        | "em_revisao"
        | "aprovado"
        | "reprovado"
      checklist_instalador_fase:
        | "pre_instalacao"
        | "instalacao_estrutura"
        | "instalacao_modulos"
        | "instalacao_eletrica"
        | "comissionamento"
        | "pos_instalacao"
      checklist_instalador_status:
        | "agendado"
        | "em_execucao"
        | "pausado"
        | "pendente_correcao"
        | "finalizado"
        | "cancelado"
      projeto_status:
        | "aguardando_documentacao"
        | "em_analise"
        | "aprovado"
        | "em_instalacao"
        | "instalado"
        | "comissionado"
        | "concluido"
        | "cancelado"
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
      app_role: ["admin", "gerente", "vendedor", "instalador", "financeiro"],
      atividade_tipo: [
        "ligacao",
        "whatsapp",
        "email",
        "reuniao",
        "visita",
        "proposta",
        "negociacao",
        "anotacao",
        "status_change",
      ],
      checklist_cliente_status: [
        "pendente",
        "em_preenchimento",
        "enviado",
        "em_revisao",
        "aprovado",
        "reprovado",
      ],
      checklist_instalador_fase: [
        "pre_instalacao",
        "instalacao_estrutura",
        "instalacao_modulos",
        "instalacao_eletrica",
        "comissionamento",
        "pos_instalacao",
      ],
      checklist_instalador_status: [
        "agendado",
        "em_execucao",
        "pausado",
        "pendente_correcao",
        "finalizado",
        "cancelado",
      ],
      projeto_status: [
        "aguardando_documentacao",
        "em_analise",
        "aprovado",
        "em_instalacao",
        "instalado",
        "comissionado",
        "concluido",
        "cancelado",
      ],
    },
  },
} as const
