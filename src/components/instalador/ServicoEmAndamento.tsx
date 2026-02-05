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
  Upload,
  Image,
  Trash2,
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
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isSuccess, setIsSuccess] = useState(false);
   
  // Checklist items with checkbox and multiple photos
  const [checklistItems, setChecklistItems] = useState<{
    [key: string]: { checked: boolean; photos: string[] };
  }>({
    placas_local_aprovado: { checked: false, photos: [] },
    inversor_local_aprovado: { checked: false, photos: [] },
    adesivo_inversor: { checked: false, photos: [] },
    plaquinha_relogio: { checked: false, photos: [] },
    configuracao_wifi: { checked: false, photos: [] },
   });
   
   const [observacoes, setObservacoes] = useState(servico.observacoes_conclusao || "");
  const [fotosExtras, setFotosExtras] = useState<string[]>([]);
   
   // Signatures
   const [clientSignature, setClientSignature] = useState<string | null>(null);
   const [installerSignature, setInstallerSignature] = useState<string | null>(null);
   const clientSignatureRef = useRef<SignaturePadRef>(null);
   const installerSignatureRef = useRef<SignaturePadRef>(null);
 
  const totalSteps = 2;
 
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
 
  // Handle photo upload for checklist item
  const handlePhotoUpload = async (itemKey: string, files: File[]) => {
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${servico.id}/${itemKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('checklist-assets')
          .upload(fileName, file, { upsert: true });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('checklist-assets')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      setChecklistItems(prev => ({
        ...prev,
        [itemKey]: { 
          ...prev[itemKey], 
          photos: [...prev[itemKey].photos, ...uploadedUrls]
        }
      }));

      toast({
        title: "Foto(s) anexada(s)",
        description: `${files.length} foto(s) salva(s) com sucesso.`,
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Erro ao enviar foto",
        description: "Tente novamente.",
        variant: "destructive",
      });
     }
   };
 
  // Remove photo from checklist item by index
  const handleRemovePhoto = (itemKey: string, photoIndex: number) => {
    setChecklistItems(prev => ({
      ...prev,
      [itemKey]: { 
        ...prev[itemKey], 
        photos: prev[itemKey].photos.filter((_, i) => i !== photoIndex)
      }
    }));
  };

  // Toggle checkbox
  const handleToggleChecked = (itemKey: string, checked: boolean) => {
    setChecklistItems(prev => ({
      ...prev,
      [itemKey]: { ...prev[itemKey], checked }
    }));
  };

   // Validar step antes de avançar
   const validateStep = (): boolean => {
     if (currentStep === 1) {
      // Checklist - todos os itens devem estar marcados e ter pelo menos 1 foto
      const allComplete = Object.values(checklistItems).every(item => item.checked && item.photos.length > 0);
      if (!allComplete) {
         toast({
          title: "Complete o checklist",
          description: "Marque todos os itens e anexe pelo menos uma foto em cada.",
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
 
    // Collect all photos from checklist items
    const allPhotos = Object.values(checklistItems)
      .flatMap(item => item.photos)
      .concat(fotosExtras);

     setIsSubmitting(true);
     try {
       const { error } = await supabase
         .from("servicos_agendados")
         .update({
           status: "concluido",
           data_hora_fim: new Date().toISOString(),
          fotos_urls: allPhotos,
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
          {[1, 2].map((step) => (
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
          {/* Step 1: Checklist com Fotos */}
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
                    <ClipboardCheck className="h-5 w-5 text-secondary" />
                    Checklist do Serviço
                   </CardTitle>
                   <p className="text-sm text-muted-foreground">
                    Anexe uma foto para cada item do checklist
                   </p>
                 </CardHeader>
                <CardContent className="space-y-4">
                  <ChecklistItemWithPhoto
                    icon={Sun}
                    title="Placas instaladas no local correto"
                    description="Local com boa exposição solar"
                    item={checklistItems.placas_local_aprovado}
                    onPhotoUpload={(files) => handlePhotoUpload('placas_local_aprovado', files)}
                    onRemovePhoto={(index) => handleRemovePhoto('placas_local_aprovado', index)}
                    onToggleChecked={(checked) => handleToggleChecked('placas_local_aprovado', checked)}
                  />
                  
                  <ChecklistItemWithPhoto
                    icon={Zap}
                    title="Inversor instalado corretamente"
                    description="Local seguro e protegido"
                    item={checklistItems.inversor_local_aprovado}
                    onPhotoUpload={(files) => handlePhotoUpload('inversor_local_aprovado', files)}
                    onRemovePhoto={(index) => handleRemovePhoto('inversor_local_aprovado', index)}
                    onToggleChecked={(checked) => handleToggleChecked('inversor_local_aprovado', checked)}
                  />
                  
                  <ChecklistItemWithPhoto
                    icon={Wrench}
                    title="Adesivo do inversor aplicado"
                    description="Identificação visível"
                    item={checklistItems.adesivo_inversor}
                    onPhotoUpload={(files) => handlePhotoUpload('adesivo_inversor', files)}
                    onRemovePhoto={(index) => handleRemovePhoto('adesivo_inversor', index)}
                    onToggleChecked={(checked) => handleToggleChecked('adesivo_inversor', checked)}
                  />
                  
                  <ChecklistItemWithPhoto
                    icon={Clock}
                    title="Plaquinha do relógio instalada"
                    description="Identificação no medidor"
                    item={checklistItems.plaquinha_relogio}
                    onPhotoUpload={(files) => handlePhotoUpload('plaquinha_relogio', files)}
                    onRemovePhoto={(index) => handleRemovePhoto('plaquinha_relogio', index)}
                    onToggleChecked={(checked) => handleToggleChecked('plaquinha_relogio', checked)}
                   />
                  
                  <ChecklistItemWithPhoto
                    icon={Wifi}
                    title="Configuração WiFi do inversor"
                    description="Conectado à rede"
                    item={checklistItems.configuracao_wifi}
                    onPhotoUpload={(files) => handlePhotoUpload('configuracao_wifi', files)}
                    onRemovePhoto={(index) => handleRemovePhoto('configuracao_wifi', index)}
                    onToggleChecked={(checked) => handleToggleChecked('configuracao_wifi', checked)}
                  />

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

                  {/* Fotos Extras */}
                  <div className="space-y-2 pt-4 border-t">
                    <Label className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Fotos Extras (Opcional)
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Adicione fotos adicionais que não se encaixam nas categorias acima
                    </p>
                    <PhotoCapture
                      photos={fotosExtras}
                      onPhotosChange={setFotosExtras}
                      maxPhotos={10}
                    />
                  </div>
                 </CardContent>
               </Card>
             </motion.div>
           )}
 
          {/* Step 2: Assinaturas */}
           {currentStep === 2 && (
             <motion.div
               key="step2"
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
 
// Componente auxiliar para item do checklist com foto
function ChecklistItemWithPhoto({
   icon: Icon,
   title,
   description,
  item,
  onPhotoUpload,
  onRemovePhoto,
  onToggleChecked,
 }: {
   icon: React.ElementType;
   title: string;
   description: string;
  item: { checked: boolean; photos: string[] };
  onPhotoUpload: (files: File[]) => void;
  onRemovePhoto: (index: number) => void;
  onToggleChecked: (checked: boolean) => void;
 }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onPhotoUpload(Array.from(files));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

   return (
    <div
      className={cn(
        "p-3 rounded-lg transition-colors",
        item.checked && item.photos.length > 0 ? "bg-success/10 border border-success/30" : "bg-muted/50"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={item.checked}
          onCheckedChange={(checked) => onToggleChecked(checked as boolean)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={cn("h-4 w-4", item.checked ? "text-success" : "text-muted-foreground")} />
            <span className={cn("font-medium text-sm", item.checked && "text-success")}>{title}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          
          {/* Photos grid */}
          {item.photos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {item.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img 
                    src={photo} 
                    alt={`${title} ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => onRemovePhoto(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add photo button */}
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              {item.photos.length > 0 ? "Adicionar mais fotos" : "Anexar Foto"}
            </Button>
          </div>
        </div>
       </div>
    </div>
   );
 }