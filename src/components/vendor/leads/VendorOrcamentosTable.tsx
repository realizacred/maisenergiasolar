import { useState } from "react";
import { Phone, Eye, MapPin, Calendar, Trash2, ShoppingCart, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LeadStatusSelector } from "@/components/vendor/LeadStatusSelector";
import type { LeadStatus } from "@/types/lead";
import type { OrcamentoVendedor } from "@/hooks/useOrcamentosVendedor";

interface VendorOrcamentosTableProps {
  orcamentos: OrcamentoVendedor[];
  statuses: LeadStatus[];
  onToggleVisto: (orcamento: OrcamentoVendedor) => void;
  onView: (orcamento: OrcamentoVendedor) => void;
  onStatusChange: (orcamentoId: string, newStatusId: string | null) => void;
  onDelete?: (orcamento: OrcamentoVendedor) => void;
  onConvert?: (orcamento: OrcamentoVendedor) => void;
}

export function VendorOrcamentosTable({ 
  orcamentos, 
  statuses, 
  onToggleVisto, 
  onView,
  onStatusChange,
  onDelete,
  onConvert
}: VendorOrcamentosTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orcamentoToDelete, setOrcamentoToDelete] = useState<OrcamentoVendedor | null>(null);

  const handleDeleteClick = (orcamento: OrcamentoVendedor) => {
    setOrcamentoToDelete(orcamento);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (orcamentoToDelete && onDelete) {
      onDelete(orcamentoToDelete);
    }
    setDeleteDialogOpen(false);
    setOrcamentoToDelete(null);
  };

  if (orcamentos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum orçamento encontrado</p>
        <p className="text-sm mt-1">
          Compartilhe seu link para começar a captar leads
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Visto</TableHead>
            <TableHead className="w-24">Código</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead className="hidden md:table-cell">Localização</TableHead>
            <TableHead className="hidden sm:table-cell">Consumo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orcamentos.map((orcamento) => {
            // Check if converted
            const convertidoStatus = statuses.find(s => s.nome === "Convertido");
            const isConverted = convertidoStatus && orcamento.status_id === convertidoStatus.id;
            
            // Row colors: blue border = admin saw, green bg = vendor marked
            const rowClasses = [
              orcamento.visto_admin && "border-l-4 border-l-blue-500",
              orcamento.visto && "bg-green-50 dark:bg-green-950/20",
              isConverted && "bg-primary/5",
            ].filter(Boolean).join(" ");
            
            return (
              <TableRow key={orcamento.id} className={rowClasses}>
                <TableCell>
                  <Checkbox
                    checked={orcamento.visto}
                    onCheckedChange={() => onToggleVisto(orcamento)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <Badge variant="outline" className="font-mono text-xs w-fit">
                      {orcamento.orc_code || "-"}
                    </Badge>
                    {orcamento.lead_code && (
                      <span className="text-xs text-muted-foreground">
                        {orcamento.lead_code}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {orcamento.nome}
                    {!orcamento.visto && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                        Novo
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <a 
                    href={`https://wa.me/55${orcamento.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary hover:underline"
                  >
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    {orcamento.telefone}
                  </a>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {orcamento.cidade}, {orcamento.estado}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm">{orcamento.media_consumo} kWh</span>
                </TableCell>
                <TableCell>
                  <LeadStatusSelector
                    leadId={orcamento.id}
                    currentStatusId={orcamento.status_id}
                    statuses={statuses}
                    onStatusChange={(newStatusId) => onStatusChange(orcamento.id, newStatusId)}
                  />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(orcamento.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
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
                            onClick={() => onView(orcamento)}
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
                              onClick={() => onConvert(orcamento)}
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
                      {onDelete && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteClick(orcamento)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Excluir orçamento</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Orçamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento de <strong>{orcamentoToDelete?.nome}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
