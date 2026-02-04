import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  FileWarning, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  User,
  MapPin,
  Phone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lead } from "@/types/lead";

interface PendingDocumentationWidgetProps {
  onLeadClick?: (lead: Lead) => void;
  maxItems?: number;
}

export function PendingDocumentationWidget({ 
  onLeadClick, 
  maxItems = 10 
}: PendingDocumentationWidgetProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingLeads();
  }, []);

  const loadPendingLeads = async () => {
    try {
      // Get "Aguardando Documentação" status
      const { data: statusData } = await supabase
        .from("lead_status")
        .select("id")
        .eq("nome", "Aguardando Documentação")
        .single();

      if (!statusData) {
        setLoading(false);
        return;
      }

      // Get leads with this status
      const { data: leadsData, error } = await supabase
        .from("leads")
        .select("*")
        .eq("status_id", statusData.id)
        .order("updated_at", { ascending: true })
        .limit(maxItems);

      if (error) throw error;
      setLeads(leadsData || []);
    } catch (error) {
      console.error("Error loading pending documentation leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysWaiting = (updatedAt: string) => {
    return differenceInDays(new Date(), new Date(updatedAt));
  };

  const getUrgencyBadge = (days: number) => {
    if (days >= 7) {
      return <Badge variant="destructive" className="text-xs">Crítico ({days}d)</Badge>;
    }
    if (days >= 3) {
      return <Badge variant="default" className="bg-warning text-warning-foreground text-xs">Atenção ({days}d)</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">{days}d</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (leads.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-muted-foreground" />
            Documentação Pendente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum lead aguardando documentação</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-warning" />
            <CardTitle className="text-base">Aguardando Documentação</CardTitle>
            <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">
              {leads.length}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Leads que precisam completar a documentação para conversão
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[350px]">
          <div className="space-y-2">
            {leads.map((lead) => {
              const daysWaiting = getDaysWaiting(lead.updated_at);
              
              return (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onLeadClick?.(lead)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-warning/10 rounded-full p-2">
                      <User className="h-4 w-4 text-warning" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{lead.nome}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {lead.cidade}/{lead.estado}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.telefone}
                        </span>
                      </div>
                      {lead.observacoes && lead.observacoes.includes("[Documentação Pendente:") && (
                        <p className="text-xs text-warning mt-1 truncate">
                          {lead.observacoes.match(/\[Documentação Pendente: ([^\]]+)\]/)?.[1]}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getUrgencyBadge(daysWaiting)}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {leads.length > 0 && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>
              Tempo médio de espera: {Math.round(leads.reduce((acc, lead) => acc + getDaysWaiting(lead.updated_at), 0) / leads.length)} dias
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
