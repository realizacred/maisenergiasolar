 import { useEffect, useState, useCallback } from "react";
 import { useNavigate } from "react-router-dom";
 import { useAuth } from "@/hooks/useAuth";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Badge } from "@/components/ui/badge";
 import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO } from "date-fns";
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
  TrendingUp,
  Phone,
 } from "lucide-react";
import logoBrancaImg from "@/assets/logo-branca.png";
 import { toast } from "@/hooks/use-toast";
 import { ServicoEmAndamento } from "@/components/instalador/ServicoEmAndamento";
 
 interface ServicoAgendado {
   id: string;
   tipo: "instalacao" | "manutencao" | "visita_tecnica" | "suporte";
   status: "agendado" | "em_andamento" | "concluido" | "cancelado" | "reagendado";
   data_agendada: string;
   hora_inicio: string | null;
   hora_fim: string | null;
   data_hora_inicio: string | null;
   data_hora_fim: string | null;
   endereco: string | null;
   bairro: string | null;
   cidade: string | null;
   descricao: string | null;
   observacoes: string | null;
   observacoes_conclusao: string | null;
   fotos_urls: string[] | null;
   cliente: { nome: string; telefone: string } | null;
 }
 
 const tipoLabels: Record<string, string> = {
   instalacao: "Instalação Solar",
   manutencao: "Manutenção",
   visita_tecnica: "Visita Técnica",
   suporte: "Suporte/Reparo",
 };
 
const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string; icon: typeof CheckCircle2 }> = {
  agendado: { label: "Agendado", bgColor: "bg-info/10", textColor: "text-info", borderColor: "border-info/30", icon: CalendarDays },
  em_andamento: { label: "Em Andamento", bgColor: "bg-warning/10", textColor: "text-warning", borderColor: "border-warning/30", icon: Play },
  concluido: { label: "Concluído", bgColor: "bg-success/10", textColor: "text-success", borderColor: "border-success/30", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", bgColor: "bg-destructive/10", textColor: "text-destructive", borderColor: "border-destructive/30", icon: AlertCircle },
  reagendado: { label: "Reagendado", bgColor: "bg-secondary/10", textColor: "text-secondary", borderColor: "border-secondary/30", icon: CalendarDays },
};
 
 export default function Instalador() {
   const { user, loading: authLoading, signOut } = useAuth();
   const navigate = useNavigate();
   const [servicos, setServicos] = useState<ServicoAgendado[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
   const [view, setView] = useState<"lista" | "calendario">("lista");
   const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
   const [activeServico, setActiveServico] = useState<ServicoAgendado | null>(null);
 
   useEffect(() => {
     if (!authLoading && !user) {
       navigate("/auth?from=instalador", { replace: true });
       return;
     }
 
    if (user && !accessChecked) {
       checkAccess();
     }
  }, [user, authLoading, navigate, accessChecked]);
 
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
        setAccessChecked(true);
         navigate("/portal", { replace: true });
         return;
       }
 
       setHasAccess(true);
      setAccessChecked(true);
       fetchServicos();
     } catch (error) {
       console.error("Error checking access:", error);
      setAccessChecked(true);
       navigate("/portal", { replace: true });
     }
   };
 
   const fetchServicos = useCallback(async () => {
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
           data_hora_inicio,
           data_hora_fim,
           endereco,
           bairro,
           cidade,
           descricao,
           observacoes,
           observacoes_conclusao,
           fotos_urls,
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
   }, [user]);
 
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
 
   // Abrir serviço para execução
   const handleOpenServico = (servico: ServicoAgendado) => {
     setActiveServico(servico);
   };
 
   // Fechar tela de serviço ativo
   const handleCloseServico = () => {
     setActiveServico(null);
   };
 
   // Callback quando serviço é atualizado
   const handleServiceUpdated = () => {
     fetchServicos();
   };
 
  if (authLoading || (!accessChecked)) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }

  if (accessChecked && !hasAccess) {
    return null; // Redirect in progress
  }
 
   const ServicoCard = ({ servico }: { servico: ServicoAgendado }) => {
     const config = statusConfig[servico.status];
     const StatusIcon = config?.icon || CalendarDays;
 
     return (
      <Card className={`overflow-hidden border-l-4 ${config?.borderColor || "border-muted"} hover-lift`}>
        <CardContent className="p-5 space-y-4">
          {/* Header do Card */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Wrench className="h-4 w-4 text-secondary" />
                </div>
                <span className="font-semibold text-foreground">{tipoLabels[servico.tipo]}</span>
              </div>
              <Badge className={`${config?.bgColor} ${config?.textColor} border-0 font-medium`}>
                <StatusIcon className="h-3 w-3 mr-1.5" />
                 {config?.label}
               </Badge>
             </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <CalendarDays className="h-4 w-4 text-secondary" />
                 {format(parseISO(servico.data_agendada), "dd/MM", { locale: ptBR })}
               </div>
               {servico.hora_inicio && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                   {servico.hora_inicio.slice(0, 5)}
                 </div>
               )}
             </div>
           </div>
 
          {/* Info do Cliente */}
           {servico.cliente && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-background">
                <User className="h-4 w-4 text-secondary" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-foreground">{servico.cliente.nome}</span>
                {servico.cliente.telefone && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <Phone className="h-3 w-3" />
                    {servico.cliente.telefone}
                  </div>
                )}
              </div>
             </div>
           )}
 
          {/* Endereço */}
           {(servico.endereco || servico.bairro || servico.cidade) && (
             <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-secondary" />
               <span>
                 {[servico.endereco, servico.bairro, servico.cidade]
                   .filter(Boolean)
                   .join(", ")}
               </span>
             </div>
           )}
 
          {/* Descrição */}
           {servico.descricao && (
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
               {servico.descricao}
             </p>
           )}
 
          {/* Ações */}
           {servico.status === "agendado" && (
            <div className="pt-3 border-t">
               <Button
                size="default"
                className="w-full bg-success hover:bg-success/90 text-success-foreground shadow-md"
                 onClick={() => handleOpenServico(servico)}
               >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Atendimento
               </Button>
             </div>
           )}
 
           {servico.status === "em_andamento" && (
            <div className="flex gap-3 pt-3 border-t">
               <Button
                size="default"
                 variant="outline"
                className="flex-1 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                 onClick={() => handleOpenServico(servico)}
               >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                 Continuar
               </Button>
               <Button
                size="default"
                className="bg-success hover:bg-success/90 text-success-foreground"
                  onClick={() => handleOpenServico(servico)}
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
     <>
       {/* Modal de Serviço Ativo */}
       {activeServico && (
         <ServicoEmAndamento
           servico={activeServico}
           onClose={handleCloseServico}
           onServiceUpdated={handleServiceUpdated}
         />
       )}
 
    <div className="min-h-screen bg-muted/30">
      {/* Header Profissional - Azul Corporativo */}
      <header className="sticky top-0 z-50 gradient-blue shadow-lg">
         <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src={logoBrancaImg} alt="Mais Energia Solar" className="h-9" />
              <div className="hidden sm:block border-l border-white/20 pl-4">
                <span className="text-white/90 text-sm font-medium">Portal do Instalador</span>
              </div>
             </div>
 
             <Button
               variant="ghost"
               size="sm"
               onClick={handleSignOut}
              className="text-white/90 hover:text-white hover:bg-white/10 gap-2"
             >
               <LogOut className="h-4 w-4" />
               <span className="hidden sm:inline">Sair</span>
             </Button>
           </div>
         </div>
       </header>
 
       {/* Content */}
       <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Stats Cards - Estilo Corporativo */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-md hover-lift">
            <div className="absolute inset-0 gradient-blue opacity-5" />
            <CardContent className="p-4 text-center relative">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 mb-2">
                <CalendarDays className="h-5 w-5 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-secondary">{servicosHoje.length}</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hoje</div>
            </CardContent>
           </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-md hover-lift">
            <div className="absolute inset-0 bg-warning/5" />
            <CardContent className="p-4 text-center relative">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-warning/10 mb-2">
                <Play className="h-5 w-5 text-warning" />
              </div>
              <div className="text-3xl font-bold text-warning">
                {servicos.filter(s => s.status === "em_andamento").length}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Em Andamento</div>
            </CardContent>
           </Card>
          
          <Card className="relative overflow-hidden border-0 shadow-md hover-lift">
            <div className="absolute inset-0 bg-success/5" />
            <CardContent className="p-4 text-center relative">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-success/10 mb-2">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="text-3xl font-bold text-success">
                {servicos.filter(s => s.status === "concluido").length}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Concluídos</div>
            </CardContent>
           </Card>
         </div>
 
        {/* View Tabs - Estilo Profissional */}
        <Tabs value={view} onValueChange={(v) => setView(v as "lista" | "calendario")} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-card shadow-sm border">
            <TabsTrigger 
              value="lista" 
              className="gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-sm transition-all"
            >
               <List className="h-4 w-4" />
               Lista
             </TabsTrigger>
            <TabsTrigger 
              value="calendario" 
              className="gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-sm transition-all"
            >
               <CalendarDays className="h-4 w-4" />
               Calendário
             </TabsTrigger>
           </TabsList>
 
           <TabsContent value="lista" className="space-y-4">
             {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-secondary mb-3" />
                <span className="text-sm text-muted-foreground">Carregando serviços...</span>
               </div>
             ) : servicos.filter(s => s.status !== "cancelado" && s.status !== "concluido").length === 0 ? (
              <Card className="text-center py-16 border-dashed border-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                  <CalendarDays className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Nenhum serviço agendado</h3>
                <p className="text-muted-foreground text-sm">Novos atendimentos aparecerão aqui</p>
               </Card>
             ) : (
              <div className="space-y-4">
                 {servicos
                   .filter(s => s.status !== "cancelado" && s.status !== "concluido")
                   .map(servico => (
                     <ServicoCard key={servico.id} servico={servico} />
                   ))
                 }
               </div>
             )}
           </TabsContent>
 
          <TabsContent value="calendario" className="space-y-6">
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 gradient-blue" />
              <CardContent className="p-5">
                 <Calendar
                   mode="single"
                   selected={selectedDate}
                   onSelect={(date) => date && setSelectedDate(date)}
                   locale={ptBR}
                  className="pointer-events-auto mx-auto"
                   modifiers={{
                     hasService: diasComServico,
                   }}
                   modifiersStyles={{
                     hasService: {
                      fontWeight: "700",
                      backgroundColor: "hsl(var(--secondary) / 0.15)",
                      color: "hsl(var(--secondary))",
                      borderRadius: "50%",
                     },
                   }}
                 />
               </CardContent>
             </Card>
 
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <CalendarDays className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </h3>
              </div>
 
               {servicosSelecionados.length === 0 ? (
                <Card className="text-center py-10 border-dashed border-2">
                  <p className="text-muted-foreground">Nenhum serviço neste dia</p>
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
     </>
   );
 }