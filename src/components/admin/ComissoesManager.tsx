import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Loader2,
  Trash2,
  DollarSign,
  Eye,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PagamentosComissaoDialog } from "./PagamentosComissaoDialog";
import { BulkPaymentDialog } from "./comissoes/BulkPaymentDialog";
 
 interface Vendedor {
   id: string;
   nome: string;
 }
 
 interface Comissao {
   id: string;
   vendedor_id: string;
   projeto_id: string | null;
   cliente_id: string | null;
   descricao: string;
   valor_base: number;
   percentual_comissao: number;
   valor_comissao: number;
   mes_referencia: number;
   ano_referencia: number;
   status: string;
   observacoes: string | null;
   created_at: string;
   vendedores?: { nome: string };
   clientes?: { nome: string } | null;
   projetos?: { codigo: string } | null;
   pagamentos_comissao?: { valor_pago: number }[];
 }
 
 const MESES = [
   { value: 1, label: "Janeiro" },
   { value: 2, label: "Fevereiro" },
   { value: 3, label: "Março" },
   { value: 4, label: "Abril" },
   { value: 5, label: "Maio" },
   { value: 6, label: "Junho" },
   { value: 7, label: "Julho" },
   { value: 8, label: "Agosto" },
   { value: 9, label: "Setembro" },
   { value: 10, label: "Outubro" },
   { value: 11, label: "Novembro" },
   { value: 12, label: "Dezembro" },
 ];
 
export function ComissoesManager() {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedComissao, setSelectedComissao] = useState<Comissao | null>(null);
  const [pagamentosDialogOpen, setPagamentosDialogOpen] = useState(false);
  const [bulkPaymentOpen, setBulkPaymentOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filters
  const currentDate = new Date();
  const [filterMes, setFilterMes] = useState(currentDate.getMonth() + 1);
  const [filterAno, setFilterAno] = useState(currentDate.getFullYear());
  const [filterVendedor, setFilterVendedor] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
 
   const [formData, setFormData] = useState({
     vendedor_id: "",
     descricao: "",
     valor_base: "",
     percentual_comissao: "2.0",
     mes_referencia: currentDate.getMonth() + 1,
     ano_referencia: currentDate.getFullYear(),
     observacoes: "",
   });
 
   useEffect(() => {
     fetchData();
   }, [filterMes, filterAno, filterVendedor, filterStatus]);
 
   const fetchData = async () => {
     setLoading(true);
     try {
       // Fetch vendedores
       const { data: vendedoresData } = await supabase
         .from("vendedores")
         .select("id, nome")
         .eq("ativo", true)
         .order("nome");
 
       if (vendedoresData) setVendedores(vendedoresData);
 
       // Build query for comissoes
       let query = supabase
         .from("comissoes")
         .select(`
           *,
           vendedores(nome),
           clientes(nome),
           projetos(codigo),
           pagamentos_comissao(valor_pago)
         `)
         .eq("mes_referencia", filterMes)
         .eq("ano_referencia", filterAno)
         .order("created_at", { ascending: false });
 
       if (filterVendedor !== "all") {
         query = query.eq("vendedor_id", filterVendedor);
       }
 
       if (filterStatus !== "all") {
         query = query.eq("status", filterStatus);
       }
 
       const { data, error } = await query;
 
       if (error) throw error;
       setComissoes(data || []);
     } catch (error) {
       console.error("Error fetching data:", error);
       toast({ title: "Erro ao carregar dados", variant: "destructive" });
     } finally {
       setLoading(false);
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setSaving(true);
 
     try {
       const valorBase = parseFloat(formData.valor_base);
       const percentual = parseFloat(formData.percentual_comissao);
       const valorComissao = (valorBase * percentual) / 100;
 
       const { error } = await supabase.from("comissoes").insert({
         vendedor_id: formData.vendedor_id,
         descricao: formData.descricao,
         valor_base: valorBase,
         percentual_comissao: percentual,
         valor_comissao: valorComissao,
         mes_referencia: formData.mes_referencia,
         ano_referencia: formData.ano_referencia,
         observacoes: formData.observacoes || null,
       });
 
       if (error) throw error;
 
       toast({ title: "Comissão registrada com sucesso!" });
       resetForm();
       fetchData();
     } catch (error) {
       console.error("Error saving comissao:", error);
       toast({ title: "Erro ao registrar comissão", variant: "destructive" });
     } finally {
       setSaving(false);
     }
   };
 
   const handleDelete = async (id: string) => {
     if (!confirm("Excluir esta comissão?")) return;
 
     try {
       const { error } = await supabase.from("comissoes").delete().eq("id", id);
       if (error) throw error;
       toast({ title: "Comissão excluída!" });
       fetchData();
     } catch (error) {
       console.error("Error deleting comissao:", error);
       toast({ title: "Erro ao excluir comissão", variant: "destructive" });
     }
   };
 
   const resetForm = () => {
     setFormData({
       vendedor_id: "",
       descricao: "",
       valor_base: "",
       percentual_comissao: "2.0",
       mes_referencia: currentDate.getMonth() + 1,
       ano_referencia: currentDate.getFullYear(),
       observacoes: "",
     });
     setDialogOpen(false);
   };
 
   const formatCurrency = (value: number) => {
     return new Intl.NumberFormat("pt-BR", {
       style: "currency",
       currency: "BRL",
     }).format(value);
   };
 
   const getStatusBadge = (status: string) => {
     const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
       pendente: { variant: "destructive", label: "Pendente" },
       parcial: { variant: "secondary", label: "Parcial" },
       pago: { variant: "default", label: "Pago" },
     };
     const config = variants[status] || { variant: "outline" as const, label: status };
     return <Badge variant={config.variant}>{config.label}</Badge>;
   };
 
  const calcularValorPago = (comissao: Comissao) => {
    return comissao.pagamentos_comissao?.reduce((acc, p) => acc + p.valor_pago, 0) || 0;
  };

  const calcularSaldoRestante = (comissao: Comissao) => {
    const pago = calcularValorPago(comissao);
    return Math.max(0, comissao.valor_comissao - pago);
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === comissoes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comissoes.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectedComissoes = comissoes.filter(c => selectedIds.has(c.id));
  const selectedTotalAReceber = selectedComissoes.reduce((acc, c) => acc + calcularSaldoRestante(c), 0);

  // Stats
  const totalComissoes = comissoes.reduce((acc, c) => acc + c.valor_comissao, 0);
  const totalPago = comissoes.reduce((acc, c) => acc + calcularValorPago(c), 0);
  const totalPendente = comissoes.reduce((acc, c) => acc + calcularSaldoRestante(c), 0);
 
   const anos = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
 
   if (loading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-primary/10">
                 <TrendingUp className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Total Comissões</p>
                 <p className="text-xl font-bold">{formatCurrency(totalComissoes)}</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-green-500/10">
                 <DollarSign className="h-5 w-5 text-green-600" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Total Pago</p>
                 <p className="text-xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-orange-500/10">
                 <Calendar className="h-5 w-5 text-orange-600" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Pendente</p>
                 <p className="text-xl font-bold text-orange-600">{formatCurrency(totalPendente)}</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-blue-500/10">
                 <Users className="h-5 w-5 text-blue-600" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Registros</p>
                 <p className="text-xl font-bold">{comissoes.length}</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Filters and Actions */}
       <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Comissões</CardTitle>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button 
                  variant="secondary" 
                  className="gap-2"
                  onClick={() => setBulkPaymentOpen(true)}
                >
                  <CreditCard className="h-4 w-4" />
                  Pagar {selectedIds.size} selecionadas ({formatCurrency(selectedTotalAReceber)})
                </Button>
              )}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Comissão
                  </Button>
                </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>Registrar Comissão</DialogTitle>
                 </DialogHeader>
                 <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="space-y-2">
                     <Label>Vendedor *</Label>
                     <Select
                       value={formData.vendedor_id}
                       onValueChange={(value) => setFormData({ ...formData, vendedor_id: value })}
                       required
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Selecione o vendedor" />
                       </SelectTrigger>
                       <SelectContent>
                         {vendedores.map((v) => (
                           <SelectItem key={v.id} value={v.id}>
                             {v.nome}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="descricao">Descrição *</Label>
                     <Input
                       id="descricao"
                       value={formData.descricao}
                       onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                       placeholder="Ex: Venda projeto João Silva"
                       required
                     />
                   </div>
 
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor="valor_base">Valor Base (R$) *</Label>
                       <Input
                         id="valor_base"
                         type="number"
                         step="0.01"
                         value={formData.valor_base}
                         onChange={(e) => setFormData({ ...formData, valor_base: e.target.value })}
                         placeholder="0,00"
                         required
                       />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="percentual">Percentual (%)</Label>
                       <Input
                         id="percentual"
                         type="number"
                         step="0.1"
                         value={formData.percentual_comissao}
                         onChange={(e) => setFormData({ ...formData, percentual_comissao: e.target.value })}
                       />
                     </div>
                   </div>
 
                   {formData.valor_base && formData.percentual_comissao && (
                     <div className="p-3 bg-muted rounded-lg">
                       <p className="text-sm text-muted-foreground">Valor da Comissão:</p>
                       <p className="text-lg font-bold text-primary">
                         {formatCurrency(
                           (parseFloat(formData.valor_base) * parseFloat(formData.percentual_comissao)) / 100
                         )}
                       </p>
                     </div>
                   )}
 
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Mês Referência</Label>
                       <Select
                         value={formData.mes_referencia.toString()}
                         onValueChange={(value) =>
                           setFormData({ ...formData, mes_referencia: parseInt(value) })
                         }
                       >
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {MESES.map((m) => (
                             <SelectItem key={m.value} value={m.value.toString()}>
                               {m.label}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-2">
                       <Label>Ano</Label>
                       <Select
                         value={formData.ano_referencia.toString()}
                         onValueChange={(value) =>
                           setFormData({ ...formData, ano_referencia: parseInt(value) })
                         }
                       >
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {anos.map((a) => (
                             <SelectItem key={a} value={a.toString()}>
                               {a}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="observacoes">Observações</Label>
                     <Textarea
                       id="observacoes"
                       value={formData.observacoes}
                       onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                       rows={2}
                     />
                   </div>
 
                   <div className="flex justify-end gap-3">
                     <Button type="button" variant="outline" onClick={resetForm}>
                       Cancelar
                     </Button>
                     <Button type="submit" disabled={saving}>
                       {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                       Registrar
                     </Button>
                   </div>
                 </form>
               </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
         <CardContent>
           {/* Filters */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
             <div className="space-y-2">
               <Label>Mês</Label>
               <Select value={filterMes.toString()} onValueChange={(v) => setFilterMes(parseInt(v))}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {MESES.map((m) => (
                     <SelectItem key={m.value} value={m.value.toString()}>
                       {m.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             <div className="space-y-2">
               <Label>Ano</Label>
               <Select value={filterAno.toString()} onValueChange={(v) => setFilterAno(parseInt(v))}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {anos.map((a) => (
                     <SelectItem key={a} value={a.toString()}>
                       {a}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             <div className="space-y-2">
               <Label>Vendedor</Label>
               <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Todos</SelectItem>
                   {vendedores.map((v) => (
                     <SelectItem key={v.id} value={v.id}>
                       {v.nome}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             <div className="space-y-2">
               <Label>Status</Label>
               <Select value={filterStatus} onValueChange={setFilterStatus}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Todos</SelectItem>
                   <SelectItem value="pendente">Pendente</SelectItem>
                   <SelectItem value="parcial">Parcial</SelectItem>
                   <SelectItem value="pago">Pago</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
 
           {/* Table */}
           {comissoes.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
               <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
               <p>Nenhuma comissão encontrada para o período selecionado</p>
             </div>
           ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === comissoes.length && comissoes.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                  <TableHead className="text-right">Pago</TableHead>
                  <TableHead className="text-right">A Receber</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comissoes.map((comissao) => {
                  const valorPago = calcularValorPago(comissao);
                  const saldoRestante = calcularSaldoRestante(comissao);
                  return (
                    <TableRow key={comissao.id} className={selectedIds.has(comissao.id) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(comissao.id)}
                          onCheckedChange={() => toggleSelect(comissao.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {comissao.vendedores?.nome}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="truncate max-w-48">{comissao.descricao}</p>
                          {comissao.projetos?.codigo && (
                            <p className="text-xs text-muted-foreground">
                              {comissao.projetos.codigo}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(comissao.valor_comissao)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(valorPago)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-orange-600">
                        {saldoRestante > 0 ? formatCurrency(saldoRestante) : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(comissao.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedComissao(comissao);
                              setPagamentosDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(comissao.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
           )}
         </CardContent>
       </Card>
 
      {/* Pagamentos Dialog */}
      {selectedComissao && (
        <PagamentosComissaoDialog
          open={pagamentosDialogOpen}
          onOpenChange={setPagamentosDialogOpen}
          comissao={selectedComissao}
          onUpdate={fetchData}
        />
      )}

      {/* Bulk Payment Dialog */}
      <BulkPaymentDialog
        open={bulkPaymentOpen}
        onOpenChange={(open) => {
          setBulkPaymentOpen(open);
          if (!open) setSelectedIds(new Set());
        }}
        comissoes={selectedComissoes}
        onUpdate={() => {
          fetchData();
          setSelectedIds(new Set());
        }}
      />
     </div>
   );
 }