import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SignaturePad, SignaturePadRef } from "./SignaturePad";
import { PhotoCapture } from "./PhotoCapture";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Calendar, 
  User, 
  Check, 
  WifiOff, 
  Wifi,
  CloudUpload,
  Loader2,
  CheckCircle2,
  Sun,
  Zap,
  ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const checklistSchema = z.object({
  data_instalacao: z.string().min(1, "Data obrigatória"),
  endereco: z.string().min(3, "Endereço obrigatório"),
  bairro: z.string().optional(),
  lead_code: z.string().optional(),
  
  // Área do cliente
  placas_local_aprovado: z.boolean(),
  inversor_local_aprovado: z.boolean(),
  avaliacao_atendimento: z.enum(["otimo", "bom", "razoavel", "ruim", "muito_ruim"], {
    required_error: "Selecione uma avaliação"
  }),
  nome_cliente: z.string().min(2, "Nome do cliente obrigatório"),
  
  // Área do instalador
  adesivo_inversor: z.boolean(),
  plaquinha_relogio: z.boolean(),
  configuracao_wifi: z.boolean(),
  foto_servico: z.boolean(),
  observacoes: z.string().optional(),
});

type ChecklistFormData = z.infer<typeof checklistSchema>;

interface ChecklistFormProps {
  onSuccess?: () => void;
}

export function ChecklistForm({ onSuccess }: ChecklistFormProps) {
  const { user } = useAuth();
  const { isOnline, pendingCount, isSyncing, saveChecklist, syncPendingChecklists } = useOfflineSync();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Store signatures in state to persist across step changes
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [installerSignature, setInstallerSignature] = useState<string | null>(null);
  
  const clientSignatureRef = useRef<SignaturePadRef>(null);
  const installerSignatureRef = useRef<SignaturePadRef>(null);

  const form = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      data_instalacao: new Date().toISOString().split("T")[0],
      endereco: "",
      bairro: "",
      lead_code: "",
      placas_local_aprovado: false,
      inversor_local_aprovado: false,
      nome_cliente: "",
      adesivo_inversor: false,
      plaquinha_relogio: false,
      configuracao_wifi: false,
      foto_servico: false,
      observacoes: "",
    },
  });

  const onSubmit = async (formData: ChecklistFormData) => {
    // Permite envio mesmo sem usuário logado (formulário público)

    // Get signatures from state (already saved when user drew them)
    if (!clientSignature) {
      toast({
        title: "Assinatura do cliente obrigatória",
        description: "Por favor, peça ao cliente para assinar.",
        variant: "destructive",
      });
      setCurrentStep(2); // Go back to client step
      return;
    }

    if (!installerSignature) {
      toast({
        title: "Assinatura do instalador obrigatória",
        description: "Por favor, assine o checklist.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await saveChecklist({
        data_instalacao: formData.data_instalacao,
        endereco: formData.endereco,
        bairro: formData.bairro,
        lead_code: formData.lead_code,
        placas_local_aprovado: formData.placas_local_aprovado,
        inversor_local_aprovado: formData.inversor_local_aprovado,
        avaliacao_atendimento: formData.avaliacao_atendimento,
        nome_cliente: formData.nome_cliente,
        adesivo_inversor: formData.adesivo_inversor,
        plaquinha_relogio: formData.plaquinha_relogio,
        configuracao_wifi: formData.configuracao_wifi,
        foto_servico: formData.foto_servico,
        observacoes: formData.observacoes,
        fotos_urls: photos,
        // Usa ID do usuário logado ou ID público para submissões anônimas
        instalador_id: user?.id || "00000000-0000-0000-0000-000000000000",
      });

      if (result.success) {
        setIsSuccess(true);
        toast({
          title: result.offline ? "Salvo offline" : "Checklist enviado!",
          description: result.offline 
            ? "Será sincronizado quando você estiver online."
            : "O checklist foi registrado com sucesso.",
        });
        
        setTimeout(() => {
          form.reset();
          setPhotos([]);
          setClientSignature(null);
          setInstallerSignature(null);
          clientSignatureRef.current?.clear();
          installerSignatureRef.current?.clear();
          setCurrentStep(1);
          setIsSuccess(false);
          onSuccess?.();
        }, 2000);
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep1 = (): boolean => {
    const data = form.getValues();
    const errors: string[] = [];
    
    if (!data.data_instalacao) {
      errors.push("Data da instalação");
    }
    if (!data.endereco || data.endereco.length < 3) {
      errors.push("Endereço");
    }
    
    if (errors.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Preencha: ${errors.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    const data = form.getValues();
    const errors: string[] = [];
    
    if (!data.nome_cliente || data.nome_cliente.length < 2) {
      errors.push("Nome do cliente");
    }
    if (!data.avaliacao_atendimento) {
      errors.push("Avaliação do atendimento");
    }
    
    // Save current signature state
    if (clientSignatureRef.current) {
      const sig = clientSignatureRef.current.getSignatureDataUrl();
      if (sig) setClientSignature(sig);
    }
    
    if (!clientSignature && !clientSignatureRef.current?.getSignatureDataUrl()) {
      errors.push("Assinatura do cliente");
    }
    
    if (errors.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Preencha: ${errors.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    // Validate current step before advancing
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    
    if (currentStep === 2 && !validateStep2()) {
      return;
    }
    
    // Save client signature before moving to next step
    if (currentStep === 2 && clientSignatureRef.current) {
      const sig = clientSignatureRef.current.getSignatureDataUrl();
      if (sig) setClientSignature(sig);
    }
    
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    // Save installer signature before going back
    if (currentStep === 3 && installerSignatureRef.current) {
      const sig = installerSignatureRef.current.getSignatureDataUrl();
      if (sig) setInstallerSignature(sig);
    }
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const avaliacaoOptions = [
    { value: "otimo", label: "Ótimo", emoji: "😄" },
    { value: "bom", label: "Bom", emoji: "🙂" },
    { value: "razoavel", label: "Razoável", emoji: "😐" },
    { value: "ruim", label: "Ruim", emoji: "😕" },
    { value: "muito_ruim", label: "Muito Ruim", emoji: "😞" },
  ];

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="h-10 w-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-green-600">Checklist Enviado!</h2>
        <p className="text-muted-foreground mt-2">Preparando novo formulário...</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-500" />
          )}
          <span className="text-sm">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
        
        {pendingCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={syncPendingChecklists}
            disabled={!isOnline || isSyncing}
            className="gap-1"
          >
            {isSyncing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CloudUpload className="h-3 w-3" />
            )}
            Sincronizar ({pendingCount})
          </Button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors",
              currentStep === step
                ? "bg-primary text-primary-foreground"
                : currentStep > step
                ? "bg-green-500 text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {currentStep > step ? <Check className="h-5 w-5" /> : step}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Info da Instalação */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Dados da Instalação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_instalacao">Data</Label>
                    <Input
                      id="data_instalacao"
                      type="date"
                      {...form.register("data_instalacao")}
                    />
                    {form.formState.errors.data_instalacao && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.data_instalacao.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead_code">Código do Lead</Label>
                    <Input
                      id="lead_code"
                      placeholder="LEAD-XXX"
                      {...form.register("lead_code")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, número..."
                    {...form.register("endereco")}
                  />
                  {form.formState.errors.endereco && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.endereco.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    placeholder="Nome do bairro"
                    {...form.register("bairro")}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="button" onClick={nextStep} className="w-full">
              Próximo
            </Button>
          </motion.div>
        )}

        {/* Step 2: Área do Cliente */}
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
                  <User className="h-5 w-5 text-primary" />
                  Área do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome_cliente">Nome do Cliente</Label>
                  <Input
                    id="nome_cliente"
                    placeholder="Nome completo"
                    {...form.register("nome_cliente")}
                  />
                  {form.formState.errors.nome_cliente && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.nome_cliente.message}
                    </p>
                  )}
                </div>

                {/* Checklist items */}
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <Sun className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Localização das Placas</p>
                        <p className="text-xs text-muted-foreground">
                          As placas foram instaladas no local acordado e adequado em termos de exposição solar?
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 pl-7">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={form.watch("placas_local_aprovado")}
                          onCheckedChange={(checked) => 
                            form.setValue("placas_local_aprovado", checked as boolean)
                          }
                        />
                        <span className="text-sm">Sim</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Instalação do Inversor</p>
                        <p className="text-xs text-muted-foreground">
                          O inversor foi instalado em local seguro e protegido contra intempéries?
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 pl-7">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={form.watch("inversor_local_aprovado")}
                          onCheckedChange={(checked) => 
                            form.setValue("inversor_local_aprovado", checked as boolean)
                          }
                        />
                        <span className="text-sm">Sim</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Avaliação */}
                <div className="space-y-3">
                  <Label>Como você avalia o nosso atendimento?</Label>
                  <RadioGroup
                    value={form.watch("avaliacao_atendimento")}
                    onValueChange={(value) => 
                      form.setValue("avaliacao_atendimento", value as any)
                    }
                    className="flex flex-wrap gap-2"
                  >
                    {avaliacaoOptions.map((option) => (
                      <Label
                        key={option.value}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                          form.watch("avaliacao_atendimento") === option.value
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                        )}
                      >
                        <RadioGroupItem value={option.value} className="sr-only" />
                        <span>{option.emoji}</span>
                        <span className="text-sm">{option.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                  {form.formState.errors.avaliacao_atendimento && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.avaliacao_atendimento.message}
                    </p>
                  )}
                </div>

                {/* Declaração de aceitação */}
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Declaração de Aceitação:</strong> Eu declaro que todas as etapas 
                    da instalação do sistema fotovoltaico foram realizadas conforme descrito 
                    acima e que estou plenamente satisfeito com a execução dos serviços.
                  </p>
                </div>

                {/* Assinatura do cliente */}
                <SignaturePad
                  ref={clientSignatureRef}
                  label="Assinatura do Cliente"
                  onSignatureChange={(sig) => setClientSignature(sig)}
                />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                Voltar
              </Button>
              <Button type="button" onClick={nextStep} className="flex-1">
                Próximo
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Área do Instalador */}
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
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Área do Instalador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Checklist do instalador */}
                <div className="space-y-3">
                  {[
                    { name: "adesivo_inversor" as const, label: "Foi colado o adesivo no inversor?" },
                    { name: "plaquinha_relogio" as const, label: "Foi colada a plaquinha no relógio?" },
                    { name: "configuracao_wifi" as const, label: "Foi feita a configuração do wi-fi?" },
                    { name: "foto_servico" as const, label: "Tirou foto do serviço?" },
                  ].map((item) => (
                    <label
                      key={item.name}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    >
                      <Checkbox
                        checked={form.watch(item.name)}
                        onCheckedChange={(checked) => 
                          form.setValue(item.name, checked as boolean)
                        }
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>

                {/* Fotos */}
                <PhotoCapture
                  photos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={5}
                />

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações adicionais..."
                    rows={3}
                    {...form.register("observacoes")}
                  />
                </div>

                {/* Assinatura do instalador */}
                <SignaturePad
                  ref={installerSignatureRef}
                  label="Assinatura do Instalador"
                  onSignatureChange={(sig) => setInstallerSignature(sig)}
                />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                Voltar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Finalizar
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
