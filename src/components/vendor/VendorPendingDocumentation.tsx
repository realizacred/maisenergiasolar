import { useMemo } from "react";
import { differenceInDays } from "date-fns";
import { 
  FileWarning, 
  Clock, 
  ChevronRight,
  User,
  MapPin,
  Phone,
  FileX
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Lead, LeadStatus } from "@/types/lead";

interface VendorPendingDocumentationProps {
  leads: Lead[];
  statuses: LeadStatus[];
  onLeadClick?: (lead: Lead) => void;
  onConvertClick?: (lead: Lead) => void;
}

// Helper to parse missing docs from observacoes
function parseMissingDocs(observacoes: string | null): string[] {
  if (!observacoes) return [];
  const match = observacoes.match(/\[Documentação Pendente: ([^\]]+)\]/);
  if (!match) return [];
  return match[1].split(",").map(s => s.trim()).filter(Boolean);
}

export function VendorPendingDocumentation({ 
  leads, 
  statuses,
  onLeadClick,
  onConvertClick
}: VendorPendingDocumentationProps) {
  const pendingLeads = useMemo(() => {
    // Find status "Aguardando Documentação"
    const pendingStatus = statuses.find(s => s.nome === "Aguardando Documentação");
    if (!pendingStatus) return [];
    
    return leads
      .filter(lead => lead.status_id === pendingStatus.id)
      .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
  }, [leads, statuses]);

  const getDaysWaiting = (updatedAt: string) => {
    return differenceInDays(new Date(), new Date(updatedAt));
  };

  const getUrgencyBadge = (days: number) => {
    if (days >= 7) {
      return <Badge variant="destructive" className="text-xs">Crítico ({days}d)</Badge>;
    }
    if (days >= 3) {
      return <Badge variant="default" className="bg-primary text-primary-foreground text-xs">Atenção ({days}d)</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">{days}d</Badge>;
  };

  const handleClick = (lead: Lead) => {
    // If onConvertClick is provided, open conversion dialog; otherwise just view
    if (onConvertClick) {
      onConvertClick(lead);
    } else if (onLeadClick) {
      onLeadClick(lead);
    }
  };

  if (pendingLeads.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Aguardando Documentação</CardTitle>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {pendingLeads.length}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Clique em um lead para completar a documentação e converter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[350px]">
          <div className="space-y-2">
            {pendingLeads.map((lead) => {
              const daysWaiting = getDaysWaiting(lead.updated_at);
              const missingDocs = parseMissingDocs(lead.observacoes);
              
              return (
                <div
                  key={lead.id}
                  className="flex flex-col p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleClick(lead)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="bg-primary/10 rounded-full p-2">
                        <User className="h-4 w-4 text-primary" />
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
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getUrgencyBadge(daysWaiting)}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  
                  {/* Missing docs summary */}
                  {missingDocs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-dashed flex items-start gap-2">
                      <FileX className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {missingDocs.map((doc, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs bg-destructive/10 text-destructive border-destructive/30"
                          >
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {pendingLeads.length > 0 && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>
              Tempo médio de espera: {Math.round(pendingLeads.reduce((acc, lead) => acc + getDaysWaiting(lead.updated_at), 0) / pendingLeads.length)} dias
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
