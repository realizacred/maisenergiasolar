import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import { Zap, TrendingDown, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { WizardFormData } from "../CalculadoraWizard";

interface StepConsumoProps {
  form: UseFormReturn<WizardFormData>;
  calculations: {
    contaAtual: number;
    economiaMensal: number;
    economiaAnual: number;
  };
  onNext: () => void;
  onBack: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

export function StepConsumo({ form, calculations, onNext, onBack }: StepConsumoProps) {
  const { setValue, watch } = form;
  const consumo = watch("consumo_mensal") || 350;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        className="text-center px-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
          Qual seu <span className="text-primary">consumo mensal</span>?
        </h2>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Ajuste o slider para o consumo da sua conta de luz (em kWh)
        </p>
      </motion.div>

      {/* Consumo Display */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="inline-flex items-baseline gap-2">
          <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground tabular-nums">
            {consumo}
          </span>
          <span className="text-xl sm:text-2xl text-muted-foreground font-medium">kWh</span>
        </div>
      </motion.div>

      {/* Slider */}
      <motion.div
        className="max-w-lg mx-auto px-2 sm:px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Slider
          value={[consumo]}
          onValueChange={([val]) => setValue("consumo_mensal", val)}
          min={100}
          max={3000}
          step={10}
          className="py-6"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>100 kWh</span>
          <span className="text-primary font-medium hidden sm:inline">
            <Zap className="w-3 h-3 inline mr-0.5" />
            Residencial médio: ~300 kWh
          </span>
          <span>3.000 kWh</span>
        </div>
      </motion.div>

      {/* Results Preview */}
      <motion.div
        className="grid grid-cols-2 gap-3 max-w-lg mx-auto px-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-4 sm:p-5 rounded-2xl bg-destructive/5 border border-destructive/10">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Sua conta atual</p>
          <p className="text-xl sm:text-2xl font-bold text-destructive">
            {formatCurrency(calculations.contaAtual)}
            <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">/mês</span>
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-1 sm:gap-1.5 text-primary mb-1">
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Economia</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-primary">
            {formatCurrency(calculations.economiaMensal)}
            <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">/mês</span>
          </p>
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-lg mx-auto pt-2 px-1">
        <Button type="button" variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-[var(--shadow-primary)] rounded-xl"
        >
          Continuar
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
