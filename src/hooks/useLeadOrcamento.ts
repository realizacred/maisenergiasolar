import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { ExistingLeadMatch } from "@/types/orcamento";

interface LeadData {
  nome: string;
  telefone: string;
}

interface OrcamentoData {
  cep?: string | null;
  estado: string;
  cidade: string;
  bairro?: string | null;
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  area: string;
  tipo_telhado: string;
  rede_atendimento: string;
  media_consumo: number;
  consumo_previsto: number;
  observacoes?: string | null;
  arquivos_urls?: string[];
  vendedor?: string | null;
}

interface SubmitResult {
  success: boolean;
  leadId?: string;
  orcamentoId?: string;
  isNewLead: boolean;
  error?: string;
}

/**
 * Hook para gerenciar a criação de leads e orçamentos com detecção de duplicatas
 */
export function useLeadOrcamento() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingLead, setExistingLead] = useState<ExistingLeadMatch | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  /**
   * Normaliza o telefone removendo caracteres não numéricos
   */
  const normalizePhone = (phone: string): string => {
    return phone.replace(/\D/g, "");
  };

  /**
   * Verifica se já existe um lead com o mesmo telefone
   */
  const checkExistingLead = useCallback(async (telefone: string): Promise<ExistingLeadMatch | null> => {
    const normalized = normalizePhone(telefone);
    if (normalized.length < 10) return null;

    try {
      // Search for existing lead with matching phone
      const { data: leads, error } = await supabase
        .from("leads")
        .select("id, lead_code, nome, telefone, telefone_normalized, created_at, updated_at")
        .eq("telefone_normalized", normalized)
        .limit(1);

      if (error) {
        console.error("[checkExistingLead] Error:", error);
        return null;
      }

      if (leads && leads.length > 0) {
        const lead = leads[0];
        
        // Count existing orcamentos for this lead
        const { count } = await supabase
          .from("orcamentos")
          .select("*", { count: "exact", head: true })
          .eq("lead_id", lead.id);

        return {
          lead: lead as ExistingLeadMatch["lead"],
          orcamentos_count: count || 0,
        };
      }

      return null;
    } catch (error) {
      console.error("[checkExistingLead] Exception:", error);
      return null;
    }
  }, []);

  /**
   * Cria um novo lead
   */
  const createLead = async (data: LeadData): Promise<{ success: boolean; leadId?: string; error?: string }> => {
    try {
      // Note: We still insert with the original required fields
      // The database may require certain fields even though we're moving them to orcamentos
      // We'll insert minimal data that satisfies NOT NULL constraints
      const { data: newLead, error } = await supabase
        .from("leads")
        .insert({
          nome: data.nome,
          telefone: data.telefone,
          // Minimal required fields with defaults
          estado: "N/A",
          cidade: "N/A",
          area: "N/A",
          tipo_telhado: "N/A",
          rede_atendimento: "N/A",
          media_consumo: 0,
          consumo_previsto: 0,
        })
        .select("id")
        .single();

      if (error) {
        console.error("[createLead] Error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, leadId: newLead.id };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      return { success: false, error: msg };
    }
  };

  /**
   * Cria um novo orçamento vinculado a um lead
   */
  const createOrcamento = async (leadId: string, data: OrcamentoData): Promise<{ success: boolean; orcamentoId?: string; error?: string }> => {
    try {
      const { data: newOrcamento, error } = await supabase
        .from("orcamentos")
        .insert({
          lead_id: leadId,
          cep: data.cep || null,
          estado: data.estado,
          cidade: data.cidade,
          bairro: data.bairro || null,
          rua: data.rua || null,
          numero: data.numero || null,
          complemento: data.complemento || null,
          area: data.area,
          tipo_telhado: data.tipo_telhado,
          rede_atendimento: data.rede_atendimento,
          media_consumo: data.media_consumo,
          consumo_previsto: data.consumo_previsto,
          observacoes: data.observacoes || null,
          arquivos_urls: data.arquivos_urls || [],
          vendedor: data.vendedor || null,
        })
        .select("id, orc_code")
        .single();

      if (error) {
        console.error("[createOrcamento] Error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, orcamentoId: newOrcamento.id };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      return { success: false, error: msg };
    }
  };

  /**
   * Submete um novo orçamento, verificando duplicatas
   * Se encontrar lead existente, mostra aviso. Senão, cria novo lead + orçamento.
   */
  const submitOrcamento = async (
    leadData: LeadData,
    orcamentoData: OrcamentoData,
    options?: { forceNew?: boolean; useExistingLeadId?: string }
  ): Promise<SubmitResult> => {
    setIsSubmitting(true);

    try {
      let leadId: string;
      let isNewLead = true;

      // Check for existing lead if not forcing new
      if (!options?.forceNew && !options?.useExistingLeadId) {
        const existing = await checkExistingLead(leadData.telefone);
        
        if (existing) {
          // Found existing lead - show warning and pause
          setExistingLead(existing);
          setShowDuplicateWarning(true);
          setIsSubmitting(false);
          return {
            success: false,
            isNewLead: false,
            error: "DUPLICATE_DETECTED",
          };
        }
      }

      // Use existing lead or create new one
      if (options?.useExistingLeadId) {
        leadId = options.useExistingLeadId;
        isNewLead = false;
      } else {
        const leadResult = await createLead(leadData);
        if (!leadResult.success || !leadResult.leadId) {
          return { success: false, isNewLead: true, error: leadResult.error };
        }
        leadId = leadResult.leadId;
      }

      // Create the orcamento
      const orcamentoResult = await createOrcamento(leadId, orcamentoData);
      if (!orcamentoResult.success) {
        return { success: false, leadId, isNewLead, error: orcamentoResult.error };
      }

      return {
        success: true,
        leadId,
        orcamentoId: orcamentoResult.orcamentoId,
        isNewLead,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      return { success: false, isNewLead: true, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Confirma o uso do lead existente e cria novo orçamento
   */
  const confirmUseExistingLead = async (orcamentoData: OrcamentoData): Promise<SubmitResult> => {
    if (!existingLead) {
      return { success: false, isNewLead: false, error: "Nenhum lead existente selecionado" };
    }

    setShowDuplicateWarning(false);
    
    return submitOrcamento(
      { nome: existingLead.lead.nome, telefone: existingLead.lead.telefone },
      orcamentoData,
      { useExistingLeadId: existingLead.lead.id }
    );
  };

  /**
   * Força a criação de um novo lead mesmo com duplicata
   */
  const forceCreateNewLead = async (
    leadData: LeadData,
    orcamentoData: OrcamentoData
  ): Promise<SubmitResult> => {
    setShowDuplicateWarning(false);
    setExistingLead(null);
    
    return submitOrcamento(leadData, orcamentoData, { forceNew: true });
  };

  /**
   * Cancela o aviso de duplicata
   */
  const cancelDuplicateWarning = () => {
    setShowDuplicateWarning(false);
    setExistingLead(null);
  };

  return {
    isSubmitting,
    existingLead,
    showDuplicateWarning,
    checkExistingLead,
    submitOrcamento,
    confirmUseExistingLead,
    forceCreateNewLead,
    cancelDuplicateWarning,
  };
}
