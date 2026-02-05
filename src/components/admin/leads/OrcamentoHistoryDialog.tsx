import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Phone, Clock, FileText, Eye, MessageSquare, MapPin, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { GroupedOrcamento } from "@/hooks/useGroupedOrcamentos";
import type { OrcamentoDisplayItem } from "@/types/orcamento";
import type { LeadStatus } from "@/types/lead";

interface OrcamentoHistoryDialogProps {
  group: GroupedOrcamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statuses?: LeadStatus[];
  onViewOrcamento?: (orcamento: OrcamentoDisplayItem) => void;
  onWhatsApp?: (telefone: string, nome: string, leadId: string) => void;
}

export function OrcamentoHistoryDialog({
  group,
  open,
  onOpenChange,
  statuses = [],
  onViewOrcamento,
  onWhatsApp,
}: OrcamentoHistoryDialogProps) {
  if (!group) return null;

  const getStatusBadge = (statusId: string | null) => {
    const status = statuses.find((s) => s.id === statusId);
    if (!status) return null;
    return (
      <Badge
        style={{ backgroundColor: status.cor, color: "#fff" }}
        className="text-xs"
      >
        {status.nome}
      </Badge>
    );
  };

  const firstOrcamento = group.firstOrcamento as OrcamentoDisplayItem;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{group.nome}</span>
            <Badge variant="outline" className="font-mono">
              {group.lead_code}
            </Badge>
            <Badge variant="secondary" className="ml-auto">
              {group.count} orçamento{group.count > 1 ? "s" : ""}
            </Badge>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 pt-2">
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {group.telefone}
            </span>
            {onWhatsApp && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => onWhatsApp(group.telefone, group.nome, group.lead_id)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                WhatsApp
              </Button>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {/* First/Original Orcamento Highlighted */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Primeiro Orçamento (Original)
            </h4>
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="font-mono text-xs">
                      {firstOrcamento.orc_code || "-"}
                    </Badge>
                    {getStatusBadge(firstOrcamento.status_id)}
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {firstOrcamento.cidade}, {firstOrcamento.estado}
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="h-3.5 w-3.5" />
                      Consumo: {firstOrcamento.media_consumo} kWh
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(firstOrcamento.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                {onViewOrcamento && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewOrcamento(firstOrcamento)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                )}
              </div>
            </div>
          </div>

          {group.count > 1 && (
            <>
              <Separator className="my-4" />
              
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Histórico de Orçamentos ({group.count - 1} {group.count > 2 ? "anteriores" : "anterior"})
              </h4>
              
              <div className="space-y-3">
                {group.allOrcamentos
                  .filter((orc) => orc.id !== firstOrcamento.id)
                  .map((orc) => {
                    const orcamento = orc as OrcamentoDisplayItem;
                    const isLatest = orcamento.id === group.latestOrcamento.id;
                    
                    return (
                      <div
                        key={orcamento.id}
                        className={`rounded-lg border p-3 transition-colors ${
                          isLatest ? "bg-muted/50 border-muted-foreground/20" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-mono text-xs">
                                {orcamento.orc_code || "-"}
                              </Badge>
                              {getStatusBadge(orcamento.status_id)}
                              {isLatest && (
                                <Badge variant="secondary" className="text-xs">
                                  Mais Recente
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs space-y-0.5 text-muted-foreground">
                              <p>{orcamento.cidade}, {orcamento.estado} • {orcamento.media_consumo} kWh</p>
                              <p className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(orcamento.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          {onViewOrcamento && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8"
                              onClick={() => onViewOrcamento(orcamento)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
