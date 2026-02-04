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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, FileText, Plus, Link2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ExistingLeadMatch } from "@/types/orcamento";

interface DuplicateLeadWarningProps {
  open: boolean;
  existingLead: ExistingLeadMatch | null;
  onUseExisting: () => void;
  onCreateNew: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function DuplicateLeadWarning({
  open,
  existingLead,
  onUseExisting,
  onCreateNew,
  onCancel,
  isSubmitting = false,
}: DuplicateLeadWarningProps) {
  if (!existingLead) return null;

  const { lead, orcamentos_count } = existingLead;
  const createdDate = format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR });

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Cliente já cadastrado
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Encontramos um cliente com este telefone. Deseja vincular este
                novo orçamento ao cadastro existente ou criar um novo cliente?
              </p>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{lead.nome}</span>
                  {lead.lead_code && (
                    <Badge variant="outline" className="text-xs">
                      {lead.lead_code}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{lead.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>
                    {orcamentos_count} orçamento{orcamentos_count !== 1 ? "s" : ""}{" "}
                    existente{orcamentos_count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Cadastrado em {createdDate}
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel disabled={isSubmitting} onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            variant="outline"
            onClick={onCreateNew}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Novo Cliente
          </Button>
          <AlertDialogAction
            onClick={onUseExisting}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Link2 className="h-4 w-4" />
            Vincular ao Existente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
