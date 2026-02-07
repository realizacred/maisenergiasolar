import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLeadOrcamento } from "@/hooks/useLeadOrcamento";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { formatPhone, ESTADOS_BRASIL, TIPOS_TELHADO, REDES_ATENDIMENTO } from "@/lib/validations";
import { StepContato } from "./steps/StepContato";
import { StepConsumo } from "./steps/StepConsumo";
import { StepImovel } from "./steps/StepImovel";
import { StepResultado } from "./steps/StepResultado";
import { WizardProgress } from "./WizardProgress";
import {
  Sun,
  Zap,
  Home,
  User,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Schema ---
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

const wizardSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  telefone: z.string().trim().regex(phoneRegex, "Telefone inválido. Use (11) 99999-9999"),
  consumo_mensal: z.number().min(100, "Mínimo 100 kWh").max(5000, "Máximo 5000 kWh"),
  estado: z.string().min(2, "Selecione um estado"),
  cidade: z.string().trim().min(2, "Cidade é obrigatória").max(100),
  tipo_telhado: z.string().min(1, "Selecione o tipo de telhado"),
  rede_atendimento: z.string().min(1, "Selecione a rede"),
  area: z.enum(["Urbana", "Rural"], { required_error: "Selecione uma área" }),
});

export type WizardFormData = z.infer<typeof wizardSchema>;

// --- Calculator Config ---
interface CalcConfig {
  tarifa_media_kwh: number;
  custo_por_kwp: number;
  geracao_mensal_por_kwp: number;
  kg_co2_por_kwh: number;
  percentual_economia: number;
}

const DEFAULT_CONFIG: CalcConfig = {
  tarifa_media_kwh: 0.85,
  custo_por_kwp: 4500,
  geracao_mensal_por_kwp: 120,
  kg_co2_por_kwh: 0.084,
  percentual_economia: 95,
};

// --- Steps ---
const STEPS = [
  { id: 1, title: "Seus Dados", icon: User, description: "Para personalizar" },
  { id: 2, title: "Consumo", icon: Zap, description: "Sua conta de luz" },
  { id: 3, title: "Imóvel", icon: Home, description: "Onde instalar" },
  { id: 4, title: "Resultado", icon: Sun, description: "Sua economia" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0, scale: 0.98 }),
};

export function CalculadoraWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [config, setConfig] = useState<CalcConfig>(DEFAULT_CONFIG);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { submitOrcamento } = useLeadOrcamento();

  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    mode: "onBlur",
    defaultValues: {
      nome: "",
      telefone: "",
      consumo_mensal: 350,
      estado: "",
      cidade: "",
      tipo_telhado: "",
      rede_atendimento: "",
      area: undefined,
    },
  });

  const { watch, trigger, formState: { errors } } = form;
  const values = watch();

  // Fetch calculator config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase.rpc("get_calculator_config");
        if (!error && data?.[0]) {
          setConfig(data[0]);
        }
      } catch (e) {
        console.error("Erro ao buscar config:", e);
      }
    };
    fetchConfig();
  }, []);

  // Calculations
  const calculations = useMemo(() => {
    const consumo = values.consumo_mensal || 350;
    const tarifa = config.tarifa_media_kwh;
    const kWp = consumo / config.geracao_mensal_por_kwp;
    const economiaMensal = consumo * tarifa * (config.percentual_economia / 100);
    const economiaAnual = economiaMensal * 12;
    const investimento = kWp * config.custo_por_kwp;
    const payback = investimento / economiaAnual;
    const co2Anual = consumo * config.kg_co2_por_kwh * 12;
    const contaAtual = consumo * tarifa;
    const economia25anos = economiaAnual * 25;

    return {
      kWp,
      economiaMensal,
      economiaAnual,
      investimento,
      payback,
      co2Anual,
      contaAtual,
      economia25anos,
      tarifa,
    };
  }, [values.consumo_mensal, config]);

  // Step validation fields
  const getFieldsForStep = (s: number): (keyof WizardFormData)[] => {
    switch (s) {
      case 1: return ["nome", "telefone"];
      case 2: return ["consumo_mensal"];
      case 3: return ["estado", "cidade", "tipo_telhado", "rede_atendimento", "area"];
      default: return [];
    }
  };

  const nextStep = async () => {
    const fields = getFieldsForStep(step);
    const valid = await trigger(fields);
    if (!valid) {
      toast({
        title: "Preencha todos os campos",
        description: "Complete os campos obrigatórios para continuar.",
        variant: "destructive",
      });
      return;
    }
    if (step < STEPS.length) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
    confetti({ ...defaults, particleCount: 50, spread: 26, startVelocity: 55 });
    confetti({ ...defaults, particleCount: 40, spread: 60 });
    confetti({ ...defaults, particleCount: 70, spread: 100, decay: 0.91, scalar: 0.8 });
    confetti({ ...defaults, particleCount: 20, spread: 120, startVelocity: 25 });
  };

  const handleSubmit = async () => {
    const valid = await trigger();
    if (!valid) return;

    setIsSubmitting(true);

    try {
      const data = form.getValues();

      const result = await submitOrcamento(
        { nome: data.nome.trim(), telefone: data.telefone.trim() },
        {
          estado: data.estado,
          cidade: data.cidade.trim(),
          area: data.area,
          tipo_telhado: data.tipo_telhado,
          rede_atendimento: data.rede_atendimento,
          media_consumo: data.consumo_mensal,
          consumo_previsto: data.consumo_mensal,
          observacoes: `[Simulador Solar] Consumo: ${data.consumo_mensal} kWh | Economia estimada: R$ ${calculations.economiaMensal.toFixed(0)}/mês | Investimento: R$ ${calculations.investimento.toFixed(0)} | Payback: ${calculations.payback.toFixed(1)} anos`,
          vendedor: null, // Lead da plataforma
        },
        { forceNew: false }
      );

      if (result.success) {
        triggerConfetti();
        setIsSuccess(true);
        toast({
          title: "Simulação enviada! ☀️",
          description: "Em breve nossa equipe entrará em contato com seu orçamento detalhado.",
        });
      } else if (result.error === "DUPLICATE_DETECTED") {
        // If duplicate, just force create since this is a public form
        const forceResult = await submitOrcamento(
          { nome: data.nome.trim(), telefone: data.telefone.trim() },
          {
            estado: data.estado,
            cidade: data.cidade.trim(),
            area: data.area,
            tipo_telhado: data.tipo_telhado,
            rede_atendimento: data.rede_atendimento,
            media_consumo: data.consumo_mensal,
            consumo_previsto: data.consumo_mensal,
            observacoes: `[Simulador Solar] Consumo: ${data.consumo_mensal} kWh | Economia estimada: R$ ${calculations.economiaMensal.toFixed(0)}/mês`,
            vendedor: null,
          },
          { forceNew: true }
        );

        if (forceResult.success) {
          triggerConfetti();
          setIsSuccess(true);
          toast({
            title: "Simulação enviada! ☀️",
            description: "Em breve nossa equipe entrará em contato.",
          });
        } else {
          toast({ title: "Erro ao enviar", description: forceResult.error, variant: "destructive" });
        }
      } else {
        toast({ title: "Erro ao enviar", description: result.error, variant: "destructive" });
      }
    } catch (e) {
      console.error("Submit error:", e);
      toast({ title: "Erro inesperado", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isSuccess) {
    return (
      <motion.div
        className="max-w-lg mx-auto text-center py-16 px-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Simulação Enviada!
        </h2>
        <p className="text-muted-foreground text-lg mb-2">
          Obrigado, <span className="font-semibold text-foreground">{values.nome?.split(" ")[0]}</span>!
        </p>
        <p className="text-muted-foreground mb-8">
          Nossa equipe vai preparar um orçamento personalizado e entrará em contato pelo WhatsApp em até 24 horas.
        </p>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border mb-8">
          <p className="text-sm text-muted-foreground mb-1">Sua economia estimada</p>
          <p className="text-4xl font-bold text-primary">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(calculations.economiaMensal)}
            <span className="text-base font-normal text-muted-foreground">/mês</span>
          </p>
        </div>

        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            setIsSuccess(false);
            setStep(1);
            form.reset();
          }}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Fazer Nova Simulação
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <WizardProgress steps={STEPS} currentStep={step} />

      {/* Step Content */}
      <div className="mt-6 sm:mt-8 min-h-[380px] sm:min-h-[420px] relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {step === 1 && (
              <StepContato form={form} onNext={nextStep} />
            )}
            {step === 2 && (
              <StepConsumo
                form={form}
                calculations={calculations}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {step === 3 && (
              <StepImovel form={form} onNext={nextStep} onBack={prevStep} />
            )}
            {step === 4 && (
              <StepResultado
                form={form}
                calculations={calculations}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onBack={prevStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
