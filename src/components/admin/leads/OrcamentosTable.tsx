import { Phone, Eye, Trash2, ShoppingCart, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrcamentoDisplayItem } from "@/types/orcamento";
import type { LeadStatus } from "@/types/lead";

interface OrcamentosTableProps {
  orcamentos: OrcamentoDisplayItem[];
  statuses?: LeadStatus[];
  onToggleVisto: (orcamento: OrcamentoDisplayItem) => void;
  onView: (orcamento: OrcamentoDisplayItem) => void;
  onDelete: (orcamento: OrcamentoDisplayItem) => void;
  onConvert?: (orcamento: OrcamentoDisplayItem) => void;
}

export function OrcamentosTable({ 
  orcamentos, 
  statuses = [], 
  onToggleVisto, 
  onView, 
  onDelete, 
  onConvert 
}: OrcamentosTableProps) {
  if (orcamentos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum orçamento encontrado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Visto</TableHead>
            <TableHead className="w-28">Orçamento</TableHead>
            <TableHead className="w-24">Cliente</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Consumo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orcamentos.map((orc) => {
            // Check if orcamento has been converted
            const convertidoStatus = statuses.find(s => s.nome === "Convertido");
            const isConverted = convertidoStatus && orc.status_id === convertidoStatus.id;
            
            return (
              <TableRow
                key={orc.id}
                className={`${orc.visto_admin ? "bg-green-50 dark:bg-green-950/20" : ""} ${isConverted ? "bg-primary/5" : ""}`}
              >
                <TableCell>
                  <Checkbox
                    checked={orc.visto_admin}
                    onCheckedChange={() => onToggleVisto(orc)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                </TableCell>
                <TableCell>
                  <Badge variant="default" className="font-mono text-xs bg-primary">
                    {orc.orc_code || "-"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {orc.lead_code || "-"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{orc.nome}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    {orc.telefone}
                  </div>
                </TableCell>
                <TableCell>
                  {orc.vendedor ? (
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {orc.vendedor}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-secondary/10 text-secondary"
                  >
                    {orc.cidade}, {orc.estado}
                  </Badge>
                </TableCell>
                <TableCell>{orc.media_consumo} kWh</TableCell>
                <TableCell>
                  {format(new Date(orc.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-secondary hover:text-secondary"
                            onClick={() => onView(orc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver detalhes</TooltipContent>
                      </Tooltip>
                      {onConvert && !isConverted && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => onConvert(orc)}
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Converter em Venda</TooltipContent>
                        </Tooltip>
                      )}
                      {isConverted && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center justify-center h-8 w-8 text-green-600">
                              <UserCheck className="w-4 h-4" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Já convertido em cliente</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onDelete(orc)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir orçamento</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
