import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import {
  Sun,
  TrendingDown,
  DollarSign,
  Calendar,
  Leaf,
  ChevronLeft,
  Loader2,
  Send,
  Zap,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FinancingSimulator from "@/components/FinancingSimulator";
import type { WizardFormData } from "../CalculadoraWizard";

interface StepResultadoProps {
  form: UseFormReturn<WizardFormData>;
  calculations: {
    kWp: number;
    economiaMensal: number;
    economiaAnual: number;
    investimento: number;
    payback: number;
    co2Anual: number;
    contaAtual: number;
    economia25anos: number;
  };
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export function StepResultado({ form, calculations, isSubmitting, onSubmit, onBack }: StepResultadoProps) {
  const nome = form.watch("nome")?.split(" ")[0] || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {nome ? `${nome}, ` : ""}aqui está sua
          <span className="text-primary"> economia</span>! 🎉
        </h2>
        <p className="text-muted-foreground mt-2">
          Veja o quanto você pode economizar com energia solar
        </p>
      </motion.div>

      {/* Main Savings Hero */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-6 text-primary-foreground shadow-[var(--shadow-primary)]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
            <Trophy className="w-4 h-4" />
            Economia Mensal Estimada
          </div>
          <p className="text-5xl md:text-6xl font-bold">
            {formatCurrency(calculations.economiaMensal)}
          </p>
          <div className="flex items-center gap-3 mt-3 text-white/90">
            <span className="text-lg font-semibold">
              {formatCurrency(calculations.economiaAnual)}/ano
            </span>
            <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
              {formatCurrency(calculations.economia25anos)} em 25 anos
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            icon: Sun,
            label: "Potência do Sistema",
            value: `${calculations.kWp.toFixed(1)} kWp`,
            color: "text-secondary",
            borderColor: "border-l-secondary",
          },
          {
            icon: Calendar,
            label: "Retorno do Investimento",
            value: `${calculations.payback.toFixed(1)} anos`,
            color: "text-primary",
            borderColor: "border-l-primary",
          },
          {
            icon: DollarSign,
            label: "Investimento Estimado",
            value: formatCurrency(calculations.investimento),
            color: "text-secondary",
            borderColor: "border-l-secondary",
          },
          {
            icon: Leaf,
            label: "Redução de CO₂",
            value: `${(calculations.co2Anual / 1000).toFixed(1)} ton/ano`,
            color: "text-success",
            borderColor: "border-l-success",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i + 1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`p-4 rounded-xl bg-card border border-border ${stat.borderColor} border-l-4 shadow-[var(--shadow-sm)]`}
          >
            <div className={`flex items-center gap-1.5 ${stat.color} mb-1`}>
              <stat.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Financing Simulator */}
      <motion.div
        custom={5}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <FinancingSimulator
          investimento={calculations.investimento}
          economia={calculations.economiaMensal}
        />
      </motion.div>

      {/* CTA */}
      <motion.div
        custom={6}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full h-16 text-lg rounded-2xl gap-3 bg-gradient-to-r from-primary via-primary to-secondary hover:opacity-90 shadow-[var(--shadow-primary)] transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Receber Orçamento Detalhado
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          📲 Nossa equipe entrará em contato pelo WhatsApp com um orçamento personalizado
        </p>
      </motion.div>

      {/* Back */}
      <div className="flex justify-start">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="gap-1 text-muted-foreground">
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center text-muted-foreground">
        * Valores estimados com base em médias do mercado. O orçamento final pode variar.
      </p>
    </div>
  );
}
