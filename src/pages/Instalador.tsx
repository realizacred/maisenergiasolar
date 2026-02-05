 import { useEffect, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { useAuth } from "@/hooks/useAuth";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Badge } from "@/components/ui/badge";
 import { Calendar } from "@/components/ui/calendar";
 import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
 import { ptBR } from "date-fns/locale";
 import {
   Loader2,
   LogOut,
   CalendarDays,
   List,
   MapPin,
   Clock,
   User,
   Wrench,
   CheckCircle2,
   AlertCircle,
   Play,
   ClipboardCheck,
 } from "lucide-react";
 import logoImg from "@/assets/logo.png";
 import { toast } from "@/hooks/use-toast";
 
 interface ServicoAgendado {
   id: string;
   tipo: "instalacao" | "manutencao" | "visita_tecnica" | "suporte";
   status: "agendado" | "em_andamento" | "concluido" | "cancelado" | "reagendado";
   data_agendada: string;
   hora_inicio: string | null;
   hora_fim: string | null;
   endereco: string | null;
   bairro: string | null;
   cidade: string | null;
   descricao: string | null;
   observacoes: string | null;
   cliente: { nome: string; telefone: string } | null;
 }
 
 const tipoLabels: Record<string, string> = {
   instalacao: "Instalação Solar",
   manutencao: "Manutenção",
   visita_tecnica: "Visita Técnica",
   suporte: "Suporte/Reparo",
 };
 
 const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
   agendado: { label: "Agendado", color: "bg-blue-500", icon: CalendarDays },
   em_andamento: { label: "Em Andamento", color: "bg-amber-500", icon: Play },
   concluido: { label: "Concluído", color: "bg-green-500", icon: CheckCircle2 },
   cancelado: { label: "Cancelado", color: "bg-red-500", icon: AlertCircle },
   reagendado: { label: "Reagendado", color: "bg-purple-500", icon: CalendarDays },
 };
 
 export default function Instalador() {
   const { user, loading: authLoading, signOut } = useAuth();
   const navigate = useNavigate();
   const [servicos, setServicos] = useState<ServicoAgendado[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
   const [view, setView] = useState<"lista" | "calendario">("lista");
   const [hasAccess, setHasAccess] = useState(false);
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate("/auth?from=instalador", { replace: true });
       return;
     }
 
     if (user) {
       checkAccess();
     }
   }, [user, authLoading, navigate]);
 
   const checkAccess = async () => {
     if (!user) return;
 
     try {
       const { data: roles, error } = await supabase
         .from("user_roles")
         .select("role")
         .eq("user_id", user.id);
 
       if (error) throw error;
 
       const isInstalador = roles?.some(r => r.role === "instalador");
       const isAdmin = roles?.some(r => ["admin", "gerente"].includes(r.role));
 
       if (!isInstalador && !isAdmin) {
         navigate("/portal", { replace: true });
         return;
       }
 
       setHasAccess(true);
       fetchServicos();
     } catch (error) {
       console.error("Error checking access:", error);
       navigate("/portal", { replace: true });
     }
   };
 
   const fetchServicos = async () => {
     if (!user) return;
 
     setLoading(true);
     try {
       const { data, error } = await supabase
         .from("servicos_agendados")
         .select(`
           id,
           tipo,
           status,
           data_agendada,
           hora_inicio,
           hora_fim,
           endereco,
           bairro,
           cidade,
           descricao,
           observacoes,
           cliente:clientes(nome, telefone)
         `)
         .eq("instalador_id", user.id)
         .order("data_agendada", { ascending: true });
 
       if (error) throw error;
       setServicos(data || []);
     } catch (error) {
       console.error("Error fetching servicos:", error);
       toast({
         title: "Erro ao carregar serviços",
         description: "Tente novamente mais tarde.",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
   };
 
   const updateServicoStatus = async (id: string, status: "agendado" | "em_andamento" | "concluido" | "cancelado" | "reagendado") => {
     try {
       const { error } = await supabase
         .from("servicos_agendados")
         .update({ status })
         .eq("id", id);
 
       if (error) throw error;
 
       toast({
         title: "Status atualizado",
         description: `Serviço marcado como ${statusConfig[status]?.label || status}`,
       });
 
       fetchServicos();
     } catch (error) {
       console.error("Error updating status:", error);
       toast({
         title: "Erro ao atualizar",
         description: "Tente novamente.",
         variant: "destructive",
       });
     }
   };
 
   const handleSignOut = async () => {
     await signOut();
     navigate("/auth");
   };
 
   const servicosHoje = servicos.filter(s => 
     isSameDay(parseISO(s.data_agendada), new Date())
   );
 
   const servicosSelecionados = servicos.filter(s =>
     isSameDay(parseISO(s.data_agendada), selectedDate)
   );
 
   const diasComServico = servicos.map(s => parseISO(s.data_agendada));
 
   if (authLoading || !hasAccess) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   const ServicoCard = ({ servico }: { servico: ServicoAgendado }) => {
     const config = statusConfig[servico.status];
     const StatusIcon = config?.icon || CalendarDays;
 
     return (
       <Card className="overflow-hidden">
         <div className={`h-1 ${config?.color || "bg-muted"}`} />
         <CardContent className="pt-4 space-y-3">
           <div className="flex items-start justify-between gap-2">
             <div className="flex-1">
               <div className="flex items-center gap-2 mb-1">
                 <Wrench className="h-4 w-4 text-primary" />
                 <span className="font-semibold">{tipoLabels[servico.tipo]}</span>
               </div>
               <Badge variant="outline" className="text-xs">
                 <StatusIcon className="h-3 w-3 mr-1" />
                 {config?.label}
               </Badge>
             </div>
             <div className="text-right text-sm text-muted-foreground">
               <div className="flex items-center gap-1">
                 <CalendarDays className="h-3 w-3" />
                 {format(parseISO(servico.data_agendada), "dd/MM", { locale: ptBR })}
               </div>
               {servico.hora_inicio && (
                 <div className="flex items-center gap-1">
                   <Clock className="h-3 w-3" />
                   {servico.hora_inicio.slice(0, 5)}
                 </div>
               )}
             </div>
           </div>
 
           {servico.cliente && (
             <div className="flex items-center gap-2 text-sm">
               <User className="h-4 w-4 text-muted-foreground" />
               <span>{servico.cliente.nome}</span>
             </div>
           )}
 
           {(servico.endereco || servico.bairro || servico.cidade) && (
             <div className="flex items-start gap-2 text-sm text-muted-foreground">
               <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
               <span>
                 {[servico.endereco, servico.bairro, servico.cidade]
                   .filter(Boolean)
                   .join(", ")}
               </span>
             </div>
           )}
 
           {servico.descricao && (
             <p className="text-sm text-muted-foreground border-t pt-2">
               {servico.descricao}
             </p>
           )}
 
           {servico.status === "agendado" && (
             <div className="flex gap-2 pt-2 border-t">
               <Button
                 size="sm"
                 variant="outline"
                 className="flex-1"
                 onClick={() => updateServicoStatus(servico.id, "em_andamento")}
               >
                 <Play className="h-4 w-4 mr-1" />
                 Iniciar
               </Button>
             </div>
           )}
 
           {servico.status === "em_andamento" && (
             <div className="flex gap-2 pt-2 border-t">
               <Button
                 size="sm"
                 className="flex-1"
                 onClick={() => updateServicoStatus(servico.id, "concluido")}
               >
                 <CheckCircle2 className="h-4 w-4 mr-1" />
                 Concluir
               </Button>
               <Button
                 size="sm"
                 variant="outline"
                 onClick={() => navigate("/checklist")}
               >
                 <ClipboardCheck className="h-4 w-4" />
               </Button>
             </div>
           )}
         </CardContent>
       </Card>
     );
   };
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
         <div className="container mx-auto px-4">
           <div className="flex items-center justify-between h-14">
             <div className="flex items-center gap-3">
               <img src={logoImg} alt="Logo" className="h-8" />
               <span className="font-semibold hidden sm:inline">Portal do Instalador</span>
             </div>
 
             <Button
               variant="ghost"
               size="sm"
               onClick={handleSignOut}
               className="gap-1"
             >
               <LogOut className="h-4 w-4" />
               <span className="hidden sm:inline">Sair</span>
             </Button>
           </div>
         </div>
       </header>
 
       {/* Content */}
       <main className="container mx-auto px-4 py-6 max-w-4xl">
         {/* Stats */}
         <div className="grid grid-cols-3 gap-3 mb-6">
           <Card className="text-center p-3 bg-card">
             <div className="text-2xl font-bold text-primary">{servicosHoje.length}</div>
             <div className="text-xs text-muted-foreground">Hoje</div>
           </Card>
           <Card className="text-center p-3 bg-card">
             <div className="text-2xl font-bold text-warning">
               {servicos.filter(s => s.status === "em_andamento").length}
             </div>
             <div className="text-xs text-muted-foreground">Em Andamento</div>
           </Card>
           <Card className="text-center p-3 bg-card">
             <div className="text-2xl font-bold text-success">
               {servicos.filter(s => s.status === "concluido").length}
             </div>
             <div className="text-xs text-muted-foreground">Concluídos</div>
           </Card>
         </div>
 
         {/* View Tabs */}
         <Tabs value={view} onValueChange={(v) => setView(v as "lista" | "calendario")} className="space-y-4">
           <TabsList className="grid w-full grid-cols-2">
             <TabsTrigger value="lista" className="gap-2">
               <List className="h-4 w-4" />
               Lista
             </TabsTrigger>
             <TabsTrigger value="calendario" className="gap-2">
               <CalendarDays className="h-4 w-4" />
               Calendário
             </TabsTrigger>
           </TabsList>
 
           <TabsContent value="lista" className="space-y-4">
             {loading ? (
               <div className="flex justify-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
             ) : servicos.filter(s => s.status !== "cancelado" && s.status !== "concluido").length === 0 ? (
               <Card className="text-center py-12">
                 <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                 <p className="text-muted-foreground">Nenhum serviço agendado</p>
               </Card>
             ) : (
               <div className="space-y-3">
                 {servicos
                   .filter(s => s.status !== "cancelado" && s.status !== "concluido")
                   .map(servico => (
                     <ServicoCard key={servico.id} servico={servico} />
                   ))
                 }
               </div>
             )}
           </TabsContent>
 
           <TabsContent value="calendario" className="space-y-4">
             <Card>
               <CardContent className="p-4">
                 <Calendar
                   mode="single"
                   selected={selectedDate}
                   onSelect={(date) => date && setSelectedDate(date)}
                   locale={ptBR}
                   className="pointer-events-auto"
                   modifiers={{
                     hasService: diasComServico,
                   }}
                   modifiersStyles={{
                     hasService: {
                       fontWeight: "bold",
                       backgroundColor: "hsl(var(--primary) / 0.1)",
                       color: "hsl(var(--primary))",
                     },
                   }}
                 />
               </CardContent>
             </Card>
 
             <div className="space-y-3">
               <h3 className="font-semibold flex items-center gap-2">
                 <CalendarDays className="h-4 w-4" />
                 {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
               </h3>
 
               {servicosSelecionados.length === 0 ? (
                 <Card className="text-center py-8">
                   <p className="text-muted-foreground text-sm">Nenhum serviço neste dia</p>
                 </Card>
               ) : (
                 servicosSelecionados.map(servico => (
                   <ServicoCard key={servico.id} servico={servico} />
                 ))
               )}
             </div>
           </TabsContent>
         </Tabs>
       </main>
     </div>
   );
 }