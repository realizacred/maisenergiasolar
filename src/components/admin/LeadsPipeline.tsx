import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2, Phone, MapPin, Zap, GripVertical, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadStatus {
  id: string;
  nome: string;
  ordem: number;
  cor: string;
}

interface Lead {
  id: string;
  lead_code: string | null;
  nome: string;
  telefone: string;
  cidade: string;
  estado: string;
  media_consumo: number;
  vendedor: string | null;
  status_id: string | null;
  created_at: string;
}

export default function LeadsPipeline() {
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, leadsRes] = await Promise.all([
        supabase.from("lead_status").select("*").order("ordem"),
        supabase.from("leads").select("id, lead_code, nome, telefone, cidade, estado, media_consumo, vendedor, status_id, created_at").order("created_at", { ascending: false }),
      ]);

      if (statusRes.error) throw statusRes.error;
      if (leadsRes.error) throw leadsRes.error;

      setStatuses(statusRes.data || []);
      setLeads(leadsRes.data || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o pipeline.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    if (!draggedLead || draggedLead.status_id === statusId) {
      setDraggedLead(null);
      return;
    }

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === draggedLead.id ? { ...l, status_id: statusId } : l))
    );

    try {
      const { error } = await supabase
        .from("leads")
        .update({ status_id: statusId })
        .eq("id", draggedLead.id);

      if (error) throw error;

      toast({
        title: "Lead movido!",
        description: `${draggedLead.nome} foi movido para a nova etapa.`,
      });
    } catch (error) {
      console.error("Erro ao mover lead:", error);
      // Revert on error
      setLeads((prev) =>
        prev.map((l) =>
          l.id === draggedLead.id ? { ...l, status_id: draggedLead.status_id } : l
        )
      );
      toast({
        title: "Erro",
        description: "Não foi possível mover o lead.",
        variant: "destructive",
      });
    } finally {
      setDraggedLead(null);
    }
  };

  const getLeadsByStatus = (statusId: string | null) => {
    if (statusId === null) {
      return leads.filter((l) => !l.status_id);
    }
    return leads.filter((l) => l.status_id === statusId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-brand-blue">Pipeline de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4" style={{ minWidth: "max-content" }}>
            {/* Sem Status */}
            <div
              className="w-72 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "")}
            >
              <div
                className="rounded-t-lg px-4 py-2 font-semibold text-sm flex items-center justify-between"
                style={{ backgroundColor: "#9ca3af", color: "white" }}
              >
                <span>Sem Status</span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {getLeadsByStatus(null).length}
                </Badge>
              </div>
              <div className="bg-muted/50 rounded-b-lg p-2 min-h-[400px] space-y-2">
                {getLeadsByStatus(null).map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onDragStart={handleDragStart}
                    isDragging={draggedLead?.id === lead.id}
                  />
                ))}
              </div>
            </div>

            {/* Status Columns */}
            {statuses.map((status) => (
              <div
                key={status.id}
                className="w-72 flex-shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status.id)}
              >
                <div
                  className="rounded-t-lg px-4 py-2 font-semibold text-sm flex items-center justify-between"
                  style={{ backgroundColor: status.cor, color: "white" }}
                >
                  <span>{status.nome}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {getLeadsByStatus(status.id).length}
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-b-lg p-2 min-h-[400px] space-y-2">
                  {getLeadsByStatus(status.id).map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onDragStart={handleDragStart}
                      isDragging={draggedLead?.id === lead.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function LeadCard({
  lead,
  onDragStart,
  isDragging,
}: {
  lead: Lead;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  isDragging: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      className={`bg-white rounded-lg p-3 shadow-sm border cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 scale-95" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{lead.nome}</p>
          {lead.lead_code && (
            <Badge variant="outline" className="font-mono text-xs mt-1">
              {lead.lead_code}
            </Badge>
          )}
        </div>
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          <span className="truncate">{lead.telefone}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{lead.cidade}, {lead.estado}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>{lead.media_consumo} kWh</span>
        </div>
        {lead.vendedor && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate">{lead.vendedor}</span>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
        {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
      </div>
    </div>
  );
}
