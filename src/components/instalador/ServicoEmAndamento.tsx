 import React, { useState, useRef } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Badge } from "@/components/ui/badge";
 import { PhotoCapture } from "@/components/checklist/PhotoCapture";
 import { SignaturePad, SignaturePadRef } from "@/components/checklist/SignaturePad";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "@/hooks/use-toast";
 import { format } from "date-fns";
 import { ptBR } from "date-fns/locale";
 import {
   Camera,
   Check,
   CheckCircle2,
   Clock,
   ClipboardCheck,
   Loader2,
   MapPin,
   User,
   Calendar,
   Play,
   X,
   ChevronLeft,
   ChevronRight,
   Sun,
   Zap,
   Wifi,
   Wrench,
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 
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
 
 interface ServicoEmAndamentoProps {
   servico: ServicoAgendado;
   onClose: () => void;
   onServiceUpdated: () => void;
 }
 
 const tipoLabels: Record<string, string> = {
   instalacao: "Instalação Solar",
   manutencao: "Manutenção",
   visita_tecnica: "Visita Técnica",
   suporte: "Suporte/Reparo",
 };
 
 export function ServicoEmAndamento({ servico, onClose, onServiceUpdated }: ServicoEmAndamentoProps) {
   const [currentStep, setCurrentStep] = useState(1);
   const [photos, setPhotos] = useState<string[]>(servico.fotos_urls || []);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isSuccess, setIsSuccess] = useState(false);
   
   // Checklist items
   const [checklistItems, setChecklistItems] = useState({
     placas_local_aprovado: false,
     inversor_local_aprovado: false,
     adesivo_inversor: false,
     plaquinha_relogio: false,
     configuracao_wifi: false,
     foto_servico: false,
   });
   
   const [observacoes, setObservacoes] = useState(servico.observacoes_conclusao || "");
   
   // Signatures
   const [clientSignature, setClientSignature] = useState<string | null>(null);
   const [installerSignature, setInstallerSignature] = useState<string | null>(null);
   const clientSignatureRef = useRef<SignaturePadRef>(null);
   const installerSignatureRef = useRef<SignaturePadRef>(null);
 
   const totalSteps = 3;
 
   // Iniciar serviço - registra data/hora de início
   const handleStartService = async () => {
     setIsSubmitting(true);
     try {
       const { error } = await supabase
         .from("servicos_agendados")
         .update({
           status: "em_andamento",
           data_hora_inicio: new Date().toISOString(),
         })
         .eq("id", servico.id);
 
       if (error) throw error;
 
       toast({
         title: "Serviço iniciado!",
         description: `Início registrado às ${format(new Date(), "HH:mm", { locale: ptBR })}`,
       });
       
       onServiceUpdated();
     } catch (error) {
       console.error("Error starting service:", error);
       toast({
         title: "Erro ao iniciar",
         description: "Tente novamente.",
         variant: "destructive",
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
   // Salvar fotos durante o serviço
   const handleSavePhotos = async (newPhotos: string[]) => {
     setPhotos(newPhotos);
     
     try {
       const { error } = await supabase
         .from("servicos_agendados")
         .update({ fotos_urls: newPhotos })
         .eq("id", servico.id);
 
       if (error) throw error;
     } catch (error) {
       console.error("Error saving photos:", error);
     }
   };
 
   // Validar step antes de avançar
   const validateStep = (): boolean => {
     if (currentStep === 1) {
       // Fotos - pelo menos 1 foto é recomendado
       if (photos.length === 0) {
         toast({
           title: "Adicione pelo menos 1 foto",
           description: "Registre o progresso do serviço.",
           variant: "destructive",
         });
         return false;
       }
       return true;
     }
     
     if (currentStep === 2) {
       // Checklist - todos os itens devem ser marcados
       const allChecked = Object.values(checklistItems).every(v => v);
       if (!allChecked) {
         toast({
           title: "Complete o checklist",
           description: "Marque todos os itens antes de continuar.",
           variant: "destructive",
         });
         return false;
       }
       return true;
     }
     
     return true;
   };
 
   const nextStep = () => {
     if (validateStep()) {
       setCurrentStep(prev => Math.min(prev + 1, totalSteps));
     }
   };
 
   const prevStep = () => {
     setCurrentStep(prev => Math.max(prev - 1, 1));
   };
 
   // Concluir serviço
   const handleFinishService = async () => {
     // Validar assinaturas
     const clientSig = clientSignature || clientSignatureRef.current?.getSignatureDataUrl();
     const installerSig = installerSignature || installerSignatureRef.current?.getSignatureDataUrl();
     
     if (!clientSig) {
       toast({
         title: "Assinatura do cliente obrigatória",
         description: "Por favor, peça ao cliente para assinar.",
         variant: "destructive",
       });
       return;
     }
     
     if (!installerSig) {
       toast({
         title: "Assinatura do instalador obrigatória",
         description: "Por favor, assine para concluir.",
         variant: "destructive",
       });
       return;
     }
 
     setIsSubmitting(true);
     try {
       const { error } = await supabase
         .from("servicos_agendados")
         .update({
           status: "concluido",
           data_hora_fim: new Date().toISOString(),
           fotos_urls: photos,
           observacoes_conclusao: observacoes,
         })
         .eq("id", servico.id);
 
       if (error) throw error;
 
       setIsSuccess(true);
       toast({
         title: "Serviço concluído!",
         description: `Finalizado às ${format(new Date(), "HH:mm", { locale: ptBR })}`,
       });
       
       setTimeout(() => {
         onServiceUpdated();
         onClose();
       }, 2000);
     } catch (error) {
       console.error("Error finishing service:", error);
       toast({
         title: "Erro ao concluir",
         description: "Tente novamente.",
         variant: "destructive",
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
   // Tela de início (para serviços agendados)
   if (servico.status === "agendado") {
     return (
       <div className="fixed inset-0 z-50 bg-background">
         <div className="min-h-screen flex flex-col">
           {/* Header */}
           <header className="sticky top-0 z-10 gradient-blue shadow-lg">
             <div className="container mx-auto px-4">
               <div className="flex items-center justify-between h-14">
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={onClose}
                   className="text-white hover:bg-white/10 gap-2"
                 >
                   <ChevronLeft className="h-4 w-4" />
                   Voltar
                 </Button>
                 <span className="text-white font-medium">Iniciar Serviço</span>
                 <div className="w-20" />
               </div>
             </div>
           </header>
 
           {/* Content */}
           <main className="flex-1 container mx-auto px-4 py-6 max-w-md">
             <Card className="border-0 shadow-lg">
               <CardHeader className="text-center pb-2">
                 <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                   <Wrench className="h-8 w-8 text-secondary" />
                 </div>
                 <CardTitle className="text-lg">{tipoLabels[servico.tipo]}</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* Cliente */}
                 {servico.cliente && (
                   <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                     <User className="h-5 w-5 text-secondary" />
                     <div>
                       <p className="font-medium">{servico.cliente.nome}</p>
                       <p className="text-sm text-muted-foreground">{servico.cliente.telefone}</p>
                     </div>
                   </div>
                 )}
                 
                 {/* Endereço */}
                 {(servico.endereco || servico.bairro || servico.cidade) && (
                   <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                     <MapPin className="h-5 w-5 text-secondary mt-0.5" />
                     <span className="text-sm">
                       {[servico.endereco, servico.bairro, servico.cidade].filter(Boolean).join(", ")}
                     </span>
                   </div>
                 )}
                 
                 {/* Data */}
                 <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                   <Calendar className="h-5 w-5 text-secondary" />
                   <span className="text-sm">
                     {format(new Date(servico.data_agendada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                     {servico.hora_inicio && ` às ${servico.hora_inicio.slice(0, 5)}`}
                   </span>
                 </div>
 
                 {/* Descrição */}
                 {servico.descricao && (
                   <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                     {servico.descricao}
                   </p>
                 )}
 
                 {/* Botão Iniciar */}
                 <Button
                   onClick={handleStartService}
                   disabled={isSubmitting}
                   className="w-full bg-success hover:bg-success/90 text-success-foreground h-14 text-lg gap-3"
                 >
                   {isSubmitting ? (
                     <Loader2 className="h-5 w-5 animate-spin" />
                   ) : (
                     <Play className="h-5 w-5" />
                   )}
                   Iniciar Atendimento
                 </Button>
                 
                 <p className="text-xs text-center text-muted-foreground">
                   Data e hora serão registradas automaticamente
                 </p>
               </CardContent>
             </Card>
           </main>
         </div>
       </div>
     );
   }
 
   // Tela de sucesso
   if (isSuccess) {
     return (
       <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
         <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="text-center"
         >
           <motion.div
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ type: "spring", delay: 0.2 }}
             className="w-24 h-24 bg-success rounded-full flex items-center justify-center mx-auto mb-6"
           >
             <CheckCircle2 className="h-12 w-12 text-success-foreground" />
           </motion.div>
           <h2 className="text-2xl font-bold text-success mb-2">Serviço Concluído!</h2>
           <p className="text-muted-foreground">Registro salvo com sucesso</p>
         </motion.div>
       </div>
     );
   }
 
   // Fluxo de execução (serviço em andamento)
   return (
     <div className="fixed inset-0 z-50 bg-background overflow-auto">
       {/* Header */}
       <header className="sticky top-0 z-10 gradient-blue shadow-lg">
         <div className="container mx-auto px-4">
           <div className="flex items-center justify-between h-14">
             <Button
               variant="ghost"
               size="sm"
               onClick={onClose}
               className="text-white hover:bg-white/10 gap-2"
             >
               <X className="h-4 w-4" />
               Fechar
             </Button>
             <div className="text-center">
               <span className="text-white font-medium text-sm">{tipoLabels[servico.tipo]}</span>
               <p className="text-white/70 text-xs">
                 Iniciado às {servico.data_hora_inicio 
                   ? format(new Date(servico.data_hora_inicio), "HH:mm", { locale: ptBR })
                   : "--:--"}
               </p>
             </div>
             <Badge className="bg-warning/20 text-warning border-0">
               <Clock className="h-3 w-3 mr-1" />
               Em andamento
             </Badge>
           </div>
         </div>
       </header>
 
       <main className="container mx-auto px-4 py-6 max-w-lg pb-24">
         {/* Step Indicator */}
         <div className="flex items-center justify-center gap-2 mb-6">
           {[1, 2, 3].map((step) => (
             <div
               key={step}
               className={cn(
                 "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors",
                 currentStep === step
                   ? "bg-secondary text-secondary-foreground"
                   : currentStep > step
                   ? "bg-success text-success-foreground"
                   : "bg-muted text-muted-foreground"
               )}
             >
               {currentStep > step ? <Check className="h-5 w-5" /> : step}
             </div>
           ))}
         </div>
 
         <AnimatePresence mode="wait">
           {/* Step 1: Fotos */}
           {currentStep === 1 && (
             <motion.div
               key="step1"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
             >
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle className="flex items-center gap-2 text-lg">
                     <Camera className="h-5 w-5 text-secondary" />
                     Registro Fotográfico
                   </CardTitle>
                   <p className="text-sm text-muted-foreground">
                     Tire fotos do serviço. Você pode adicionar mais fotos a qualquer momento.
                   </p>
                 </CardHeader>
                 <CardContent>
                   <PhotoCapture
                     photos={photos}
                     onPhotosChange={handleSavePhotos}
                     maxPhotos={20}
                   />
                 </CardContent>
               </Card>
             </motion.div>
           )}
 
           {/* Step 2: Checklist */}
           {currentStep === 2 && (
             <motion.div
               key="step2"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
             >
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle className="flex items-center gap-2 text-lg">
                     <ClipboardCheck className="h-5 w-5 text-secondary" />
                     Checklist do Serviço
                   </CardTitle>
                   <p className="text-sm text-muted-foreground">
                     Marque todos os itens concluídos
                   </p>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {/* Checklist Items */}
                   <div className="space-y-3">
                     <ChecklistItem
                       icon={Sun}
                       title="Placas instaladas no local correto"
                       description="Local com boa exposição solar"
                       checked={checklistItems.placas_local_aprovado}
                       onChange={(checked) => setChecklistItems(prev => ({ ...prev, placas_local_aprovado: checked }))}
                     />
                     
                     <ChecklistItem
                       icon={Zap}
                       title="Inversor instalado corretamente"
                       description="Local seguro e protegido"
                       checked={checklistItems.inversor_local_aprovado}
                       onChange={(checked) => setChecklistItems(prev => ({ ...prev, inversor_local_aprovado: checked }))}
                     />
                     
                     <ChecklistItem
                       icon={Wrench}
                       title="Adesivo do inversor aplicado"
                       description="Identificação visível"
                       checked={checklistItems.adesivo_inversor}
                       onChange={(checked) => setChecklistItems(prev => ({ ...prev, adesivo_inversor: checked }))}
                     />
                     
                     <ChecklistItem
                       icon={Clock}
                       title="Plaquinha do relógio instalada"
                       description="Identificação no medidor"
                       checked={checklistItems.plaquinha_relogio}
                       onChange={(checked) => setChecklistItems(prev => ({ ...prev, plaquinha_relogio: checked }))}
                     />
                     
                     <ChecklistItem
                       icon={Wifi}
                       title="Configuração WiFi do inversor"
                       description="Conectado à rede"
                       checked={checklistItems.configuracao_wifi}
                       onChange={(checked) => setChecklistItems(prev => ({ ...prev, configuracao_wifi: checked }))}
                     />
                     
                     <ChecklistItem
                       icon={Camera}
                       title="Fotos do serviço registradas"
                       description="Documentação visual"
                       checked={checklistItems.foto_servico}
                       onChange={(checked) => setChecklistItems(prev => ({ ...prev, foto_servico: checked }))}
                     />
                   </div>
 
                   {/* Observações */}
                   <div className="space-y-2 pt-4 border-t">
                     <Label>Observações</Label>
                     <Textarea
                       placeholder="Observações sobre o serviço realizado..."
                       value={observacoes}
                       onChange={(e) => setObservacoes(e.target.value)}
                       rows={3}
                     />
                   </div>
                 </CardContent>
               </Card>
             </motion.div>
           )}
 
           {/* Step 3: Assinaturas */}
           {currentStep === 3 && (
             <motion.div
               key="step3"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-4"
             >
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle className="flex items-center gap-2 text-lg">
                     <User className="h-5 w-5 text-secondary" />
                     Assinatura do Cliente
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <SignaturePad
                     ref={clientSignatureRef}
                     label=""
                     onSignatureChange={setClientSignature}
                   />
                 </CardContent>
               </Card>
 
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle className="flex items-center gap-2 text-lg">
                     <Wrench className="h-5 w-5 text-secondary" />
                     Assinatura do Instalador
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <SignaturePad
                     ref={installerSignatureRef}
                     label=""
                     onSignatureChange={setInstallerSignature}
                   />
                 </CardContent>
               </Card>
             </motion.div>
           )}
         </AnimatePresence>
       </main>
 
       {/* Bottom Navigation */}
       <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-bottom">
         <div className="container mx-auto max-w-lg flex gap-3">
           {currentStep > 1 && (
             <Button
               variant="outline"
               onClick={prevStep}
               className="flex-1"
             >
               <ChevronLeft className="h-4 w-4 mr-1" />
               Voltar
             </Button>
           )}
           
           {currentStep < totalSteps ? (
             <Button
               onClick={nextStep}
               className="flex-1 bg-secondary hover:bg-secondary/90"
             >
               Próximo
               <ChevronRight className="h-4 w-4 ml-1" />
             </Button>
           ) : (
             <Button
               onClick={handleFinishService}
               disabled={isSubmitting}
               className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
             >
               {isSubmitting ? (
                 <Loader2 className="h-4 w-4 animate-spin mr-2" />
               ) : (
                 <CheckCircle2 className="h-4 w-4 mr-2" />
               )}
               Concluir Serviço
             </Button>
           )}
         </div>
       </div>
     </div>
   );
 }
 
 // Componente auxiliar para item do checklist
 function ChecklistItem({
   icon: Icon,
   title,
   description,
   checked,
   onChange,
 }: {
   icon: React.ElementType;
   title: string;
   description: string;
   checked: boolean;
   onChange: (checked: boolean) => void;
 }) {
   return (
     <label
       className={cn(
         "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
         checked ? "bg-success/10 border border-success/30" : "bg-muted/50"
       )}
     >
       <Checkbox
         checked={checked}
         onCheckedChange={(c) => onChange(c as boolean)}
         className="mt-0.5"
       />
       <div className="flex-1">
         <div className="flex items-center gap-2">
           <Icon className={cn("h-4 w-4", checked ? "text-success" : "text-muted-foreground")} />
           <span className={cn("font-medium text-sm", checked && "text-success")}>{title}</span>
         </div>
         <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
       </div>
     </label>
   );
 }