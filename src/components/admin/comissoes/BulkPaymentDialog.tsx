import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, DollarSign } from "lucide-react";

interface Comissao {
  id: string;
  vendedor_id: string;
  descricao: string;
  valor_comissao: number;
  vendedores?: { nome: string };
  pagamentos_comissao?: { valor_pago: number }[];
}

interface BulkPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comissoes: Comissao[];
  onUpdate: () => void;
}

const FORMAS_PAGAMENTO = [
  { value: "pix", label: "PIX" },
  { value: "transferencia", label: "Transferência" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cheque", label: "Cheque" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function BulkPaymentDialog({
  open,
  onOpenChange,
  comissoes,
  onUpdate,
}: BulkPaymentDialogProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    forma_pagamento: "",
    data_pagamento: new Date().toISOString().split("T")[0],
    observacoes: "",
  });

  // Calculate totals
  const calcularSaldoRestante = (comissao: Comissao) => {
    const totalPago = comissao.pagamentos_comissao?.reduce((acc, p) => acc + p.valor_pago, 0) || 0;
    return Math.max(0, comissao.valor_comissao - totalPago);
  };

  const totalAReceber = comissoes.reduce((acc, c) => acc + calcularSaldoRestante(c), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (totalAReceber <= 0) {
      toast({ title: "Todas as comissões já foram pagas", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      // Create payment for each commission with remaining balance
      const payments = comissoes
        .filter(c => calcularSaldoRestante(c) > 0)
        .map(c => ({
          comissao_id: c.id,
          valor_pago: calcularSaldoRestante(c),
          forma_pagamento: formData.forma_pagamento,
          data_pagamento: formData.data_pagamento,
          observacoes: formData.observacoes || `Pagamento em lote - ${comissoes.length} comissões`,
        }));

      const { error } = await supabase.from("pagamentos_comissao").insert(payments);

      if (error) throw error;

      toast({ 
        title: "Pagamentos registrados!", 
        description: `${payments.length} comissões pagas com sucesso` 
      });
      
      onOpenChange(false);
      onUpdate();
    } catch (error) {
      console.error("Error saving bulk payments:", error);
      toast({ title: "Erro ao registrar pagamentos", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Group by vendedor
  const vendedoresMap = new Map<string, { nome: string; total: number; count: number }>();
  comissoes.forEach(c => {
    const nome = c.vendedores?.nome || "Desconhecido";
    const saldo = calcularSaldoRestante(c);
    if (vendedoresMap.has(c.vendedor_id)) {
      const current = vendedoresMap.get(c.vendedor_id)!;
      vendedoresMap.set(c.vendedor_id, {
        nome,
        total: current.total + saldo,
        count: current.count + 1,
      });
    } else {
      vendedoresMap.set(c.vendedor_id, { nome, total: saldo, count: 1 });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pagamento em Lote
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Comissões selecionadas:</span>
                  <span className="font-medium">{comissoes.length}</span>
                </div>
                
                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground mb-2">Por vendedor:</p>
                  {Array.from(vendedoresMap.entries()).map(([id, data]) => (
                    <div key={id} className="flex justify-between text-sm py-1">
                      <span>{data.nome} ({data.count})</span>
                      <span className="font-medium">{formatCurrency(data.total)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-medium">Total a Pagar:</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(totalAReceber)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Forma de Pagamento *</Label>
                <Select
                  value={formData.forma_pagamento}
                  onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((fp) => (
                      <SelectItem key={fp.value} value={fp.value}>
                        {fp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_pagamento">Data *</Label>
                <Input
                  id="data_pagamento"
                  type="date"
                  value={formData.data_pagamento}
                  onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações do pagamento em lote"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saving || totalAReceber <= 0 || !formData.forma_pagamento}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Pagar {formatCurrency(totalAReceber)}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
