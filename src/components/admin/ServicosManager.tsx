 import { useState, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from "@/components/ui/dialog";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { Badge } from "@/components/ui/badge";
 import { toast } from "@/hooks/use-toast";
 import { format, parseISO } from "date-fns";
 import { ptBR } from "date-fns/locale";
 import {
   Plus,
   Loader2,
   CalendarDays,
   MapPin,
   User,
   Wrench,
   Clock,
   RefreshCw,
   Eye,
   Image,
   Video,
   Volume2,
   Grid3X3,
 } from "lucide-react";
 import { ServicoDetailDialog } from "./ServicoDetailDialog";
 
 interface Servico {
   id: string;
   tipo: string;
   status: string;
   data_agendada: string;
   hora_inicio: string | null;
   endereco: string | null;
   bairro: string | null;
   cidade: string | null;
   descricao: string | null;
   cliente: { id: string; nome: string; telefone: string } | null;
   instalador_id: string;
   fotos_urls: string[] | null;
   audio_url: string | null;
   video_url: string | null;
   layout_modulos: unknown | null;
 }
 
 interface Cliente {
   id: string;
   nome: string;
   telefone: string;
   endereco?: string;
   bairro?: string;
   cidade?: string;
 }
 
 interface Instalador {
   id: string;
   nome: string;
 }
 
 const tipoOptions = [
   { value: "instalacao", label: "Instalação Solar" },
   { value: "manutencao", label: "Manutenção/Limpeza" },
   { value: "visita_tecnica", label: "Visita Técnica" },
   { value: "suporte", label: "Suporte/Reparo" },
 ];
 
 const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
   agendado: { label: "Agendado", variant: "default" },
   em_andamento: { label: "Em Andamento", variant: "secondary" },
   concluido: { label: "Concluído", variant: "outline" },
   cancelado: { label: "Cancelado", variant: "destructive" },
   reagendado: { label: "Reagendado", variant: "secondary" },
 };
 
 export function ServicosManager() {
   const [servicos, setServicos] = useState<Servico[]>([]);
   const [clientes, setClientes] = useState<Cliente[]>([]);
   const [instaladores, setInstaladores] = useState<Instalador[]>([]);
   const [loading, setLoading] = useState(true);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [saving, setSaving] = useState(false);
   const [selectedServicoId, setSelectedServicoId] = useState<string | null>(null);
 
   const [formData, setFormData] = useState({
     cliente_id: "",
     instalador_id: "",
     tipo: "instalacao",
     data_agendada: "",
     hora_inicio: "",
     endereco: "",
     bairro: "",
     cidade: "",
     descricao: "",
     observacoes: "",
   });
 
   useEffect(() => {
     fetchData();
   }, []);
 
   const fetchData = async () => {
     setLoading(true);
     try {
       const [servicosRes, clientesRes, instaladoresRes] = await Promise.all([
         supabase
           .from("servicos_agendados")
           .select(`
             id,
             tipo,
             status,
             data_agendada,
             hora_inicio,
             endereco,
             bairro,
             cidade,
             descricao,
             instalador_id,
             cliente:clientes(id, nome, telefone),
             fotos_urls,
             audio_url,
             video_url,
             layout_modulos
           `)
           .order("data_agendada", { ascending: false }),
         supabase
           .from("clientes")
           .select("id, nome, telefone, bairro, cidade")
           .eq("ativo", true)
           .order("nome"),
         supabase
           .from("profiles")
           .select("user_id, nome")
           .eq("ativo", true),
       ]);
 
       if (servicosRes.error) throw servicosRes.error;
       if (clientesRes.error) throw clientesRes.error;
       if (instaladoresRes.error) throw instaladoresRes.error;
 
       // Filter instaladores - only those with instalador role
       const { data: roleData } = await supabase
         .from("user_roles")
         .select("user_id")
         .eq("role", "instalador");
 
       const instaladorIds = roleData?.map(r => r.user_id) || [];
       const filteredInstaladores = instaladoresRes.data
         ?.filter(p => instaladorIds.includes(p.user_id))
         .map(p => ({ id: p.user_id, nome: p.nome })) || [];
 
       setServicos(servicosRes.data || []);
       setClientes(clientesRes.data || []);
       setInstaladores(filteredInstaladores);
     } catch (error) {
       console.error("Error fetching data:", error);
       toast({
         title: "Erro ao carregar dados",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
   };
 
   const handleClienteChange = (clienteId: string) => {
     const cliente = clientes.find(c => c.id === clienteId);
     setFormData(prev => ({
       ...prev,
       cliente_id: clienteId,
       endereco: cliente?.endereco || prev.endereco,
       bairro: cliente?.bairro || prev.bairro,
       cidade: cliente?.cidade || prev.cidade,
     }));
   };
 
   const handleSubmit = async () => {
     if (!formData.instalador_id || !formData.data_agendada) {
       toast({
         title: "Campos obrigatórios",
         description: "Selecione instalador e data",
         variant: "destructive",
       });
       return;
     }
 
     setSaving(true);
     try {
       const { error } = await supabase.from("servicos_agendados").insert([{
         instalador_id: formData.instalador_id,
         tipo: formData.tipo as "instalacao" | "manutencao" | "visita_tecnica" | "suporte",
         data_agendada: formData.data_agendada,
         cliente_id: formData.cliente_id || null,
         hora_inicio: formData.hora_inicio || null,
         endereco: formData.endereco || null,
         bairro: formData.bairro || null,
         cidade: formData.cidade || null,
         descricao: formData.descricao || null,
         observacoes: formData.observacoes || null,
       }]);
 
       if (error) throw error;
 
       toast({ title: "Serviço agendado com sucesso!" });
       setDialogOpen(false);
       setFormData({
         cliente_id: "",
         instalador_id: "",
         tipo: "instalacao",
         data_agendada: "",
         hora_inicio: "",
         endereco: "",
         bairro: "",
         cidade: "",
         descricao: "",
         observacoes: "",
       });
       fetchData();
     } catch (error) {
       console.error("Error saving:", error);
       toast({
         title: "Erro ao agendar serviço",
         variant: "destructive",
       });
     } finally {
       setSaving(false);
     }
   };
 
   const getInstaladorNome = (id: string) => {
     return instaladores.find(i => i.id === id)?.nome || "—";
   };
 
   if (loading) {
     return (
       <div className="flex justify-center py-12">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-xl font-semibold flex items-center gap-2">
             <Wrench className="h-5 w-5 text-primary" />
             Serviços Agendados
           </h2>
           <p className="text-sm text-muted-foreground">
             Gerencie instalações, manutenções e visitas técnicas
           </p>
         </div>
 
         <div className="flex gap-2">
           <Button variant="outline" size="icon" onClick={fetchData}>
             <RefreshCw className="h-4 w-4" />
           </Button>
 
           <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
             <DialogTrigger asChild>
               <Button className="gap-2">
                 <Plus className="h-4 w-4" />
                 Agendar Serviço
               </Button>
             </DialogTrigger>
             <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
               <DialogHeader>
                 <DialogTitle>Agendar Novo Serviço</DialogTitle>
               </DialogHeader>
 
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Tipo de Serviço *</Label>
                     <Select
                       value={formData.tipo}
                       onValueChange={(v) => setFormData(prev => ({ ...prev, tipo: v }))}
                     >
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         {tipoOptions.map(opt => (
                           <SelectItem key={opt.value} value={opt.value}>
                             {opt.label}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
 
                   <div className="space-y-2">
                     <Label>Data *</Label>
                     <Input
                       type="date"
                       value={formData.data_agendada}
                       onChange={(e) => setFormData(prev => ({ ...prev, data_agendada: e.target.value }))}
                     />
                   </div>
                 </div>
 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Instalador *</Label>
                     <Select
                       value={formData.instalador_id}
                       onValueChange={(v) => setFormData(prev => ({ ...prev, instalador_id: v }))}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Selecione..." />
                       </SelectTrigger>
                       <SelectContent>
                         {instaladores.map(inst => (
                           <SelectItem key={inst.id} value={inst.id}>
                             {inst.nome}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
 
                   <div className="space-y-2">
                     <Label>Horário</Label>
                     <Input
                       type="time"
                       value={formData.hora_inicio}
                       onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
                     />
                   </div>
                 </div>
 
                 <div className="space-y-2">
                   <Label>Cliente</Label>
                   <Select
                     value={formData.cliente_id}
                     onValueChange={handleClienteChange}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Vincular a cliente (opcional)" />
                     </SelectTrigger>
                     <SelectContent>
                       {clientes.map(cliente => (
                         <SelectItem key={cliente.id} value={cliente.id}>
                           {cliente.nome}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
 
                 <div className="space-y-2">
                   <Label>Endereço</Label>
                   <Input
                     value={formData.endereco}
                     onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                     placeholder="Rua, número..."
                   />
                 </div>
 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Bairro</Label>
                     <Input
                       value={formData.bairro}
                       onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Cidade</Label>
                     <Input
                       value={formData.cidade}
                       onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                     />
                   </div>
                 </div>
 
                 <div className="space-y-2">
                   <Label>Descrição do Serviço</Label>
                   <Textarea
                     value={formData.descricao}
                     onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                     placeholder="Detalhes do serviço a ser executado..."
                     rows={3}
                   />
                 </div>
 
                 <div className="space-y-2">
                   <Label>Observações Internas</Label>
                   <Textarea
                     value={formData.observacoes}
                     onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                     placeholder="Notas para o instalador..."
                     rows={2}
                   />
                 </div>
 
                 <Button onClick={handleSubmit} disabled={saving} className="w-full">
                   {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                   Agendar Serviço
                 </Button>
               </div>
             </DialogContent>
           </Dialog>
         </div>
       </div>
 
       <Card>
         <CardContent className="p-0">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Data</TableHead>
                 <TableHead>Tipo</TableHead>
                 <TableHead>Cliente</TableHead>
                 <TableHead>Instalador</TableHead>
                 <TableHead>Local</TableHead>
                 <TableHead>Status</TableHead>
                     <TableHead>Mídia</TableHead>
                     <TableHead></TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {servicos.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                     Nenhum serviço agendado
                   </TableCell>
                 </TableRow>
               ) : (
                 servicos.map(servico => (
                   <TableRow key={servico.id}>
                     <TableCell>
                       <div className="flex items-center gap-1">
                         <CalendarDays className="h-4 w-4 text-muted-foreground" />
                         {format(parseISO(servico.data_agendada), "dd/MM/yy", { locale: ptBR })}
                       </div>
                       {servico.hora_inicio && (
                         <div className="text-xs text-muted-foreground flex items-center gap-1">
                           <Clock className="h-3 w-3" />
                           {servico.hora_inicio.slice(0, 5)}
                         </div>
                       )}
                     </TableCell>
                     <TableCell>
                       <Badge variant="outline">
                         {tipoOptions.find(t => t.value === servico.tipo)?.label}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       {servico.cliente ? (
                         <div className="flex items-center gap-1">
                           <User className="h-4 w-4 text-muted-foreground" />
                           {servico.cliente.nome}
                         </div>
                       ) : (
                         <span className="text-muted-foreground">—</span>
                       )}
                     </TableCell>
                     <TableCell>{getInstaladorNome(servico.instalador_id)}</TableCell>
                     <TableCell>
                       {servico.cidade || servico.bairro ? (
                         <div className="flex items-center gap-1 text-sm">
                           <MapPin className="h-3 w-3 text-muted-foreground" />
                           {[servico.bairro, servico.cidade].filter(Boolean).join(", ")}
                         </div>
                       ) : (
                         <span className="text-muted-foreground">—</span>
                       )}
                     </TableCell>
                     <TableCell>
                       <Badge variant={statusConfig[servico.status]?.variant || "default"}>
                         {statusConfig[servico.status]?.label || servico.status}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center gap-1">
                         {servico.fotos_urls && servico.fotos_urls.length > 0 && (
                           <div className="flex items-center gap-0.5 text-muted-foreground" title={`${servico.fotos_urls.length} fotos`}>
                             <Image className="h-3.5 w-3.5" />
                             <span className="text-xs">{servico.fotos_urls.length}</span>
                           </div>
                         )}
                         {servico.video_url && (
                           <span title="Vídeo">
                             <Video className="h-3.5 w-3.5 text-muted-foreground" />
                           </span>
                         )}
                         {servico.audio_url && (
                           <span title="Áudio">
                             <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                           </span>
                         )}
                         {servico.layout_modulos && (
                           <span title="Layout">
                             <Grid3X3 className="h-3.5 w-3.5 text-muted-foreground" />
                           </span>
                         )}
                       </div>
                     </TableCell>
                     <TableCell>
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => setSelectedServicoId(servico.id)}
                       >
                         <Eye className="h-4 w-4" />
                       </Button>
                     </TableCell>
                   </TableRow>
                 ))
               )}
             </TableBody>
           </Table>
         </CardContent>
       </Card>

       <ServicoDetailDialog
         servicoId={selectedServicoId}
         isOpen={!!selectedServicoId}
         onClose={() => setSelectedServicoId(null)}
       />
     </div>
   );
 }