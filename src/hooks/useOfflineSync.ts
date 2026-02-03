import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChecklistData {
  id?: string;
  data_instalacao: string;
  endereco: string;
  bairro?: string;
  lead_code?: string;
  placas_local_aprovado: boolean;
  inversor_local_aprovado: boolean;
  avaliacao_atendimento: string;
  nome_cliente: string;
  assinatura_cliente_url?: string;
  adesivo_inversor: boolean;
  plaquinha_relogio: boolean;
  configuracao_wifi: boolean;
  foto_servico: boolean;
  observacoes?: string;
  fotos_urls: string[];
  assinatura_instalador_url?: string;
  instalador_id: string;
  synced: boolean;
}

const STORAGE_KEY = "offline_checklists";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingChecklists();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Count pending on mount
    countPending();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const countPending = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const checklists: ChecklistData[] = stored ? JSON.parse(stored) : [];
      setPendingCount(checklists.filter((c) => !c.synced).length);
    } catch {
      setPendingCount(0);
    }
  };

  const saveLocally = (checklist: ChecklistData): string => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const checklists: ChecklistData[] = stored ? JSON.parse(stored) : [];
      
      const localId = `local_${Date.now()}`;
      const newChecklist = { ...checklist, id: localId, synced: false };
      checklists.push(newChecklist);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checklists));
      countPending();
      
      return localId;
    } catch (error) {
      console.error("Error saving locally:", error);
      throw new Error("Falha ao salvar localmente");
    }
  };

  const uploadAsset = async (dataUrl: string, path: string): Promise<string> => {
    // Convert base64 to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    const { data, error } = await supabase.storage
      .from("checklist-assets")
      .upload(path, blob, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("checklist-assets")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const syncChecklist = async (checklist: ChecklistData): Promise<boolean> => {
    try {
      const timestamp = Date.now();
      
      // Upload client signature if exists
      let clientSignatureUrl = checklist.assinatura_cliente_url;
      if (clientSignatureUrl?.startsWith("data:")) {
        clientSignatureUrl = await uploadAsset(
          clientSignatureUrl,
          `signatures/cliente_${timestamp}.png`
        );
      }

      // Upload installer signature if exists
      let installerSignatureUrl = checklist.assinatura_instalador_url;
      if (installerSignatureUrl?.startsWith("data:")) {
        installerSignatureUrl = await uploadAsset(
          installerSignatureUrl,
          `signatures/instalador_${timestamp}.png`
        );
      }

      // Upload photos
      const uploadedPhotos: string[] = [];
      for (let i = 0; i < checklist.fotos_urls.length; i++) {
        const photo = checklist.fotos_urls[i];
        if (photo.startsWith("data:")) {
          const url = await uploadAsset(photo, `fotos/${timestamp}_${i}.png`);
          uploadedPhotos.push(url);
        } else {
          uploadedPhotos.push(photo);
        }
      }

      // Insert into database
      const { error } = await supabase.from("checklists_instalacao").insert({
        data_instalacao: checklist.data_instalacao,
        endereco: checklist.endereco,
        bairro: checklist.bairro,
        lead_code: checklist.lead_code,
        placas_local_aprovado: checklist.placas_local_aprovado,
        inversor_local_aprovado: checklist.inversor_local_aprovado,
        avaliacao_atendimento: checklist.avaliacao_atendimento,
        nome_cliente: checklist.nome_cliente,
        assinatura_cliente_url: clientSignatureUrl,
        adesivo_inversor: checklist.adesivo_inversor,
        plaquinha_relogio: checklist.plaquinha_relogio,
        configuracao_wifi: checklist.configuracao_wifi,
        foto_servico: checklist.foto_servico,
        observacoes: checklist.observacoes,
        fotos_urls: uploadedPhotos,
        assinatura_instalador_url: installerSignatureUrl,
        instalador_id: checklist.instalador_id,
        synced: true,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error syncing checklist:", error);
      return false;
    }
  };

  const syncPendingChecklists = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    try {
      setIsSyncing(true);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const checklists: ChecklistData[] = JSON.parse(stored);
      const pending = checklists.filter((c) => !c.synced);

      if (pending.length === 0) return;

      let syncedCount = 0;
      for (const checklist of pending) {
        const success = await syncChecklist(checklist);
        if (success) {
          // Mark as synced
          const index = checklists.findIndex((c) => c.id === checklist.id);
          if (index >= 0) {
            checklists[index].synced = true;
            syncedCount++;
          }
        }
      }

      // Update storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checklists));
      countPending();

      if (syncedCount > 0) {
        toast({
          title: "Sincronização concluída",
          description: `${syncedCount} checklist(s) sincronizado(s) com sucesso!`,
        });
      }
    } catch (error) {
      console.error("Error syncing:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  const saveChecklist = async (checklist: Omit<ChecklistData, "id" | "synced">): Promise<{ success: boolean; offline: boolean }> => {
    if (isOnline) {
      try {
        const success = await syncChecklist({ ...checklist, synced: true });
        if (success) {
          return { success: true, offline: false };
        }
      } catch (error) {
        console.error("Online save failed, saving offline:", error);
      }
    }

    // Save offline
    try {
      saveLocally({ ...checklist, synced: false });
      return { success: true, offline: true };
    } catch {
      return { success: false, offline: true };
    }
  };

  return {
    isOnline,
    pendingCount,
    isSyncing,
    saveChecklist,
    syncPendingChecklists,
  };
}
