import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface LeadData {
  id?: string;
  nome: string;
  telefone: string;
  cep?: string | null;
  estado: string;
  cidade: string;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  complemento?: string | null;
  area: string;
  tipo_telhado: string;
  rede_atendimento: string;
  media_consumo: number;
  consumo_previsto: number;
  observacoes?: string | null;
  arquivos_urls?: string[];
  vendedor?: string | null;
  synced?: boolean;
}

interface SyncResult {
  total: number;
  synced: number;
  failed: number;
}

const STORAGE_KEY = "offline_leads";

export function useOfflineLeadSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const countPending = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const leads: LeadData[] = stored ? JSON.parse(stored) : [];
      const count = leads.filter((l) => !l.synced).length;
      setPendingCount(count);
      return count;
    } catch {
      setPendingCount(0);
      return 0;
    }
  }, []);

  const syncLead = async (lead: LeadData): Promise<boolean> => {
    try {
      const { error } = await supabase.from("leads").insert({
        nome: lead.nome,
        telefone: lead.telefone,
        cep: lead.cep || null,
        estado: lead.estado,
        cidade: lead.cidade,
        rua: lead.rua || null,
        numero: lead.numero || null,
        bairro: lead.bairro || null,
        complemento: lead.complemento || null,
        area: lead.area,
        tipo_telhado: lead.tipo_telhado,
        rede_atendimento: lead.rede_atendimento,
        media_consumo: lead.media_consumo,
        consumo_previsto: lead.consumo_previsto,
        observacoes: lead.observacoes || null,
        arquivos_urls: lead.arquivos_urls || [],
        vendedor: lead.vendedor || null,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error syncing lead:", error);
      return false;
    }
  };

  const syncPendingLeads = useCallback(async (showToast = true): Promise<SyncResult> => {
    const result: SyncResult = { total: 0, synced: 0, failed: 0 };
    
    if (!navigator.onLine || isSyncing) {
      if (showToast && !navigator.onLine) {
        toast({
          title: "Sem conexão",
          description: "Aguarde a conexão ser restabelecida para sincronizar.",
          variant: "destructive",
        });
      }
      return result;
    }

    try {
      setIsSyncing(true);
      
      if (showToast) {
        toast({
          title: "Sincronizando...",
          description: "Enviando leads pendentes.",
        });
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setIsSyncing(false);
        return result;
      }

      const leads: LeadData[] = JSON.parse(stored);
      const pending = leads.filter((l) => !l.synced);
      result.total = pending.length;

      if (pending.length === 0) {
        if (showToast) {
          toast({
            title: "Tudo sincronizado! ✓",
            description: "Não há leads pendentes.",
          });
        }
        setIsSyncing(false);
        return result;
      }

      for (const lead of pending) {
        const success = await syncLead(lead);
        if (success) {
          const index = leads.findIndex((l) => l.id === lead.id);
          if (index >= 0) {
            leads[index].synced = true;
            result.synced++;
          }
        } else {
          result.failed++;
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
      countPending();
      setLastSyncResult(result);

      if (showToast) {
        if (result.failed === 0 && result.synced > 0) {
          toast({
            title: "Sincronização concluída! ✓",
            description: `${result.synced} lead${result.synced > 1 ? 's' : ''} enviado${result.synced > 1 ? 's' : ''} com sucesso.`,
          });
        } else if (result.synced > 0 && result.failed > 0) {
          toast({
            title: "Sincronização parcial",
            description: `${result.synced} enviado${result.synced > 1 ? 's' : ''}, ${result.failed} falhou${result.failed > 1 ? 'ram' : ''}. Tente novamente.`,
            variant: "destructive",
          });
        } else if (result.failed > 0) {
          toast({
            title: "Falha na sincronização",
            description: `${result.failed} lead${result.failed > 1 ? 's' : ''} não pôde${result.failed > 1 ? 'ram' : ''} ser enviado${result.failed > 1 ? 's' : ''}. Tente novamente.`,
            variant: "destructive",
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Error syncing:", error);
      if (showToast) {
        toast({
          title: "Erro na sincronização",
          description: "Ocorreu um erro. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, countPending]);

  const saveLocally = (lead: LeadData): string => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const leads: LeadData[] = stored ? JSON.parse(stored) : [];
      
      const localId = `local_${Date.now()}`;
      const newLead = { ...lead, id: localId, synced: false };
      leads.push(newLead);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
      countPending();
      
      return localId;
    } catch (error) {
      console.error("Error saving locally:", error);
      throw new Error("Falha ao salvar localmente");
    }
  };

  const saveLead = async (lead: Omit<LeadData, "id" | "synced">): Promise<{ success: boolean; offline: boolean }> => {
    if (navigator.onLine) {
      try {
        const success = await syncLead({ ...lead, synced: true });
        if (success) {
          return { success: true, offline: false };
        }
      } catch (error) {
        console.error("Online save failed, saving offline:", error);
      }
    }

    try {
      saveLocally({ ...lead, synced: false });
      return { success: true, offline: true };
    } catch {
      return { success: false, offline: true };
    }
  };

  // Auto sync when connection is restored
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      syncTimeoutRef.current = setTimeout(() => {
        const pending = countPending();
        if (pending > 0) {
          toast({
            title: "Conexão restabelecida! 📶",
            description: `${pending} lead${pending > 1 ? 's' : ''} pendente${pending > 1 ? 's' : ''}. Sincronizando automaticamente...`,
          });
          
          syncPendingLeads(true);
        }
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      toast({
        title: "Você está offline 📴",
        description: "Os leads serão salvos localmente e sincronizados quando a conexão voltar.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Count pending on mount
    countPending();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [countPending, syncPendingLeads]);

  const retrySync = useCallback(() => {
    return syncPendingLeads(true);
  }, [syncPendingLeads]);

  const clearSyncedLeads = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      
      const leads: LeadData[] = JSON.parse(stored);
      const pendingOnly = leads.filter((l) => !l.synced);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingOnly));
    } catch (error) {
      console.error("Error clearing synced leads:", error);
    }
  }, []);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncResult,
    saveLead,
    syncPendingLeads,
    retrySync,
    clearSyncedLeads,
  };
}
